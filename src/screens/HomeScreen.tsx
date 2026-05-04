import { useEffect, useState, useRef } from "react";
import { Heart, MessageCircle, Share2, Music2, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VideoPost {
  id: string;
  author: string;
  caption: string;
  music: string;
  likes: string;
  comments: string;
  shares: string;
  videoUrl: string;
}

const DUMMY_POSTS: VideoPost[] = [
  {
    id: "1",
    author: "@creative_mind",
    caption: "Sunset in the mountains! #nature #vibe #oraclelive",
    music: "Original sound - Creative Mind",
    likes: "128k",
    comments: "3.2k",
    shares: "15k",
    videoUrl: "https://v1.bg.ot07.com/is/51e3c8/p/30026e/mixkit-curvy-road-between-forest-and-mountain-450-large.mp4",
  },
  {
    id: "2",
    author: "@tech_explorer",
    caption: "New VR gear just arrived 🚀 #tech #future #oraclelive",
    music: "Techno Beats - DJ Spark",
    likes: "256k",
    comments: "10.5k",
    shares: "42k",
    videoUrl: "https://v1.bg.ot07.com/is/f6f0c6/p/0/mixkit-set-of-plate-and-cutlery-on-a-table-4444-large.mp4",
  },
];

export default function HomeScreen() {
  return (
    <div className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
      {DUMMY_POSTS.map((post) => (
        <VideoItem key={post.id} post={post} />
      ))}
    </div>
  );
}

function VideoItem({ post }: { post: VideoPost }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!error) videoRef.current?.play().catch(() => {});
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, [error]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="h-screen w-full snap-start relative flex items-center justify-center bg-black">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50">
          <Play className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-xs uppercase tracking-widest font-black">Signal Lost</p>
          <p className="text-[10px] opacity-40">Unsupported media source</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={post.videoUrl}
          className="h-full w-full object-cover"
          loop
          muted
          playsInline
          onClick={togglePlay}
          onError={() => setError(true)}
        />
      )}

      {/* Grid Overlay for aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-black/20 pointer-events-none" />

      {/* Top Tabs Mockup */}
      <div className="absolute top-8 left-0 right-0 flex justify-center gap-4 text-xs font-bold z-10">
        <span className="opacity-60">Following</span>
        <span className="border-b-2 border-white pb-1">For You</span>
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 pb-24 z-10">
        <div className="flex items-end justify-between w-full">
          {/* Caption and Info */}
          <div className="flex-1 max-w-[80%] text-white space-y-3">
            <h3 className="font-bold text-sm">@{post.author.replace('@', '')}</h3>
            <p className="text-xs opacity-80 leading-snug line-clamp-2">{post.caption}</p>
            <div className="flex items-center space-x-2">
              <Music2 className="w-3 h-3 animate-spin-slow" />
              <span className="text-[10px] truncate opacity-70">{post.music}</span>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="flex flex-col items-center space-y-6 mb-4">
            <div className="flex flex-col items-center space-y-1">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-[10px] font-bold">{post.likes}</span>
            </div>
            
            <div className="flex flex-col items-center space-y-1">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-[10px] font-bold">{post.comments}</span>
            </div>

            <div className="flex flex-col items-center space-y-1">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-[10px] font-bold">Share</span>
            </div>

            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden bg-slate-800"
            >
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`} alt="author" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
