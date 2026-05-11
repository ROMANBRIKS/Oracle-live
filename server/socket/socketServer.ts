import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

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

    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("send-message", (data: any) => {
      if (data.roomId) {
        io.to(data.roomId).emit("receive-message", data);
      } else {
        io.emit("receive-message", data);
      }
    });

    socket.on("gift-sent", (data: any) => {
      if (data.roomId) {
        io.to(data.roomId).emit("gift-animation", data);
      } else {
        io.emit("gift-animation", data);
      }
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
