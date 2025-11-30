import { Controller, Get, Query } from "@nestjs/common";
import { LeaderboardService } from "./leaderboard";

@Controller("leaderboard")
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get("creators")
  async getTopCreators(@Query("limit") limit = 10) {
    return await this.leaderboardService.getTopCreators(Number(limit));
  }

  @Get("supporters")
  async getTopSupporters(@Query("limit") limit = 10) {
    return await this.leaderboardService.getTopSupporters(Number(limit));
  }

  @Get("trending")
  async getTrendingWishes(@Query("limit") limit = 10) {
    return await this.leaderboardService.getTrendingWishes(Number(limit));
  }

  @Get("pledges")
  async getTopPledges(@Query("limit") limit = 10) {
    return await this.leaderboardService.getTopPledges(Number(limit));
  }
}
