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
    try {
      // Verify TON signature
      const isValidSignature = await this.verifyTonSignature(
        address,
        signedMessage,
        challengeMessage,
      );

      if (!isValidSignature) {
        throw new Error("Invalid signature");
      }

      let user = await this.userModel.findOne({
        "wallet_addresses.address": address,
      });

      if (!user) {
        user = new this.userModel({
          username: `user_${address.slice(0, 8)}`,
          display_name: `User ${address.slice(0, 8)}`,
          wallet_addresses: [{ address, provider: "TonConnect" }],
        });
        await user.save();
      }

      const jwt = this.jwtService.sign({
        userId: user._id,
        walletAddress: address,
        iat: Math.floor(Date.now() / 1000),
      });

      return { jwt, user };
    } catch (error) {
      throw new Error(`Wallet verification failed: ${error.message}`);
    }
  }

  private async verifyTonSignature(
    address: string,
    signedMessage: string,
    challengeMessage: string,
  ): Promise<boolean> {
    try {
      // In production, use TON SDK for proper signature verification
      // For now, implement basic validation
      if (!signedMessage || !challengeMessage) {
        return false;
      }

      // Check if signature format is valid (basic check)
      if (signedMessage.length < 128) {
        return false;
      }

      // Verify challenge message matches expected format
      const expectedPrefix = "Sign this message to authenticate with DreamJar:";
      if (!challengeMessage.startsWith(expectedPrefix)) {
        return false;
      }

      // In production, you would:
      // 1. Parse the signed message
      // 2. Extract the public key from the address
      // 3. Verify the signature using TON crypto libraries
      // 4. Check timestamp is recent (prevent replay attacks)

      // For demo purposes, accept signatures that match basic criteria
      return (
        signedMessage.length >= 128 &&
        challengeMessage.includes(Date.now().toString().slice(0, -3))
      );
    } catch (error) {
      console.error("Signature verification error:", error);
      return false;
    }
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
    const updateData: any = {};
    if (displayName !== undefined) updateData.display_name = displayName;
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;
    const user = await this.userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    if (!user) throw new Error("User not found");
    return user;
  }

  async checkFollow(
    userId: string,
    walletAddress: string,
  ): Promise<{ isFollowing: boolean }> {
    const targetUser = await this.userModel.findOne({
      "wallet_addresses.address": walletAddress,
    });
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
    const targetUser = await this.userModel.findOne({
      "wallet_addresses.address": walletAddress,
    });
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
    const targetUser = await this.userModel.findOne({
      "wallet_addresses.address": walletAddress,
    });
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
      .populate("follower", "display_name avatar_url");
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
      .populate("following", "display_name avatar_url");
    return {
      count: following.length,
      following: following.map((f) => f.following),
    };
  }
}
