import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { vi } from "vitest";
import wishRoutes from "../routes/wish";
import WishJar from "../models/WishJar";
import User from "../models/User";
import Pledge from "../models/Pledge";

const app = express();
app.use(express.json());
app.use("/wish", wishRoutes);

// Mock authenticate middleware
vi.mock("../middleware/auth", () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.userId = "test-user-id";
    next();
  },
  AuthRequest: {},
}));

// Mock services
vi.mock("../services/storage", () => ({
  uploadToIPFS: vi.fn().mockResolvedValue("ipfs://test-hash"),
}));

vi.mock("../services/notification", () => ({
  createNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../services/queue", () => ({
  addDeadlineNotification: vi.fn().mockReturnValue(undefined),
}));

vi.mock("../services/audit", () => ({
  logAction: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../services/analytics", () => ({
  trackEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../services/webhook", () => ({
  triggerWebhooks: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../services/moderation", () => ({
  moderateContent: vi.fn().mockReturnValue({ approved: true }),
}));

vi.mock("../services/featureFlags", () => ({
  isFeatureEnabled: vi.fn().mockReturnValue(true),
}));

vi.mock("../services/cache", () => ({
  getCache: vi.fn().mockResolvedValue(null),
  setCache: vi.fn().mockResolvedValue(undefined),
}));

describe("Wish Routes", () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/dreamjar-test",
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear all collections
    await WishJar.deleteMany({});
    await User.deleteMany({});
    await Pledge.deleteMany({});
  });

  describe("POST /wish", () => {
    it("should create a new wish jar", async () => {
      const wishData = {
        title: "Test Dream",
        description: "A test dream description",
        stakeAmount: 1000000000,
        deadline: "2024-12-31T00:00:00Z",
        validatorMode: "community",
        category: "Personal",
      };

      const response = await request(app)
        .post("/wish")
        .send(wishData)
        .expect(200);

      expect(response.body.wishJar).toBeDefined();
      expect(response.body.wishJar.title).toBe(wishData.title);
      expect(response.body.wishJar.description).toBe(wishData.description);
      expect(response.body.wishJar.stakeAmount).toBe(wishData.stakeAmount);
      expect(response.body.wishJar.category).toBe(wishData.category);
    });

    it("should validate required fields", async () => {
      const response = await request(app).post("/wish").send({}).expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it("should validate title length", async () => {
      const response = await request(app)
        .post("/wish")
        .send({
          title: "A",
          description: "Valid description",
          stakeAmount: 1000000000,
          deadline: "2024-12-31T00:00:00Z",
          validatorMode: "community",
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it("should validate deadline is in future", async () => {
      const response = await request(app)
        .post("/wish")
        .send({
          title: "Valid Title",
          description: "Valid description",
          stakeAmount: 1000000000,
          deadline: "2020-01-01T00:00:00Z",
          validatorMode: "community",
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe("GET /wish/:id", () => {
    it("should get wish details", async () => {
      const wish = new WishJar({
        ownerId: "test-user-id",
        title: "Test Wish",
        description: "Test description",
        stakeAmount: 1000000000,
        deadline: new Date("2024-12-31"),
        validatorMode: "community",
      });
      await wish.save();

      const response = await request(app).get(`/wish/${wish._id}`).expect(200);

      expect(response.body.wish._id).toBe(wish._id.toString());
      expect(response.body.wish.title).toBe(wish.title);
      expect(response.body.pledges).toBeDefined();
      expect(response.body.proofs).toBeDefined();
    });

    it("should return 404 for non-existent wish", async () => {
      const response = await request(app)
        .get("/wish/507f1f77bcf86cd799439011")
        .expect(404);

      expect(response.body.error).toBe("Wish not found");
    });
  });

  describe("POST /wish/:id/pledge", () => {
    it("should create a pledge", async () => {
      const wish = new WishJar({
        ownerId: "other-user-id",
        title: "Test Wish",
        description: "Test description",
        stakeAmount: 1000000000,
        deadline: new Date("2024-12-31"),
        validatorMode: "community",
      });
      await wish.save();

      const response = await request(app)
        .post(`/wish/${wish._id}/pledge`)
        .send({ amount: 500000000 })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.pledge).toBeDefined();
      expect(response.body.pledge.amount).toBe(500000000);
    });

    it("should validate pledge amount", async () => {
      const wish = new WishJar({
        ownerId: "other-user-id",
        title: "Test Wish",
        description: "Test description",
        stakeAmount: 1000000000,
        deadline: new Date("2024-12-31"),
        validatorMode: "community",
      });
      await wish.save();

      const response = await request(app)
        .post(`/wish/${wish._id}/pledge`)
        .send({ amount: 0.001 }) // Too small
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe("GET /wish", () => {
    it("should list wishes with pagination", async () => {
      // Create test wishes
      for (let i = 0; i < 5; i++) {
        const wish = new WishJar({
          ownerId: "test-user-id",
          title: `Test Wish ${i}`,
          description: "Test description",
          stakeAmount: 1000000000,
          deadline: new Date("2024-12-31"),
          validatorMode: "community",
        });
        await wish.save();
      }

      const response = await request(app).get("/wish").expect(200);

      expect(response.body.wishes).toBeDefined();
      expect(response.body.wishes.length).toBe(5);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.hasNextPage).toBe(false);
    });

    it("should support search filtering", async () => {
      const wish1 = new WishJar({
        ownerId: "test-user-id",
        title: "Running Marathon",
        description: "Complete a marathon",
        stakeAmount: 1000000000,
        deadline: new Date("2024-12-31"),
        validatorMode: "community",
      });
      await wish1.save();

      const wish2 = new WishJar({
        ownerId: "test-user-id",
        title: "Learn Guitar",
        description: "Master guitar playing",
        stakeAmount: 1000000000,
        deadline: new Date("2024-12-31"),
        validatorMode: "community",
      });
      await wish2.save();

      const response = await request(app)
        .get("/wish?search=marathon")
        .expect(200);

      expect(response.body.wishes.length).toBe(1);
      expect(response.body.wishes[0].title).toBe("Running Marathon");
    });
  });

  describe("GET /wish/stats", () => {
    it("should return global statistics", async () => {
      // Create test data
      const wish = new WishJar({
        ownerId: "test-user-id",
        title: "Test Wish",
        description: "Test description",
        stakeAmount: 1000000000,
        deadline: new Date("2024-12-31"),
        validatorMode: "community",
        status: "Active",
      });
      await wish.save();

      const pledge = new Pledge({
        wishJarId: wish._id,
        supporterId: "supporter-id",
        amount: 500000000,
      });
      await pledge.save();

      const user = new User({
        walletAddress: "test-address",
        displayName: "Test User",
      });
      await user.save();

      const response = await request(app).get("/wish/stats").expect(200);

      expect(response.body.totalWishes).toBe(1);
      expect(response.body.activeWishes).toBe(1);
      expect(response.body.totalPledged).toBe(500000000);
      expect(response.body.totalUsers).toBe(1);
    });
  });
});
