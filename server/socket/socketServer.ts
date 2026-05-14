import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import db from "../config/db";
import { incrementEngagement } from "../utils/recommendationEngine";

import { updateAnalytics } from "../utils/analyticsEngine";
import { detectToxicity, detectSpam } from "../utils/liveAiModeration";
import { detectRaid } from "../utils/antiRaidEngine";
import { isShadowBanned } from "../utils/shadowBanEngine";

const SECRET = process.env.JWT_SECRET || "oracle_secret_fallback";

let io: Server;
let viewers = 0;

// Tracker for spam detection
const userMessageStats: Record<string, { count: number, lastReset: number }> = {};

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
      if (!roomId) return;
      
      // PHASE 7.7 - Raid Detection
      if (detectRaid({ roomId, joins: 1 })) {
        io.to(roomId).emit("raid-alert", { message: "Massive join activity detected! Anti-raid mode enabled." });
      }

      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
      io.to(roomId).emit("user-joined", { userId });
      
      // PHASE 6.3 - Analytics
      try {
        const room = db.prepare("SELECT host_id FROM streams WHERE id = ?").get(roomId) as any;
        const streamerId = room ? room.host_id : (userId || "guest");

        await updateAnalytics({
          streamerId,
          roomId,
          field: "liveViewers",
          value: 1
        });
      } catch (e) {
        console.error("Analytics join-room update failed:", e);
      }
    });

    socket.on("send-message", (payload: any) => {
      const { roomId, userId, message: text } = payload;
      if (!roomId) return;

      // PHASE 7.7 - Shadow Ban check
      const shadowBanned = userId ? isShadowBanned(userId) : false;

      // PHASE 7.7 - AI Toxicity Detection
      if (text && detectToxicity(text)) {
        socket.emit("moderation-warning", { message: "Your message was flagged as toxic and removed." });
        return;
      }

      // PHASE 7.7 - Spam Detection
      if (userId) {
        const now = Date.now();
        if (!userMessageStats[userId] || now - userMessageStats[userId].lastReset > 5000) {
          userMessageStats[userId] = { count: 1, lastReset: now };
        } else {
          userMessageStats[userId].count++;
        }

        if (detectSpam({ messageCount: userMessageStats[userId].count, seconds: (now - userMessageStats[userId].lastReset) / 1000 })) {
          socket.emit("moderation-warning", { message: "Slow down! You are sending messages too fast." });
          io.to(roomId).emit("spam-alert", { userId });
          return;
        }
      }

      // Engagement Rate tracking
      if (roomId) {
          incrementEngagement(roomId);
      }

      if (shadowBanned) {
        // Only echo to the sender if shadow banned
        socket.emit("new-message", payload);
      } else {
        io.to(roomId).emit("new-message", payload);
        // Compatibility with existing receive-message if needed
        io.to(roomId).emit("receive-message", payload);
      }
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

    socket.on("pk-score-update", (payload: any) => {
      io.to(payload.roomId).emit("pk-live-update", payload);
    });
    
    socket.on("seat-update", (payload: any) => {
      io.to(payload.roomId).emit("seat-updated", payload);
    });

    socket.on("guest-request", (payload: any) => {
      io.to(payload.roomId).emit("new-guest-request", payload);
    });

    socket.on("room-event", (payload: any) => {
      io.to(payload.roomId).emit("room-update", payload);
    });

    // PHASE 7.7 - Moderation Events
    socket.on("moderator-action", (payload: any) => {
      io.to(payload.roomId).emit("live-moderation-action", payload);
    });

    socket.on("spam-detected", (payload: any) => {
      io.to(payload.roomId).emit("spam-alert", payload);
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
