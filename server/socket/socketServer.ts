import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import db from "../config/db";
import { incrementEngagement } from "../utils/recommendationEngine";

import { updateAnalytics } from "../utils/analyticsEngine";

const SECRET = process.env.JWT_SECRET || "oracle_secret_fallback";

let io: Server;
let viewers = 0;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket: any, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const user = jwt.verify(token, SECRET);
        socket.user = user;
        return next();
      } catch (err) {
        // Continue unauthenticated
      }
    }
    next();
  });

  io.on("connection", (socket: any) => {
    viewers++;
    io.emit("viewer-count", { count: viewers });
    console.log("User connected:", socket.id);

    socket.on("join-room", async ({ roomId, userId }: { roomId: string, userId: string }) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
      io.to(roomId).emit("user-joined", { userId });
      
      // PHASE 6.3 - Analytics
      const room = db.prepare("SELECT host_id FROM streams WHERE id = ?").get(roomId) as any;
      const streamerId = room ? room.host_id : userId; // fallback if room not in streams table or for multi-guest host logic

      await updateAnalytics({
        streamerId,
        roomId,
        field: "liveViewers",
        value: 1
      });
    });

    socket.on("send-message", (payload: any) => {
      // Engagement Rate tracking
      if (payload.roomId) {
          incrementEngagement(payload.roomId);
      }
      io.to(payload.roomId).emit("new-message", payload);
      // Compatibility with existing receive-message if needed
      io.to(payload.roomId).emit("receive-message", payload);
    });

    socket.on("send-gift", (payload: any) => {
      io.to(payload.roomId).emit("gift-received", payload);
    });

    socket.on("gift-sent", (data: any) => {
      if (data.roomId) {
        io.to(data.roomId).emit("gift-animation", data);
      } else {
        io.emit("gift-animation", data);
      }
    });

    socket.on("pk-score", (payload: any) => {
      io.to(payload.roomId).emit("pk-updated", payload);
    });

    socket.on("room-event", (payload: any) => {
      io.to(payload.roomId).emit("room-update", payload);
    });

    socket.on("viewer-update", (data: any) => {
      if (data.roomId) {
        io.to(data.roomId).emit("viewer-count", data);
      }
    });

    socket.on("disconnect", () => {
      viewers--;
      io.emit("viewer-count", { count: viewers });
      console.log("User disconnected");
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}
