import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable } from "@nestjs/common";
import { monitoring } from "./monitoring";

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  },
})
@Injectable()
export class WebSocketGatewayService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    monitoring.info("WebSocket client connected", { clientId: client.id });
  }

  handleDisconnect(client: Socket) {
    monitoring.info("WebSocket client disconnected", { clientId: client.id });
  }

  @SubscribeMessage("join-wish")
  handleJoinWish(client: Socket, wishId: string) {
    client.join(`wish-${wishId}`);
    monitoring.audit("user_joined_wish_room", { clientId: client.id, wishId });
  }

  @SubscribeMessage("leave-wish")
  handleLeaveWish(client: Socket, wishId: string) {
    client.leave(`wish-${wishId}`);
    monitoring.audit("user_left_wish_room", { clientId: client.id, wishId });
  }

  // Emit updates to wish room
  emitWishUpdate(wishId: string, update: any) {
    this.server.to(`wish-${wishId}`).emit("wish-update", update);
  }

  emitNewPledge(wishId: string, pledge: any) {
    this.server.to(`wish-${wishId}`).emit("new-pledge", pledge);
  }

  emitVerificationUpdate(wishId: string, status: string) {
    this.server
      .to(`wish-${wishId}`)
      .emit("verification-update", { wishId, status });
  }
}
