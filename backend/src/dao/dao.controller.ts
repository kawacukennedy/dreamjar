import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { DAOService } from "../services/dao";
import { JwtAuthGuard } from "../common/jwt-auth.guard";

@Controller("dao")
@UseGuards(JwtAuthGuard)
export class DAOController {
  constructor(private readonly daoService: DAOService) {}

  @Post("propose")
  async propose(@Body() body: { planUri: string }) {
    await this.daoService.proposeImpactPlan(body.planUri);
    return { success: true };
  }

  @Post("vote")
  async vote(@Body() body: { proposalId: number; choice: boolean }) {
    await this.daoService.voteOnProposal(body.proposalId, body.choice);
    return { success: true };
  }

  @Post("execute")
  async execute(@Body() body: { proposalId: number }) {
    await this.daoService.executeProposal(body.proposalId);
    return { success: true };
  }
}
