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
import fiatWithdrawalRoutes from "./server/routes/fiatWithdrawalRoutes";
import staffAdminRoutes from "./server/routes/staffAdminRoutes";
import adminsManagementRoutes from "./server/routes/adminsManagementRoutes";
import adminTreasuryRoutes from "./server/routes/adminTreasuryRoutes";
import recommendationRoutes from "./server/routes/recommendationRoutes";
import clipRoutes from "./server/routes/clipRoutes";
import hlsRoutes from "./server/routes/hlsRoutes";
import giftRoutes from "./server/routes/giftRoutes";
import leaderboardRoutes from "./server/routes/leaderboardRoutes";
import multiGuestRoutes from "./server/routes/multiGuestRoutes";
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
  const PORT = 3000;

  // 1. LISTEN IMMEDIATELY - This bypasses the "Please wait..." screen
  httpServer.on('error', (e) => {
    console.error('SERVER ERROR:', e);
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 INSTANT BOOT: Server listening on http://0.0.0.0:${PORT}`);
  });

  // 2. Initial Setup
  console.log("Initializing Socket.io...");
  const io = initSocket(httpServer);
  console.log("Middlewares...");
  app.use(compression());
  app.use(cors());
  app.use(express.json());
  
  // Basic Health check available immediately
  app.get("/api/health", (req, res) => res.json({ 
    status: "active", 
    mode: process.env.GOOGLE_CLIENT_ID ? "production" : "demo",
    time: new Date() 
  }));

  // 3. Heavy Route & Vite Registration (Non-blocking)
  console.log("Loading routes...");
  
  app.use(helmet({ contentSecurityPolicy: false }));
  
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: "Too many requests" }
  });
  app.use(limiter);

  // Modular Routes
  const routes = [
    ["/api/users", userRoutes], ["/api/coins", coinRoutes], ["/api/rec", recRoutes],
    ["/api/agencies", agencyRoutes], ["/api/admin", adminRoutes], ["/api/agora", agoraRoutes],
    ["/api/analytics", analyticsRoutes], ["/api/payments", paymentRoutes], ["/api/crypto", cryptoRoutes],
    ["/api/wallets", walletRoutes], ["/api/wallet", walletRoutes], ["/api/growth", growthRoutes],
    ["/api/withdrawals", withdrawalRoutes], ["/api/admin/withdrawals", adminWithdrawalRoutes],
    ["/api/notifications", notificationRoutes], ["/api/kyc", kycRoutes], ["/api/treasury", treasuryRoutes],
    ["/api/pk", pkRoutes], ["/api/moderation", moderationRoutes], ["/api/blockchain", blockchainRoutes],
    ["/api/fiat", fiatWithdrawalRoutes], ["/api/staff-admin", staffAdminRoutes],
    ["/api/admins", adminsManagementRoutes], ["/api/admin", adminTreasuryRoutes],
    ["/api/recommendations", recommendationRoutes], ["/api/clips", clipRoutes],
    ["/api/hls", hlsRoutes], ["/api/gifts", giftRoutes], ["/api/leaderboard", leaderboardRoutes],
    ["/api/multi-guest", multiGuestRoutes]
  ];

  routes.forEach(([path, handler]) => {
    try {
        app.use(path as string, handler as any);
    } catch (e) {
        console.error(`Failed to load route ${path}:`, e);
    }
  });

  app.use("/uploads", express.static("uploads"));

  // Vite Engine
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Vite Dev Server...");
    createViteServer({ 
      server: { middlewareMode: true, hmr: false }, 
      appType: "spa" 
    }).then(vite => {
      app.use(vite.middlewares);
      console.log("✅ Vite Ready.");
    }).catch(err => {
      console.error("VITE INITIALIZATION FAILED:", err);
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { maxAge: "1d", etag: true, index: false }));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  // Background Ticks
  setInterval(() => {
    try {
        const socketIO = getIO();
        if (socketIO) {
            processPKTick(socketIO);
        }
    } catch (e) {
        // Silently fail if IO not ready
    }
  }, 1000);

  // GOOGLE OAUTH
  app.get("/api/auth/google/url", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.json({ 
        url: `${process.env.APP_URL || "http://localhost:3000"}/auth/callback/google/mock`,
        isDemo: true 
      });
    }

    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: `${process.env.APP_URL || "http://localhost:3000"}/auth/callback/google`,
      client_id: clientId,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"].join(" "),
    };
    const qs = new URLSearchParams(options);
    res.json({ url: `${rootUrl}?${qs.toString()}` });
  });

  app.get("/auth/callback/google/mock", async (req, res) => {
    console.log("[DEMO MODE] Bypassing Google OAuth. Creating demo session.");
    const demoUser = {
      id: "demo_user_" + Date.now(),
      email: "demo@example.com",
      name: "Demo User",
      picture: "https://i.pravatar.cc/150?u=demo"
    };

    // Insert or update demo user in DB
    db.prepare("INSERT OR IGNORE INTO users (id, email, username, name, avatar_url, coins) VALUES (?, ?, ?, ?, ?, ?)")
      .run(demoUser.id, demoUser.email, "demouser", demoUser.name, demoUser.picture, 1000);

    const token = jwt.sign(demoUser, SECRET, { expiresIn: "7d" });
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/success?token=${token}`);
  });

  app.get("/auth/callback/google", async (req, res) => {
    const code = req.query.code as string;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).send("Google OAuth is not fully configured on this server.");
    }

    try {
      const { data } = await axios.post("https://oauth2.googleapis.com/token", {
        code, 
        client_id: clientId, 
        client_secret: clientSecret,
        redirect_uri: `${process.env.APP_URL || "http://localhost:3000"}/auth/callback/google`, 
        grant_type: "authorization_code",
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
}

startServer().catch(err => {
  console.error("CRITICAL BOOT FAILURE:", err);
  process.exit(1);
});
