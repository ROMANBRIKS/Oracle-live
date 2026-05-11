import AgoraRTC from "agora-rtc-sdk-ng";

export const APP_ID = (import.meta as any).env.VITE_AGORA_APP_ID || "";

export const client = AgoraRTC.createClient({
  mode: "live",
  codec: "vp8",
});
