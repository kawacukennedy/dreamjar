import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { WebhookService } from "./webhook.service";
import { JwtAuthGuard } from "../common/jwt-auth.guard";

@ApiTags("Webhooks")
@Controller("webhooks")
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async createWebhook(
    @Body() body: { url: string; events: string[] },
    @Request() req,
  ) {
    const webhook = await this.webhookService.createWebhook(
      req.user.userId,
      body.url,
      body.events,
    );
    return {
      id: webhook._id,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async getWebhooks(@Request() req) {
    const webhooks = await this.webhookService.getWebhooks(req.user.userId);
    return webhooks.map((w) => ({
      id: w._id,
      url: w.url,
      events: w.events,
      active: w.active,
      createdAt: w.createdAt,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(":webhookId")
  async updateWebhook(
    @Param("webhookId") webhookId: string,
    @Body() body: { url?: string; events?: string[]; active?: boolean },
    @Request() req,
  ) {
    const webhook = await this.webhookService.updateWebhook(
      webhookId,
      req.user.userId,
      body,
    );
    if (!webhook) throw new Error("Webhook not found");
    return {
      id: webhook._id,
      url: webhook.url,
      events: webhook.events,
      active: webhook.active,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(":webhookId")
  async deleteWebhook(@Param("webhookId") webhookId: string, @Request() req) {
    await this.webhookService.deleteWebhook(webhookId, req.user.userId);
    return { message: "Webhook deleted" };
  }
}
