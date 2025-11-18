import express from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import WishJar from "../models/WishJar";
import Pledge from "../models/Pledge";
import Proof from "../models/Proof";
import Vote from "../models/Vote";
import User from "../models/User";
import { uploadToIPFS } from "../services/storage";
import { authenticate, AuthRequest } from "../middleware/auth";
import { createNotification } from "../services/notification";
import { addDeadlineNotification } from "../services/queue";
import { isFeatureEnabled } from "../services/featureFlags";
import { getCache, setCache } from "../services/cache";
import { logAction } from "../services/audit";
import { triggerWebhooks } from "../services/webhook";
import { trackEvent } from "../services/analytics";
import { moderateContent } from "../services/moderation";
import {
  validateCreateWish,
  validatePledge,
  validateProof,
  validateVote,
  validateId,
  validateWishId,
  validateProofId,
  validatePagination,
  validateSearch,
} from "../middleware/validation";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Rate limiters
const pledgeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 pledges per minute
  message: "Too many pledges, please try again later.",
});

const voteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 votes per minute
  message: "Too many votes, please try again later.",
});

// POST /wish
router.post(
  "/",
  authenticate,
  validateCreateWish,
  async (req: AuthRequest, res) => {
    const {
      title,
      description,
      category,
      stakeAmount,
      deadline,
      validatorMode,
      metadataURI,
      validators,
    } = req.body;

    // Moderate content
    const titleModeration = moderateContent(title);
    const descModeration = moderateContent(description);

    if (!titleModeration.approved) {
      return res.status(400).json({ error: titleModeration.reason });
    }
    if (!descModeration.approved) {
      return res.status(400).json({ error: descModeration.reason });
    }

    // Deploy contract on TON (mock implementation)
    // In production, deploy WishJar contract and get address
    const contractAddress = `0:${Date.now().toString(16)}`; // Mock address

    const wishJar = new WishJar({
      ownerId: req.userId,
      title,
      description,
      category,
      contractAddress,
      stakeAmount,
      deadline: new Date(deadline),
      validatorMode,
      validators,
    });

    // Create metadata and upload to IPFS
    const metadata = {
      title,
      description,
      category,
      stakeAmount,
      deadline: new Date(deadline).toISOString(),
      validatorMode,
      validators: validators || [],
      createdAt: new Date().toISOString(),
    };
    const metadataBuffer = Buffer.from(JSON.stringify(metadata));
    const generatedMetadataURI = await uploadToIPFS(
      metadataBuffer,
      `metadata-${Date.now()}.json`,
    );
    wishJar.metadataURI = metadataURI || generatedMetadataURI;

    await wishJar.save();

    // Audit log
    await logAction(
      req.userId,
      "create",
      "wish",
      wishJar._id.toString(),
      { title, stakeAmount },
      req,
    );

    // Schedule deadline notification (1 day before)
    const deadlineMs = new Date(deadline).getTime();
    const notifyTime = deadlineMs - 24 * 60 * 60 * 1000; // 1 day before
    const delay = Math.max(0, notifyTime - Date.now());
    addDeadlineNotification(wishJar._id.toString(), delay);

    res.json({ wishJar });
  },
);

// GET /wish/my (user's own wishes)
router.get("/my", authenticate, async (req: AuthRequest, res) => {
  const wishes = await WishJar.find({
    ownerId: req.userId,
    deletedAt: { $exists: false },
  })
    .populate("ownerId", "displayName walletAddress")
    .sort({ createdAt: -1 });

  res.json({ wishes });
});

// GET /wish/:id
router.get("/:id", async (req, res) => {
  const wish = await WishJar.findOne({
    _id: req.params.id,
    deletedAt: { $exists: false },
  }).populate("ownerId", "displayName walletAddress avatarUrl");

  if (!wish) {
    return res.status(404).json({ error: "Wish not found" });
  }

  const pledges = await Pledge.find({ wishJarId: req.params.id })
    .populate("supporterId", "displayName walletAddress avatarUrl")
    .sort({ createdAt: -1 });

  const proofsRaw = await Proof.find({ wishJarId: req.params.id })
    .populate("uploaderId", "displayName walletAddress avatarUrl")
    .sort({ createdAt: -1 });

  const proofs = await Promise.all(
    proofsRaw.map(async (proof) => {
      const votes = await Vote.find({ proofId: proof._id });
      const yesCount = votes.filter((v) => v.choice === "yes").length;
      const noCount = votes.filter((v) => v.choice === "no").length;
      return {
        ...proof.toObject(),
        voteCounts: { yes: yesCount, no: noCount },
      };
    }),
  );

  res.json({ wish, pledges, proofs });
});

// GET /wish (list all with cursor-based pagination and filtering)
router.get("/", validatePagination, validateSearch, async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const cursor = req.query.cursor as string;

  const filter: any = { deletedAt: { $exists: false } };

  // Status filter
  if (req.query.status && req.query.status !== "all") {
    filter.status = req.query.status;
  }

  // Category filter
  if (req.query.category && req.query.category !== "all") {
    filter.category = req.query.category;
  }

  // Search filter
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  // Stake range filter
  if (req.query.minStake || req.query.maxStake) {
    filter.stakeAmount = {};
    if (req.query.minStake) {
      filter.stakeAmount.$gte = parseInt(req.query.minStake as string);
    }
    if (req.query.maxStake) {
      filter.stakeAmount.$lte = parseInt(req.query.maxStake as string);
    }
  }

  // Date range filter
  if (req.query.dateRange && req.query.dateRange !== "all") {
    const now = new Date();
    let startDate: Date;

    switch (req.query.dateRange) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    if (req.query.dateRange !== "all") {
      filter.createdAt = { $gte: startDate };
    }
  }

  // Sort options
  let sortOption: any = { _id: -1 }; // Default: newest
  if (req.query.sortBy) {
    switch (req.query.sortBy) {
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "pledged-high":
        sortOption = { pledgedAmount: -1 };
        break;
      case "pledged-low":
        sortOption = { pledgedAmount: 1 };
        break;
      case "goal-high":
        sortOption = { stakeAmount: -1 };
        break;
      case "goal-low":
        sortOption = { stakeAmount: 1 };
        break;
      default:
        sortOption = { _id: -1 };
    }
  }

  // Cursor filter
  if (cursor) {
    filter._id = { $lt: cursor };
  }

  const wishes = await WishJar.find(filter)
    .populate("ownerId", "displayName walletAddress")
    .sort(sortOption)
    .limit(limit + 1); // +1 to check if there are more

  const hasNextPage = wishes.length > limit;
  const results = hasNextPage ? wishes.slice(0, -1) : wishes;
  const nextCursor = hasNextPage ? results[results.length - 1]._id : null;

  res.json({
    wishes: results,
    pagination: {
      hasNextPage,
      nextCursor,
      limit,
    },
  });
});

// POST /wish/:id/pledge
router.post(
  "/:id/pledge",
  pledgeLimiter,
  authenticate,
  validateId,
  validatePledge,
  async (req: AuthRequest, res) => {
    const { amount } = req.body;

    // Handle TON transaction (mock implementation)
    // In production, verify TON transaction

    const pledge = new Pledge({
      wishJarId: req.params.id,
      supporterId: req.userId,
      amount,
      txHash: "mock_tx_hash",
    });

    await pledge.save();

    // Audit log
    await logAction(
      req.userId,
      "pledge",
      "wish",
      req.params.id,
      { amount },
      req,
    );

    // Track analytics
    await trackEvent(
      "pledge_created",
      req.userId,
      { wishId: req.params.id, amount },
      req,
    );

    // Notify wish owner
    if (isFeatureEnabled("notifications")) {
      const wishJar = await WishJar.findById(req.params.id);
      const pledger = await User.findById(req.userId);
      if (wishJar) {
        await createNotification(
          wishJar.ownerId.toString(),
          "pledge",
          `Someone pledged ${amount} TON to your wish "${wishJar.title}"`,
          {
            pledgerName:
              pledger?.displayName ||
              pledger?.walletAddress?.slice(0, 6) + "..." ||
              "Anonymous",
            amount,
            wishTitle: wishJar.title,
            wishId: wishJar._id.toString(),
          },
        );
      }
    }

    // Emit real-time event
    (global as any).io?.to(`wish-${req.params.id}`).emit("new-pledge", {
      wishId: req.params.id,
      amount,
      supporterId: req.userId,
    });

    // Trigger webhooks
    await triggerWebhooks("pledge.created", {
      wishId: req.params.id,
      amount,
      supporterId: req.userId,
    });

    res.json({ status: "success", pledge });
  },
);

// DELETE /wish/:id (soft delete)
router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  const wishJar = await WishJar.findById(req.params.id);
  if (!wishJar) return res.status(404).json({ error: "WishJar not found" });

  if (wishJar.ownerId.toString() !== req.userId) {
    return res.status(403).json({ error: "Not authorized" });
  }

  wishJar.deletedAt = new Date();
  await wishJar.save();

  res.json({ message: "Wish deleted" });
});

// POST /wish/:id/start-vote
router.post("/:id/start-vote", authenticate, async (req: AuthRequest, res) => {
  // Check if owner or validator (mock implementation)
  const wishJar = await WishJar.findById(req.params.id);
  if (!wishJar || wishJar.ownerId.toString() !== req.userId) {
    return res.status(403).json({ error: "Not authorized" });
  }
  res.json({ voteSessionId: "mock_session" });
});

// POST /wish/:wishId/proof/:proofId/vote
router.post(
  "/:wishId/proof/:proofId/vote",
  voteLimiter,
  authenticate,
  validateWishId,
  validateProofId,
  validateVote,
  async (req: AuthRequest, res) => {
    const { choice } = req.body;

    // Check if proof exists and belongs to wish
    const proof = await Proof.findById(req.params.proofId);
    if (!proof || proof.wishJarId.toString() !== req.params.wishId) {
      return res.status(404).json({ error: "Proof not found" });
    }

    const vote = new Vote({
      wishJarId: req.params.wishId,
      proofId: req.params.proofId,
      voterId: req.userId,
      choice,
    });

    await vote.save();

    const votes = await Vote.find({ proofId: req.params.proofId });
    const yesCount = votes.filter((v) => v.choice === "yes").length;
    const noCount = votes.filter((v) => v.choice === "no").length;
    const totalVotes = yesCount + noCount;

    // Resolve if total votes >= 5 and majority
    if (totalVotes >= 5) {
      const wish = await WishJar.findById(req.params.wishId);
      if (wish && wish.status === "Active") {
        if (yesCount > noCount) {
          wish.status = "ResolvedSuccess";
        } else {
          wish.status = "ResolvedFail";
        }
        await wish.save();

        // Notify owner
        if (isFeatureEnabled("notifications")) {
          await createNotification(
            wish.ownerId.toString(),
            "resolution",
            `Your wish "${wish.title}" has been resolved as ${wish.status === "ResolvedSuccess" ? "successful" : "failed"}`,
            {
              wishTitle: wish.title,
              status:
                wish.status === "ResolvedSuccess" ? "successful" : "failed",
              wishId: wish._id.toString(),
            },
          );
        }
      }
    }

    res.json({
      status: "success",
      currentCounts: { yes: yesCount, no: noCount },
    });
  },
);

// POST /wish/:id/proof
router.post(
  "/:id/proof",
  authenticate,
  validateId,
  upload.single("mediaFile"),
  validateProof,
  async (req: AuthRequest, res) => {
    const wish = await WishJar.findById(req.params.id);
    if (!wish) return res.status(404).json({ error: "Wish not found" });

    if (wish.ownerId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ error: "Only wish owner can upload proof" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Media file required" });
    }

    // Upload to IPFS
    const mediaURI = await uploadToIPFS(req.file.buffer, req.file.originalname);

    // For hash, calculate actual hash
    const crypto = require("crypto");
    const mediaHash = crypto
      .createHash("sha256")
      .update(req.file.buffer)
      .digest("hex");

    const proof = new Proof({
      wishJarId: req.params.id,
      uploaderId: req.userId,
      mediaURI,
      mediaHash,
      caption: req.body.caption,
    });

    await proof.save();

    // Audit log
    await logAction(
      req.userId,
      "upload",
      "proof",
      proof._id.toString(),
      { wishId: req.params.id },
      req,
    );

    res.json({ proof });
  },
);

// GET /wish/stats (global statistics)
router.get("/stats", async (req, res) => {
  const cacheKey = "stats";
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const totalWishes = await WishJar.countDocuments({
    deletedAt: { $exists: false },
  });
  const activeWishes = await WishJar.countDocuments({
    status: "Active",
    deletedAt: { $exists: false },
  });
  const resolvedSuccess = await WishJar.countDocuments({
    status: "ResolvedSuccess",
    deletedAt: { $exists: false },
  });
  const resolvedFail = await WishJar.countDocuments({
    status: "ResolvedFail",
    deletedAt: { $exists: false },
  });
  const totalPledged = await Pledge.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalUsers = await User.countDocuments({
    deletedAt: { $exists: false },
  });

  const stats = {
    totalWishes,
    activeWishes,
    resolvedSuccess,
    resolvedFail,
    totalPledged: totalPledged[0]?.total || 0,
    totalUsers,
  };

  await setCache(cacheKey, JSON.stringify(stats), 300); // 5 minutes

  res.json(stats);
});

// GET /wish/leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find({ deletedAt: { $exists: false } });
    const leaderboard = await Promise.all(
      users.map(async (user) => {
        const userWishJars = await WishJar.find({
          ownerId: user._id,
          deletedAt: { $exists: false },
        });
        const pledges = await Pledge.find({
          supporterId: user._id,
        });
        const totalPledged = pledges.reduce((sum, p) => sum + p.amount, 0);
        const dreamsCreated = userWishJars.length;
        const successfulDreams = userWishJars.filter(
          (j) => j.status === "ResolvedSuccess",
        ).length;
        const successRate =
          dreamsCreated > 0
            ? Math.round((successfulDreams / dreamsCreated) * 100)
            : 0;

        return {
          user: {
            displayName: user.displayName,
            walletAddress: user.walletAddress,
            avatarUrl: user.avatarUrl,
          },
          totalPledged,
          dreamsCreated,
          successRate,
        };
      }),
    );

    // Sort by totalPledged descending
    leaderboard.sort((a, b) => b.totalPledged - a.totalPledged);
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    res.json(rankedLeaderboard);
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
