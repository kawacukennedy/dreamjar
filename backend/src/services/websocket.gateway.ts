import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { monitoring } from "./monitoring";

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
  namespace: "/",
})
@Injectable()
export class WebSocketGatewayService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Track connected users and their rooms
  private connectedUsers: Map<string, string> = new Map(); // socketId -> userId
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>
  private roomPresence: Map<string, Set<string>> = new Map(); // room -> Set<userId>

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract JWT token from handshake
      const token = client.handshake.auth.token || client.handshake.query.token;

      if (token) {
        const payload = this.jwtService.verify(token);
        const userId = payload.userId;

        // Store user connection
        this.connectedUsers.set(client.id, userId);

        // Add to user's socket set
        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)!.add(client.id);

        // Join user-specific room
        client.join(`user-${userId}`);

        monitoring.info("Authenticated WebSocket client connected", {
          clientId: client.id,
          userId,
        });

        // Notify user's other sessions
        this.server.to(`user-${userId}`).emit("session-update", {
          type: "new-session",
          userId,
          socketId: client.id,
        });
      } else {
        monitoring.info("Anonymous WebSocket client connected", {
          clientId: client.id,
        });
      }
    } catch (error) {
      monitoring.error("WebSocket authentication failed", error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);

    if (userId) {
      // Remove from user's socket set
      const userSockets = this.userSockets.get(userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }

      // Leave user-specific room
      client.leave(`user-${userId}`);

      // Clean up room presence
      for (const [room, users] of this.roomPresence.entries()) {
        users.delete(userId);
        if (users.size === 0) {
          this.roomPresence.delete(room);
        }
      }

      monitoring.info("Authenticated WebSocket client disconnected", {
        clientId: client.id,
        userId,
      });

      // Notify user's other sessions
      if (this.userSockets.has(userId)) {
        this.server.to(`user-${userId}`).emit("session-update", {
          type: "session-disconnected",
          userId,
          socketId: client.id,
        });
      }
    } else {
      monitoring.info("Anonymous WebSocket client disconnected", {
        clientId: client.id,
      });
    }

    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage("join-wish")
  handleJoinWish(
    @ConnectedSocket() client: Socket,
    @MessageBody() wishId: string,
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    client.join(`wish-${wishId}`);

    // Track presence
    if (!this.roomPresence.has(`wish-${wishId}`)) {
      this.roomPresence.set(`wish-${wishId}`, new Set());
    }
    this.roomPresence.get(`wish-${wishId}`)!.add(userId);

    // Notify others in the room
    client.to(`wish-${wishId}`).emit("user-joined", {
      userId,
      wishId,
      presence: Array.from(this.roomPresence.get(`wish-${wishId}`) || []),
    });

    monitoring.audit("user_joined_wish_room", {
      clientId: client.id,
      userId,
      wishId,
    });
  }

  @SubscribeMessage("leave-wish")
  handleLeaveWish(
    @ConnectedSocket() client: Socket,
    @MessageBody() wishId: string,
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    client.leave(`wish-${wishId}`);

    // Update presence
    const roomPresence = this.roomPresence.get(`wish-${wishId}`);
    if (roomPresence) {
      roomPresence.delete(userId);
      if (roomPresence.size === 0) {
        this.roomPresence.delete(`wish-${wishId}`);
      }
    }

    // Notify others in the room
    client.to(`wish-${wishId}`).emit("user-left", {
      userId,
      wishId,
      presence: Array.from(roomPresence || []),
    });

    monitoring.audit("user_left_wish_room", {
      clientId: client.id,
      userId,
      wishId,
    });
  }

  @SubscribeMessage("join-leaderboard")
  handleJoinLeaderboard(@ConnectedSocket() client: Socket) {
    client.join("leaderboard");
    monitoring.audit("user_joined_leaderboard", { clientId: client.id });
  }

  @SubscribeMessage("leave-leaderboard")
  handleLeaveLeaderboard(@ConnectedSocket() client: Socket) {
    client.leave("leaderboard");
    monitoring.audit("user_left_leaderboard", { clientId: client.id });
  }

  @SubscribeMessage("typing-start")
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { wishId: string; userId: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId || userId !== data.userId) return;

    client.to(`wish-${data.wishId}`).emit("user-typing", {
      userId: data.userId,
      wishId: data.wishId,
      isTyping: true,
    });
  }

  @SubscribeMessage("typing-stop")
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { wishId: string; userId: string },
  ) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId || userId !== data.userId) return;

    client.to(`wish-${data.wishId}`).emit("user-typing", {
      userId: data.userId,
      wishId: data.wishId,
      isTyping: false,
    });
  }

  @SubscribeMessage("send-notification")
  handleSendNotification(
    @ConnectedSocket() client: Socket,
    @MessageBody() notification: any,
  ) {
    // Admin-only: send notification to specific user
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    // In real app, check if user is admin
    if (notification.targetUserId) {
      this.server
        .to(`user-${notification.targetUserId}`)
        .emit("notification", notification);
    } else if (notification.broadcast) {
      this.server.emit("notification", notification);
    }
  }

  // Enhanced emit methods
  emitWishUpdate(wishId: string, update: any) {
    this.server.to(`wish-${wishId}`).emit("wish-update", {
      ...update,
      timestamp: new Date().toISOString(),
    });
  }

  emitNewPledge(wishId: string, pledge: any) {
    this.server.to(`wish-${wishId}`).emit("new-pledge", {
      ...pledge,
      timestamp: new Date().toISOString(),
    });

    // Also notify wish creator
    if (pledge.wishCreatorId) {
      this.server
        .to(`user-${pledge.wishCreatorId}`)
        .emit("pledge-notification", {
          type: "new-pledge",
          wishId,
          pledge,
          timestamp: new Date().toISOString(),
        });
    }
  }

  emitVerificationUpdate(wishId: string, status: string, details?: any) {
    this.server.to(`wish-${wishId}`).emit("verification-update", {
      wishId,
      status,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  emitBadgeMinted(userId: string, badge: any) {
    this.server.to(`user-${userId}`).emit("badge-minted", {
      ...badge,
      timestamp: new Date().toISOString(),
    });
  }

  emitLeaderboardUpdate(update: any) {
    this.server.to("leaderboard").emit("leaderboard-update", {
      ...update,
      timestamp: new Date().toISOString(),
    });
  }

  emitUserNotification(userId: string, notification: any) {
    this.server.to(`user-${userId}`).emit("notification", {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }

  emitGlobalNotification(notification: any) {
    this.server.emit("global-notification", {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }

  // Utility methods
  getRoomPresence(room: string): string[] {
    return Array.from(this.roomPresence.get(room) || []);
  }

  getUserSockets(userId: string): string[] {
    return Array.from(this.userSockets.get(userId) || []);
  }

  isUserOnline(userId: string): boolean {
    return (
      this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0
    );
  }

  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  getRoomUsersCount(room: string): number {
    return this.roomPresence.get(room)?.size || 0;
  }
}
