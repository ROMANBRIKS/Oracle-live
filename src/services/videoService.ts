import { VideoPost } from "../types";

const STORAGE_KEY = "oracle_videos";

const DEFAULT_VIDEOS: VideoPost[] = [
  {
    id: "1",
    author: "neon_demon",
    caption: "Midnight in the hyper-loop. #cyberpunk #future #protocol",
    music: "Nightcall - Kavinsky",
    likes: "42.5k",
    commentsCount: "1",
    shares: "12.4k",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-in-a-futuristic-metropolis-34358-large.mp4",
    comments: [
      { id: "c1", author: "glitch_fixer", text: "Quality is insane!", createdAt: new Date().toISOString() }
    ]
  },
  {
    id: "2",
    author: "zero_day",
    caption: "Decrypting the oracle. #hacking #matrix #coding",
    music: "The Matrix OST - Clubbed to Death",
    likes: "128k",
    commentsCount: "0",
    shares: "45k",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-computer-34351-large.mp4",
    comments: []
  },
  {
    id: "3",
    author: "bit_voyager",
    caption: "Floating through the ether. #space #ambient #stars",
    music: "Weightless - Marconi Union",
    likes: "12k",
    commentsCount: "0",
    shares: "1.2k",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-rotating-planet-earth-in-the-starry-outer-space-34354-large.mp4",
    comments: []
  }
];

export const videoService = {
  getVideos: (): VideoPost[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_VIDEOS));
      return DEFAULT_VIDEOS;
    }
    return JSON.parse(stored);
  },

  addVideo: (video: Omit<VideoPost, "id" | "likes" | "commentsCount" | "shares">) => {
    const videos = videoService.getVideos();
    const newVideo: VideoPost = {
      ...video,
      id: Math.random().toString(36).substr(2, 9),
      likes: "0",
      commentsCount: "0",
      shares: "0",
      comments: [],
    };
    const updated = [newVideo, ...videos];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newVideo;
  },

  likeVideo: (id: string) => {
    const videos = videoService.getVideos();
    const updated = videos.map(v => {
      if (v.id === id) {
        const val = parseFloat(v.likes.replace("k", "")) || 0;
        return { ...v, likes: `${(val + 0.1).toFixed(1)}k` };
      }
      return v;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  addComment: (videoId: string, comment: string, author: string) => {
    const videos = videoService.getVideos();
    const updated = videos.map(v => {
      if (v.id === videoId) {
        const newComments = [...(v.comments || []), {
          id: Math.random().toString(36).substr(2, 9),
          author,
          text: comment,
          createdAt: new Date().toISOString()
        }];
        return { 
          ...v, 
          comments: newComments,
          commentsCount: newComments.length.toString()
        };
      }
      return v;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};
