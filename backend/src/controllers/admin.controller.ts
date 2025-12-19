import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AdminService } from "../services/admin.service";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";

@ApiTags("Admin")
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("dashboard/stats")
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get("wishes")
  async getWishes(
    @Query("status") status?: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
  ) {
    return this.adminService.getWishes(status, page, limit);
  }

  @Get("wishes/:wishId")
  async getWishDetails(@Param("wishId") wishId: string) {
    return this.adminService.getWishDetails(wishId);
  }

  @Put("wishes/:wishId/status")
  async updateWishStatus(
    @Param("wishId") wishId: string,
    @Body() body: { status: string; reason?: string },
  ) {
    return this.adminService.updateWishStatus(wishId, body.status, body.reason);
  }

  @Get("disputes")
  async getDisputes(
    @Query("status") status?: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
  ) {
    return this.adminService.getDisputes(status, page, limit);
  }

  @Post("disputes/:disputeId/resolve")
  async resolveDispute(
    @Param("disputeId") disputeId: string,
    @Body() body: { resolution: string; notes?: string },
  ) {
    return this.adminService.resolveDispute(
      disputeId,
      body.resolution,
      body.notes,
    );
  }

  @Get("contracts")
  async getContracts(
    @Query("status") status?: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
  ) {
    return this.adminService.getContracts(status, page, limit);
  }

  @Get("contracts/:address")
  async getContractDetails(@Param("address") address: string) {
    return this.adminService.getContractDetails(address);
  }

  @Get("analytics/overview")
  async getAnalyticsOverview(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.adminService.getAnalyticsOverview(startDate, endDate);
  }

  @Get("analytics/users")
  async getUserAnalytics(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.adminService.getUserAnalytics(startDate, endDate);
  }

  @Get("analytics/wishes")
  async getWishAnalytics(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.adminService.getWishAnalytics(startDate, endDate);
  }

  @Get("impact-pool")
  async getImpactPoolStats() {
    return this.adminService.getImpactPoolStats();
  }

  @Get("proposals")
  async getProposals(
    @Query("status") status?: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
  ) {
    return this.adminService.getProposals(status, page, limit);
  }

  @Post("proposals/:proposalId/execute")
  async executeProposal(@Param("proposalId") proposalId: string) {
    return this.adminService.executeProposal(parseInt(proposalId));
  }

  @Get("audit-logs")
  async getAuditLogs(
    @Query("action") action?: string,
    @Query("userId") userId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 50,
  ) {
    return this.adminService.getAuditLogs(
      action,
      userId,
      startDate,
      endDate,
      page,
      limit,
    );
  }

  @Post("system/maintenance")
  async runMaintenance(@Body() body: { operation: string; params?: any }) {
    return this.adminService.runMaintenance(body.operation, body.params);
  }
}
