import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import { User, UserDocument } from "../models/User";
import { Follow, FollowDocument } from "../models/Follow";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    private jwtService: JwtService,
  ) {}

  async getWalletChallenge(
    address: string,
  ): Promise<{ challengeMessage: string }> {
    const challengeMessage = `Sign this message to authenticate with DreamJar: ${Date.now()}`;
    return { challengeMessage };
  }

  async verifyWallet(
    address: string,
    signedMessage: string,
    challengeMessage: string,
  ): Promise<{ jwt: string; user: User }> {
    // Mock validation - in production use TON SDK
    const isValid = signedMessage && challengeMessage;
    if (!isValid) throw new Error("Invalid signature");

    let user = await this.userModel.findOne({ walletAddress: address });
    if (!user) {
      user = new this.userModel({ walletAddress: address });
      await user.save();
    }

    const jwt = this.jwtService.sign({ userId: user._id });
    return { jwt, user };
  }

  async getMe(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateProfile(
    userId: string,
    displayName?: string,
    avatarUrl?: string,
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error("User not found");

    if (displayName !== undefined) user.displayName = displayName;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    user.lastSeen = new Date();
    await user.save();
    return user;
  }

  async checkFollow(
    userId: string,
    walletAddress: string,
  ): Promise<{ isFollowing: boolean }> {
    const targetUser = await this.userModel.findOne({ walletAddress });
    if (!targetUser) throw new Error("User not found");

    const follow = await this.followModel.findOne({
      follower: userId,
      following: targetUser._id,
    });
    return { isFollowing: !!follow };
  }

  async followUser(
    userId: string,
    walletAddress: string,
  ): Promise<{ message: string }> {
    const targetUser = await this.userModel.findOne({ walletAddress });
    if (!targetUser) throw new Error("User not found");

    if (userId === targetUser._id.toString()) {
      throw new Error("Cannot follow yourself");
    }

    const existingFollow = await this.followModel.findOne({
      follower: userId,
      following: targetUser._id,
    });

    if (existingFollow) {
      throw new Error("Already following");
    }

    const follow = new this.followModel({
      follower: userId,
      following: targetUser._id,
    });

    await follow.save();
    return { message: "Followed successfully" };
  }

  async unfollowUser(
    userId: string,
    walletAddress: string,
  ): Promise<{ message: string }> {
    const targetUser = await this.userModel.findOne({ walletAddress });
    if (!targetUser) throw new Error("User not found");

    const follow = await this.followModel.findOneAndDelete({
      follower: userId,
      following: targetUser._id,
    });

    if (!follow) {
      throw new Error("Not following");
    }

    return { message: "Unfollowed successfully" };
  }

  async getFollowers(
    userId: string,
  ): Promise<{ count: number; followers: any[] }> {
    const followers = await this.followModel
      .find({ following: userId })
      .populate("follower", "displayName walletAddress");
    return {
      count: followers.length,
      followers: followers.map((f) => f.follower),
    };
  }

  async getFollowing(
    userId: string,
  ): Promise<{ count: number; following: any[] }> {
    const following = await this.followModel
      .find({ follower: userId })
      .populate("following", "displayName walletAddress");
    return {
      count: following.length,
      following: following.map((f) => f.following),
    };
  }
}
