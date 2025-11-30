import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../models/User";
import { WishJar, WishJarDocument } from "../models/WishJar";
import { Pledge, PledgeDocument } from "../models/Pledge";

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(WishJar.name) private wishModel: Model<WishJarDocument>,
    @InjectModel(Pledge.name) private pledgeModel: Model<PledgeDocument>,
  ) {}

  async getTopCreators(limit = 10): Promise<any[]> {
    const creators = await this.userModel
      .find({ "statistics.created_wishes_count": { $gt: 0 } })
      .sort({ "statistics.created_wishes_count": -1 })
      .limit(limit)
      .select(
        "username display_name avatar_url statistics.created_wishes_count",
      );

    return creators;
  }

  async getTopSupporters(limit = 10): Promise<any[]> {
    const supporters = await this.userModel
      .find({ "statistics.supporter_badges_count": { $gt: 0 } })
      .sort({ "statistics.supporter_badges_count": -1 })
      .limit(limit)
      .select(
        "username display_name avatar_url statistics.supporter_badges_count",
      );

    return supporters;
  }

  async getTrendingWishes(limit = 10): Promise<any[]> {
    const wishes = await this.wishModel
      .find({ status: "active" })
      .sort({ pledge_count: -1, created_at: -1 })
      .limit(limit)
      .populate("creator_user_id", "username display_name");

    return wishes;
  }

  async getTopPledges(limit = 10): Promise<any[]> {
    const pledges = await this.pledgeModel.aggregate([
      {
        $group: {
          _id: "$supporter_user_id",
          totalAmount: { $sum: "$amount_microton" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $sort: { totalAmount: -1 } },
      { $limit: limit },
      {
        $project: {
          username: "$user.username",
          displayName: "$user.display_name",
          avatarUrl: "$user.avatar_url",
          totalAmount: 1,
          count: 1,
        },
      },
    ]);

    return pledges;
  }
}
