import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";
import WishJar from "../models/WishJar";

dotenv.config();

async function seed() {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/dreamjar",
  );

  // Clear existing data
  await User.deleteMany({});
  await WishJar.deleteMany({});

  // Create sample users
  const users = await User.insertMany([
    { walletAddress: "0x1234567890abcdef", displayName: "Alice" },
    { walletAddress: "0xabcdef1234567890", displayName: "Bob" },
  ]);

  // Create sample wishes
  await WishJar.insertMany([
    {
      ownerId: users[0]._id,
      title: "Build a community garden",
      description: "Help us create a beautiful garden in our neighborhood",
      contractAddress: "0:mock1",
      stakeAmount: 10,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      validatorMode: "community",
    },
    {
      ownerId: users[1]._id,
      title: "Develop open source library",
      description: "Create a useful library for developers",
      contractAddress: "0:mock2",
      stakeAmount: 5,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      validatorMode: "designatedValidators",
      validators: ["0xvalidator1"],
    },
  ]);

  console.log("Database seeded successfully");
  process.exit(0);
}

seed().catch(console.error);
