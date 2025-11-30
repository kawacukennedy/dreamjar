import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { NotificationService } from "./notification.service";
import { JwtAuthGuard } from "../common/jwt-auth.guard";

@ApiTags("Notifications")
@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async getNotifications(
    @Request() req,
    @Query("limit") limit = 20,
    @Query("offset") offset = 0,
  ) {
    const notifications = await this.notificationService.getNotifications(
      req.user.userId,
      limit,
      offset,
    );
    const unreadCount = await this.notificationService.getUnreadCount(
      req.user.userId,
    );
    return { notifications, unreadCount };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(":notificationId/read")
  async markAsRead(
    @Param("notificationId") notificationId: string,
    @Request() req,
  ) {
    await this.notificationService.markAsRead(notificationId, req.user.userId);
    return { message: "Marked as read" };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put("read-all")
  async markAllAsRead(@Request() req) {
    await this.notificationService.markAllAsRead(req.user.userId);
    return { message: "All marked as read" };
  }
}
