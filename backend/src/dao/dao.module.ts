import { Module } from "@nestjs/common";
import { DAOController } from "./dao.controller";
import { DAOService } from "../services/dao";

@Module({
  controllers: [DAOController],
  providers: [DAOService],
  exports: [DAOService],
})
export class DAOModule {}
