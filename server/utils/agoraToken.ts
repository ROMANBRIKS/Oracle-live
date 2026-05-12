import { RtcTokenBuilder, RtcRole } from "agora-access-token";
import agora from "../config/agora";

export interface TokenRequest {
  channelName: string;
  uid: number;
  role: "host" | "audience";
}

export function generateToken({ channelName, uid, role }: TokenRequest) {
  try {
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const rtcRole = role === "host" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    const token = RtcTokenBuilder.buildTokenWithUid(
      agora.appId,
      agora.appCertificate,
      channelName,
      uid,
      rtcRole,
      privilegeExpiredTs
    );

    return {
      success: true,
      token,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message,
    };
  }
}
