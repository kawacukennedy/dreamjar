import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BullModule } from "@nestjs/bullmq";
import { WishController } from "./wish.controller";
import { WishService } from "./wish.service";
import { NFTService } from "../services/nft";
import { WishJar, WishJarSchema } from "../models/WishJar";
import { Pledge, PledgeSchema } from "../models/Pledge";
import { Update, UpdateSchema } from "../models/Update";
import { User, UserSchema } from "../models/User";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WishJar.name, schema: WishJarSchema },
      { name: Pledge.name, schema: PledgeSchema },
      { name: Update.name, schema: UpdateSchema },
      { name: User.name, schema: UserSchema },
    ]),
    BullModule.registerQueue({
      name: "wish",
    }),
  ],
  controllers: [WishController],
  providers: [WishService, NFTService],
  exports: [WishService],
})
export class WishModule {}
