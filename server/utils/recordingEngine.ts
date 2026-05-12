import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

try {
  if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
  }
} catch (e) {
  console.error("Failed to set ffmpeg path:", e);
}

interface HLSConfig {
  input: string;
  output: string;
}

export function convertToHLS({ input, output }: HLSConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .outputOptions([
        "-preset veryfast",
        "-g 48",
        "-sc_threshold 0",
        "-map 0:0",
        "-map 0:1",
        "-s:v:0 1280x720",
        "-b:v:0 2800k",
        "-b:a:0 128k",
        "-f hls",
        "-hls_time 4",
        "-hls_playlist_type vod",
      ])
      .output(output)
      .on("end", () => resolve())
      .on("error", (err) => {
        console.error("FFmpeg HLS conversion error:", err);
        reject(err);
      })
      .run();
  });
}
