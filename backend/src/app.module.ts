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
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || "mongodb://localhost:27017/dreamjar",
    ),
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
})
export class AppModule {}
