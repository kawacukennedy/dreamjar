import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Webhook, WebhookDocument } from "../models/Webhook";
import { createHmac } from "crypto";

@Injectable()
export class WebhookService {
  constructor(
    @InjectModel(Webhook.name) private webhookModel: Model<WebhookDocument>,
  ) {}

  async createWebhook(
    userId: string,
    url: string,
    events: string[],
  ): Promise<WebhookDocument> {
    const secret = this.generateSecret();
    const webhook = new this.webhookModel({
      userId,
      url,
      events,
      secret,
    });
    return webhook.save();
  }

  async getWebhooks(userId: string): Promise<WebhookDocument[]> {
    return this.webhookModel.find({ userId, active: true });
  }

  async updateWebhook(
    webhookId: string,
    userId: string,
    updates: Partial<WebhookDocument>,
  ): Promise<WebhookDocument | null> {
    return this.webhookModel.findOneAndUpdate(
      { _id: webhookId, userId },
      updates,
      { new: true },
    );
  }

  async deleteWebhook(webhookId: string, userId: string): Promise<void> {
    await this.webhookModel.findOneAndUpdate(
      { _id: webhookId, userId },
      { active: false },
    );
  }

  async sendWebhook(
    webhook: WebhookDocument,
    event: string,
    payload: any,
  ): Promise<void> {
    if (!webhook.events.includes(event) || !webhook.active) return;

    const signature = this.generateSignature(
      JSON.stringify(payload),
      webhook.secret,
    );

    // In production, use a proper HTTP client like axios
    console.log(
      `Sending webhook to ${webhook.url} for event ${event}`,
      payload,
      signature,
    );
  }

  private generateSecret(): string {
    return require("crypto").randomBytes(32).toString("hex");
  }

  private generateSignature(payload: string, secret: string): string {
    return createHmac("sha256", secret).update(payload).digest("hex");
  }
}
