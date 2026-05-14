import express from "express";
import * as AgoraAccessToken from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = AgoraAccessToken;

const router = express.Router();

router.post("/token", async (req, res) => {
  try {
    const { channelName, uid, role } = req.body;

    if (!channelName || !uid) {
      return res.status(400).json({ success: false, message: "channelName and uid are required" });
    }

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERT;

    if (!appId || !appCertificate) {
      console.warn("[DEMO MODE] AGORA_APP_ID or AGORA_APP_CERT is missing. Sending mock token.");
      return res.json({ success: true, token: "MOCK_TOKEN_" + Date.now(), isDemo: true });
    }

    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const rtcRole = role === "host" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      rtcRole,
      privilegeExpiredTs
    );

    res.json({ success: true, token });
  } catch (err: any) {
    console.error("Token generation failed:", err);
    res.status(500).json({ success: false, message: "Failed to generate Agora token" });
  }
});

export default router;
