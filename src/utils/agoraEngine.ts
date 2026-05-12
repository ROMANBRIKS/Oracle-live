import AgoraRTC, { IAgoraRTCClient, IMicrophoneAudioTrack, ICameraVideoTrack } from "agora-rtc-sdk-ng";

const appId = import.meta.env.VITE_AGORA_APP_ID;

export const client: IAgoraRTCClient = AgoraRTC.createClient({
  mode: "live",
  codec: "vp8",
});

interface JoinParams {
  channel: string;
  token: string | null;
  uid: string | number | null;
}

export async function joinAsHost({ channel, token, uid }: JoinParams): Promise<{
  micTrack: IMicrophoneAudioTrack;
  cameraTrack: ICameraVideoTrack;
}> {
  if (!appId) {
    throw new Error("AGORA_APP_ID is missing. Please configure VITE_AGORA_APP_ID in your environment.");
  }
  // Join the channel
  await client.join(appId, channel, token, uid);

  // Set role to host to allow publishing
  await client.setClientRole("host");

  // Create local tracks
  const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
  const cameraTrack = await AgoraRTC.createCameraVideoTrack();

  // Publish tracks to the channel
  await client.publish([micTrack, cameraTrack]);

  return { micTrack, cameraTrack };
}

export async function joinAsAudience({ channel, token, uid }: JoinParams): Promise<void> {
  await client.join(appId, channel, token, uid);
  await client.setClientRole("audience");
}

export async function leaveChannel(): Promise<void> {
  // Stop local tracks
  client.localTracks.forEach((track) => {
    track.stop();
    track.close();
  });
  
  await client.leave();
}
