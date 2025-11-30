import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "../common/jwt-auth.guard";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("wallet-challenge")
  async getWalletChallenge(@Body() body: { address: string }) {
    return this.authService.getWalletChallenge(body.address);
  }

  @Post("wallet-verify")
  async verifyWallet(
    @Body()
    body: {
      address: string;
      signedMessage: string;
      challengeMessage: string;
    },
  ) {
    return this.authService.verifyWallet(
      body.address,
      body.signedMessage,
      body.challengeMessage,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("me")
  async getMe(@Request() req) {
    return { user: await this.authService.getMe(req.user.userId) };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put("profile")
  async updateProfile(
    @Request() req,
    @Body() body: { displayName?: string; avatarUrl?: string },
  ) {
    return {
      user: await this.authService.updateProfile(
        req.user.userId,
        body.displayName,
        body.avatarUrl,
      ),
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("follow/:walletAddress")
  async checkFollow(
    @Request() req,
    @Param("walletAddress") walletAddress: string,
  ) {
    return this.authService.checkFollow(req.user.userId, walletAddress);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("follow/:walletAddress")
  async followUser(
    @Request() req,
    @Param("walletAddress") walletAddress: string,
  ) {
    return this.authService.followUser(req.user.userId, walletAddress);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete("follow/:walletAddress")
  async unfollowUser(
    @Request() req,
    @Param("walletAddress") walletAddress: string,
  ) {
    return this.authService.unfollowUser(req.user.userId, walletAddress);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("followers")
  async getFollowers(@Request() req) {
    return this.authService.getFollowers(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("following")
  async getFollowing(@Request() req) {
    return this.authService.getFollowing(req.user.userId);
  }
}
