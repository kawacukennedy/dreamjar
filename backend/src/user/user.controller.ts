import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "../common/jwt-auth.guard";

@ApiTags("Users")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":userId")
  async getUser(@Param("userId") userId: string) {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new Error("User not found");
    return {
      id: user._id,
      username: user.username,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
    };
  }

  @Get("profile/:username")
  async getUserByUsername(@Param("username") username: string) {
    const user = await this.userService.getUserByUsername(username);
    if (!user) throw new Error("User not found");
    return {
      id: user._id,
      username: user.username,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      statistics: user.statistics,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put("profile")
  async updateProfile(@Body() body: any, @Request() req) {
    const updatedUser = await this.userService.updateUser(
      req.user.userId,
      body,
    );
    if (!updatedUser) throw new Error("User not found");
    return {
      id: updatedUser._id,
      username: updatedUser.username,
      displayName: updatedUser.display_name,
      avatarUrl: updatedUser.avatar_url,
      bio: updatedUser.bio,
      preferences: updatedUser.preferences,
    };
  }
}
