import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import axios from "axios";
import compression from "compression";
import helmet from "helmet";
import db from "./server/config/db";

// Routes
import userRoutes from "./server/routes/userRoutes";
import coinRoutes from "./server/routes/coinRoutes";
import recRoutes from "./server/routes/recRoutes";
import agencyRoutes from "./server/routes/agencyRoutes";
import adminRoutes from "./server/routes/adminRoutes";
import agoraRoutes from "./server/routes/agoraRoutes";
import analyticsRoutes from "./server/routes/analyticsRoutes";
import paymentRoutes from "./server/routes/paymentRoutes";
import cryptoRoutes from "./server/routes/cryptoRoutes";
import walletRoutes from "./server/routes/walletRoutes";
import growthRoutes from "./server/routes/growthRoutes";
import withdrawalRoutes from "./server/routes/withdrawalRoutes";
import adminWithdrawalRoutes from "./server/routes/adminWithdrawalRoutes";
import notificationRoutes from "./server/routes/notificationRoutes";
import kycRoutes from "./server/routes/kycRoutes";
import treasuryRoutes from "./server/routes/treasuryRoutes";
import pkRoutes from "./server/routes/pkRoutes";
import moderationRoutes from "./server/routes/moderationRoutes";
import blockchainRoutes from "./server/routes/blockchainRoutes";
import { initSocket, getIO } from "./server/socket/socketServer";
import { sendGift } from "./server/controllers/giftController";
import { processPKTick } from "./server/controllers/pkController";

import rateLimit from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SECRET = process.env.JWT_SECRET || "oracle_secret_fallback";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = initSocket(httpServer);
  const PORT = 3000;

  console.log("Starting server setup... NODE_ENV:", process.env.NODE_ENV);

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: "Too many requests, please try again later." }
  });
  app.use(limiter);

  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(compression());
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "alive", time: new Date() });
  });

  // 📁 MODULAR ROUTES
  app.use("/api/users", userRoutes);
  app.use("/api/coins", coinRoutes);
  app.use("/api/rec", recRoutes);
  app.use("/api/agencies", agencyRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/agora", agoraRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/crypto", cryptoRoutes);
  app.use("/api/wallets", walletRoutes);
  app.use("/api/growth", growthRoutes);
  app.use("/api/withdrawals", withdrawalRoutes);
  app.use("/api/admin/withdrawals", adminWithdrawalRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/kyc", kycRoutes);
  app.use("/api/treasury", treasuryRoutes);
  app.use("/api/pk", pkRoutes);
  app.use("/api/moderation", moderationRoutes);
  app.use("/api/blockchain", blockchainRoutes);
  app.use("/uploads", express.static("uploads"));

  // 🔔 SEND NOTIFICATION
  function sendNotification(userId: string | "all", message: string) {
    io.emit("notification", {
      userId,
      message,
      time: new Date(),
    });
  }

  // Remaining APIs (Will move fully later as needed)
  app.post("/api/send-gift", (req, res) => {
    sendGift(req, res);
    const { userId, giftType } = req.body;
    sendNotification("host1", `${userId} sent a ${giftType} 🎁`);
  });

  // 🔴 SOCKET.IO LOGIC removed - moved to server/socket/socketServer.ts

  // PK Timer
  setInterval(() => {
    const io = getIO();
    processPKTick(io);
  }, 1000);

  // GOOGLE OAUTH (Cleanup later)
  app.get("/api/auth/google/url", (req, res) => {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: `${process.env.APP_URL || "http://localhost:3000"}/auth/callback/google`,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"].join(" "),
    };
    const qs = new URLSearchParams(options);
    res.json({ url: `${rootUrl}?${qs.toString()}` });
  });

  app.get("/auth/callback/google", async (req, res) => {
    const code = req.query.code as string;
    try {
      const { data } = await axios.post("https://oauth2.googleapis.com/token", {
        code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.APP_URL || "http://localhost:3000"}/auth/callback/google`, grant_type: "authorization_code",
      });
      const { id_token, access_token } = data;
      const googleUser = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
        headers: { Authorization: `Bearer ${id_token}` },
      });
      const username = googleUser.data.name;
      const email = googleUser.data.email;
      const externalId = googleUser.data.id;
      
      let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
      if (!user) {
        const id = `g_${externalId}`;
        const role = email === "irionguard@gmail.com" ? "admin" : "user";
        db.prepare("INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)").run(id, username, email, "google-auth-no-pass", role);
        user = { id, username, email, role };
      } else {
        // Upgrade to admin if email matches
        if (email === "irionguard@gmail.com" && user.role !== "admin") {
          db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email);
          user.role = "admin";
        }
      }
      
      const token = jwt.sign({ username: user.username, userId: user.id, role: user.role, email: user.email }, SECRET);
      const authResponse = { type: "OAUTH_AUTH_SUCCESS", token, user };
      res.send(`<html><body><script>window.opener.postMessage(${JSON.stringify(authResponse)}, "*"); window.close();</script></body></html>`);
    } catch (err) { res.status(500).send("Google Auth Failed"); }
  });

  app.get("/api/videos", (req, res) => {
    res.json([{ id: 1, url: "https://www.w3schools.com/html/mov_bbb.mp4", user: "User1" }, { id: 2, url: "https://www.w3schools.com/html/movie.mp4", user: "User2" }]);
  });

  // Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  httpServer.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
