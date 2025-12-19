import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { WishService } from "./wish.service";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { CreateWishDto } from "./create-wish.dto";
import { CreatePledgeDto } from "./create-pledge.dto";
import { PostUpdateDto } from "./post-update.dto";
import { VerifyWishDto } from "./verify-wish.dto";
import { SubmitProofDto } from "./submit-proof.dto";
import { CastVoteDto } from "./cast-vote.dto";

@ApiTags("Wishes")
@Controller("wishes")
export class WishController {
  constructor(private readonly wishService: WishService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async createWish(@Body() body: CreateWishDto, @Request() req) {
    return this.wishService.createWish(body, req.user.userId);
  }

  @Get(":wishId")
  async getWish(@Param("wishId") wishId: string) {
    return this.wishService.getWish(wishId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(":wishId/pledges")
  async createPledge(
    @Param("wishId") wishId: string,
    @Body() body: CreatePledgeDto,
    @Request() req,
  ) {
    return this.wishService.createPledge(
      wishId,
      body.amountMicroTon,
      body.note || "",
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(":wishId/updates")
  async postUpdate(
    @Param("wishId") wishId: string,
    @Body() body: PostUpdateDto,
    @Request() req,
  ) {
    return this.wishService.postUpdate(
      wishId,
      body.content,
      body.mediaUrls || [],
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(":wishId/proof")
  async submitProof(
    @Param("wishId") wishId: string,
    @Body() body: SubmitProofDto,
    @Request() req,
  ) {
    return this.wishService.submitProof(wishId, req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(":wishId/vote")
  async castVote(
    @Param("wishId") wishId: string,
    @Body() body: CastVoteDto,
    @Request() req,
  ) {
    return this.wishService.castVote(
      wishId,
      req.user.userId,
      body.choice,
      body.comment,
    );
  }

  @Get(":wishId/verification")
  async getVerificationDetails(@Param("wishId") wishId: string) {
    return this.wishService.getVerificationDetails(wishId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(":wishId/verify")
  async verifyWish(
    @Param("wishId") wishId: string,
    @Body() body: VerifyWishDto,
    @Request() req,
  ) {
    return this.wishService.verifyWish(
      wishId,
      body.vote,
      body.comment || "",
      req.user.userId,
    );
  }
}
