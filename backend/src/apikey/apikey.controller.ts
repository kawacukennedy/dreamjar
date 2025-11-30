import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { ApiKeyService } from "./apikey.service";
import { JwtAuthGuard } from "../common/jwt-auth.guard";

@ApiTags("API Keys")
@Controller("apikeys")
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async createApiKey(
    @Body() body: { name: string; permissions: string[] },
    @Request() req,
  ) {
    const apiKey = await this.apiKeyService.createApiKey(
      req.user.userId,
      body.name,
      body.permissions,
    );
    return {
      id: apiKey._id,
      key: apiKey.key,
      name: apiKey.name,
      permissions: apiKey.permissions,
      createdAt: apiKey.createdAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async getApiKeys(@Request() req) {
    const apiKeys = await this.apiKeyService.getApiKeys(req.user.userId);
    return apiKeys.map((k) => ({
      id: k._id,
      name: k.name,
      permissions: k.permissions,
      active: k.active,
      lastUsed: k.lastUsed,
      createdAt: k.createdAt,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(":apiKeyId")
  async revokeApiKey(@Param("apiKeyId") apiKeyId: string, @Request() req) {
    await this.apiKeyService.revokeApiKey(apiKeyId, req.user.userId);
    return { message: "API key revoked" };
  }
}
