import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { BullModule } from "@nestjs/bullmq";
import { AuthModule } from "./auth/auth.module";
import { WishModule } from "./wish/wish.module";
import { UserModule } from "./user/user.module";
import { NotificationModule } from "./notification/notification.module";
import { WebhookModule } from "./webhook/webhook.module";
import { ApiKeyModule } from "./apikey/apikey.module";
import { DAOModule } from "./dao/dao.module";
import { WebSocketGatewayService } from "./services/websocket.gateway";
import { LeaderboardController } from "./services/leaderboard.controller";
import { LeaderboardService } from "./services/leaderboard";
import { ProofVerificationService } from "./services/proof-verification";
import { VerificationService } from "./services/verification.service";
import { BadgeSchema } from "./models/Badge";
import { ProposalSchema } from "./models/Proposal";
import { ImpactPoolService } from "./services/impact-pool.service";
import { AdminService } from "./services/admin.service";
import { AdminController } from "./controllers/admin.controller";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || "mongodb://localhost:27017/dreamjar",
    ),
    MongooseModule.forFeature([
      { name: "Badge", schema: BadgeSchema },
      { name: "Proposal", schema: ProposalSchema },
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || "secret",
      signOptions: { expiresIn: "24h" },
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typeDefs: [], // Will be added in resolvers
      resolvers: [], // Will be added
    }),
    AuthModule,
    WishModule,
    UserModule,
    NotificationModule,
    WebhookModule,
    ApiKeyModule,
    DAOModule,
  ],
  controllers: [LeaderboardController, AdminController],
  providers: [
    WebSocketGatewayService,
    LeaderboardService,
    ProofVerificationService,
    VerificationService,
    ImpactPoolService,
    AdminService,
  ],
})
export class AppModule {}
