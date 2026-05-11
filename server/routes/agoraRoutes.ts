import express from "express";
import pkg from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = pkg;

import auth from "../middleware/auth";

const router = express.Router();

const APP_ID = process.env.AGORA_APP_ID || "";
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || "";

router.post("/generate-token", auth, (req, res) => {
  const { channelName, uid, role } = req.body;

  if (!channelName) {
    return res.status(400).json({ error: "channelName is required" });
  }

  if (!APP_ID || !APP_CERTIFICATE) {
    // During dev, and for our preview environment, we'll allow working without keys
    // by returning a mock token if keys are missing, but warn the user.
    console.warn("Agora App ID or Certificate missing in .env");
    return res.json({ 
        token: "DEVELOPMENT_TOKEN", 
        warning: "Agora credentials missing. Real video will not work until AGORA_APP_ID/CERTIFICATE are set in environment." 
    });
  }

  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const rtcRole = role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid || 0,
    rtcRole,
    privilegeExpiredTs
  );

  res.json({ token, appId: APP_ID });
});

export default router;
