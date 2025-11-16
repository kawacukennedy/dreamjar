import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { vi } from "vitest";
import wishRoutes from "../routes/wish";
import WishJar from "../models/WishJar";
import User from "../models/User";
import Pledge from "../models/Pledge";

const app = express();
app.use(express.json());
app.use("/wish", wishRoutes);

describe("Leaderboard", () => {
  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/dreamjar-test",
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await WishJar.deleteMany({});
    await User.deleteMany({});
    await Pledge.deleteMany({});
  });

  it("should return user rankings based on pledges", async () => {
    // Create users
    const user1 = new User({
      walletAddress: "user1-address",
      displayName: "User One",
    });
    await user1.save();

    const user2 = new User({
      walletAddress: "user2-address",
      displayName: "User Two",
    });
    await user2.save();

    // Create wishes
    const wish1 = new WishJar({
      ownerId: user1._id,
      title: "Wish 1",
      description: "Description 1",
      stakeAmount: 1000000000,
      deadline: new Date("2024-12-31"),
      validatorMode: "community",
    });
    await wish1.save();

    const wish2 = new WishJar({
      ownerId: user2._id,
      title: "Wish 2",
      description: "Description 2",
      stakeAmount: 1000000000,
      deadline: new Date("2024-12-31"),
      validatorMode: "community",
    });
    await wish2.save();

    // Create pledges (user2 has more pledges)
    const pledge1 = new Pledge({
      wishJarId: wish1._id,
      supporterId: user2._id,
      amount: 300000000,
    });
    await pledge1.save();

    const pledge2 = new Pledge({
      wishJarId: wish2._id,
      supporterId: user2._id,
      amount: 200000000,
    });
    await pledge2.save();

    const pledge3 = new Pledge({
      wishJarId: wish1._id,
      supporterId: user1._id,
      amount: 100000000,
    });
    await pledge3.save();

    const response = await request(app).get("/wish/leaderboard").expect(200);

    expect(response.body.length).toBe(2);

    // User2 should be first (500M total pledged)
    expect(response.body[0].user.displayName).toBe("User Two");
    expect(response.body[0].totalPledged).toBe(500000000);
    expect(response.body[0].rank).toBe(1);

    // User1 should be second (100M total pledged)
    expect(response.body[1].user.displayName).toBe("User One");
    expect(response.body[1].totalPledged).toBe(100000000);
    expect(response.body[1].rank).toBe(2);
  });

  it("should calculate success rate correctly", async () => {
    const user = new User({
      walletAddress: "user-address",
      displayName: "Test User",
    });
    await user.save();

    // Create wishes with different statuses
    const wish1 = new WishJar({
      ownerId: user._id,
      title: "Successful Wish",
      description: "Description",
      stakeAmount: 1000000000,
      deadline: new Date("2024-12-31"),
      validatorMode: "community",
      status: "ResolvedSuccess",
    });
    await wish1.save();

    const wish2 = new WishJar({
      ownerId: user._id,
      title: "Failed Wish",
      description: "Description",
      stakeAmount: 1000000000,
      deadline: new Date("2024-12-31"),
      validatorMode: "community",
      status: "ResolvedFail",
    });
    await wish2.save();

    const wish3 = new WishJar({
      ownerId: user._id,
      title: "Active Wish",
      description: "Description",
      stakeAmount: 1000000000,
      deadline: new Date("2024-12-31"),
      validatorMode: "community",
      status: "Active",
    });
    await wish3.save();

    const response = await request(app).get("/wish/leaderboard").expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].dreamsCreated).toBe(3);
    expect(response.body[0].successfulDreams).toBe(1);
    expect(response.body[0].successRate).toBe(33); // 1/3 * 100, rounded
  });
});
