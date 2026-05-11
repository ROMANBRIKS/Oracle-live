import AgoraRTC, { IAgoraRTCClient, ILocalVideoTrack, ILocalAudioTrack, IRemoteVideoTrack, IRemoteAudioTrack } from "agora-rtc-sdk-ng";

// Configuration Placeholders
const APP_ID = "d3b72eb77b1d42a1be7b1e1e996636ef"; // Updated with user provided ID
const TOKEN = null; // Use null for testing (if App ID has certificate disabled) or generate a token

export class AgoraService {
  private client: IAgoraRTCClient;
  private localAudioTrack: ILocalAudioTrack | null = null;
  private localVideoTrack: ILocalVideoTrack | null = null;
  private isJoining = false;
  private isJoined = false;

  constructor() {
    this.client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
  }

  async join(channel: string, uid: string | number | null, role: "host" | "audience") {
    if (this.isJoining || this.isJoined) {
      console.warn("Agora: Join already in progress or completed");
      return role === "host" ? { audio: this.localAudioTrack, video: this.localVideoTrack } : null;
    }

    try {
      this.isJoining = true;
      await this.client.setClientRole(role);
      // If the error 'dynamic use static key' persists, the user MUST disable
      // the App Certificate in their Agora Console for this project or provide a token.
      await this.client.join(APP_ID, channel, TOKEN, uid);
      this.isJoined = true;

      if (role === "host") {
        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
        await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
        return { audio: this.localAudioTrack, video: this.localVideoTrack };
      }
    } catch (error) {
      console.error("Agora join error:", error);
      this.isJoined = false;
      throw error;
    } finally {
      this.isJoining = false;
    }
    return null;
  }

  async leave() {
    try {
      this.localAudioTrack?.close();
      this.localVideoTrack?.close();
      this.localAudioTrack = null;
      this.localVideoTrack = null;
      if (this.isJoined) {
        await this.client.leave();
      }
    } catch (error) {
      console.error("Agora leave error:", error);
    } finally {
      this.isJoined = false;
      this.isJoining = false;
    }
  }

  onUserPublished(callback: (user: any, mediaType: "audio" | "video") => void) {
    this.client.on("user-published", callback);
  }

  onUserUnpublished(callback: (user: any) => void) {
    this.client.on("user-unpublished", callback);
  }

  async subscribe(user: any, mediaType: "audio" | "video") {
    await this.client.subscribe(user, mediaType);
    if (mediaType === "video") {
      return user.videoTrack;
    }
    if (mediaType === "audio") {
      user.audioTrack.play();
    }
    return null;
  }
}

export const agoraService = new AgoraService();
