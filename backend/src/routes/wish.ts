import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import WishJar from "../models/WishJar";
import Pledge from "../models/Pledge";
import Proof from "../models/Proof";
import Vote from "../models/Vote";
import { uploadToIPFS } from "../services/storage";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Middleware to verify JWT
const authenticate = (
  req: any,
  res: express.Response,
  next: express.NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
    ) as any;
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// POST /wish
router.post("/", authenticate, async (req, res) => {
  const {
    title,
    description,
    metadataURI,
    stakeAmount,
    deadline,
    validatorMode,
    validators,
  } = req.body;

  // TODO: Deploy contract on TON and get address
  const contractAddress = "mock_contract_address"; // Replace with actual deployment

  const wishJar = new WishJar({
    ownerId: req.userId,
    title,
    description,
    metadataURI,
    contractAddress,
    stakeAmount,
    deadline,
    validatorMode,
    validators,
  });

  await wishJar.save();
  res.json({ wishJar });
});

// GET /wish/:id
router.get("/:id", async (req, res) => {
  const wishJar = await WishJar.findById(req.params.id).populate(
    "ownerId",
    "displayName walletAddress",
  );
  if (!wishJar) return res.status(404).json({ error: "WishJar not found" });

  const pledges = await Pledge.find({ wishJarId: req.params.id }).populate(
    "supporterId",
    "displayName",
  );
  const proofs = await Proof.find({ wishJarId: req.params.id }).populate(
    "uploaderId",
    "displayName",
  );

  res.json({ wishJar, pledges, proofs });
});

// POST /wish/:id/pledge
router.post("/:id/pledge", authenticate, async (req, res) => {
  const { amount } = req.body;

  // TODO: Handle TON transaction

  const pledge = new Pledge({
    wishJarId: req.params.id,
    supporterId: req.userId,
    amount,
    txHash: "mock_tx_hash",
  });

  await pledge.save();
  res.json({ status: "success", pledge });
});

// POST /wish/:id/proof
router.post(
  "/:id/proof",
  authenticate,
  upload.single("mediaFile"),
  async (req, res) => {
    const { caption } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "Media file required" });

    const mediaURI = await uploadToIPFS(file.buffer, file.originalname);
    const mediaHash = "mock_hash"; // TODO: Calculate hash

    const proof = new Proof({
      wishJarId: req.params.id,
      uploaderId: req.userId,
      mediaURI,
      mediaHash,
      caption,
    });

    await proof.save();
    res.json({ proof });
  },
);

// POST /wish/:id/start-vote
router.post("/:id/start-vote", authenticate, async (req, res) => {
  // TODO: Check if owner or validator
  res.json({ voteSessionId: "mock_session" });
});

// POST /wish/:id/vote
router.post("/:id/vote", authenticate, async (req, res) => {
  const { choice } = req.body;

  const vote = new Vote({
    wishJarId: req.params.id,
    voterId: req.userId,
    choice,
  });

  await vote.save();

  const votes = await Vote.find({ wishJarId: req.params.id });
  const yesCount = votes.filter((v) => v.choice === "yes").length;
  const noCount = votes.filter((v) => v.choice === "no").length;

  res.json({
    status: "success",
    currentCounts: { yes: yesCount, no: noCount },
  });
});

export default router;
