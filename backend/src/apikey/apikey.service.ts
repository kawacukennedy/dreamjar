import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ApiKey, ApiKeyDocument } from "../models/ApiKey";
import { randomBytes } from "crypto";

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKeyDocument>,
  ) {}

  async createApiKey(
    userId: string,
    name: string,
    permissions: string[],
  ): Promise<ApiKeyDocument> {
    const key = this.generateApiKey();
    const apiKey = new this.apiKeyModel({
      userId,
      key,
      name,
      permissions,
    });
    return apiKey.save();
  }

  async getApiKeys(userId: string): Promise<ApiKeyDocument[]> {
    return this.apiKeyModel.find({ userId });
  }

  async validateApiKey(key: string): Promise<ApiKeyDocument | null> {
    const apiKey = await this.apiKeyModel.findOne({ key, active: true });
    if (apiKey) {
      await this.apiKeyModel.updateOne(
        { _id: apiKey._id },
        { lastUsed: new Date() },
      );
    }
    return apiKey;
  }

  async revokeApiKey(apiKeyId: string, userId: string): Promise<void> {
    await this.apiKeyModel.findOneAndUpdate(
      { _id: apiKeyId, userId },
      { active: false },
    );
  }

  private generateApiKey(): string {
    return "dj_" + randomBytes(32).toString("hex");
  }
}
