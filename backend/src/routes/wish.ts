import express from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
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
  [
    body("title")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be 3-100 characters"),
    body("description")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Description must be 10-1000 characters"),
    body("stakeAmount")
      .isFloat({ min: 0.01 })
      .withMessage("Stake amount must be at least 0.01"),
    body("deadline")
      .isISO8601()
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error("Deadline must be in the future");
        }
        return true;
      })
      .withMessage("Invalid deadline date"),
    body("validatorMode")
      .isIn(["community", "designatedValidators"])
      .withMessage("Invalid validator mode"),
  ],
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
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

  const proofs = await Proof.find({ wishJarId: req.params.id })
    .populate("uploaderId", "displayName walletAddress avatarUrl")
    .sort({ createdAt: -1 });

  res.json({ wish, pledges, proofs });
});

// GET /wish (list all with cursor-based pagination and filtering)
router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const cursor = req.query.cursor as string;

  const filter: any = { deletedAt: { $exists: false } };

  // Status filter
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Search filter
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  // Cursor filter
  if (cursor) {
    filter._id = { $lt: cursor };
  }

  const wishes = await WishJar.find(filter)
    .populate("ownerId", "displayName walletAddress")
    .sort({ _id: -1 })
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
  [
    body("amount")
      .isFloat({ min: 0.01 })
      .withMessage("Pledge amount must be at least 0.01"),
  ],
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
    await trackEvent("pledge_created", req.userId, { wishId: req.params.id, amount }, req);

    // Notify wish owner
    if (isFeatureEnabled("notifications")) {
      const wishJar = await WishJar.findById(req.params.id);
      if (wishJar) {
        await createNotification(
          wishJar.ownerId.toString(),
          "pledge",
          `Someone pledged ${amount} TON to your wish "${wishJar.title}"`,
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
  [
    body("choice")
      .isIn(["yes", "no"])
      .withMessage("Choice must be 'yes' or 'no'"),
  ],
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
  upload.single('media'),
  [
    body("caption").optional().trim().isLength({ max: 500 }).withMessage("Caption too long"),
  ],
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const wish = await WishJar.findById(req.params.id);
    if (!wish) return res.status(404).json({ error: "Wish not found" });

    if (wish.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: "Only wish owner can upload proof" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Media file required" });
    }

    // Upload to IPFS
    const mediaURI = await uploadToIPFS(req.file.buffer, req.file.originalname);

    // For hash, calculate actual hash
    const crypto = require('crypto');
    const mediaHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

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

  const totalWishes = await WishJar.countDocuments({ deletedAt: { $exists: false } });
  const activeWishes = await WishJar.countDocuments({ status: "Active", deletedAt: { $exists: false } });
  const resolvedSuccess = await WishJar.countDocuments({ status: "ResolvedSuccess", deletedAt: { $exists: false } });
  const resolvedFail = await WishJar.countDocuments({ status: "ResolvedFail", deletedAt: { $exists: false } });
  const totalPledged = await Pledge.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalUsers = await User.countDocuments({ deletedAt: { $exists: false } });

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
  const totalUsers = await User.countDocuments();

  res.json({
    totalWishes,
    activeWishes,
    resolvedSuccess,
    resolvedFail,
    totalPledged: totalPledged[0]?.total || 0,
    totalUsers,
  });
});

// GET /wish/leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find({});
    const leaderboard = await Promise.all(
      users.map(async (user, index) => {
        const userWishJars = await WishJar.find({ ownerId: user._id });
        const pledges = await Pledge.find({ supporterId: user._id });
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
          rank: index + 1,
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
    leaderboard.forEach((entry, index) => (entry.rank = index + 1));

    res.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
