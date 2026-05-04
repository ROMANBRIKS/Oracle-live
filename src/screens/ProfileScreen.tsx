import { Grid, Bookmark, Heart, Settings, Edit2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function ProfileScreen() {
  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">@oracle_architect</h2>
        <div className="flex items-center gap-4">
          <Settings className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center py-12 px-6 bg-gradient-to-b from-slate-900/50 to-transparent">
        <div className="w-24 h-24 rounded-full border-2 border-orange-500 p-1 mb-6 shadow-2xl shadow-orange-500/10">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-4xl shadow-inner">
            👨‍💻
          </div>
        </div>
        <h1 className="text-2xl font-black tracking-tighter mb-1">Senior Architect</h1>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-8 font-bold">@oracle_architect</p>

        <div className="grid grid-cols-3 gap-10 mb-10">
          <div className="text-center">
            <div className="font-black text-lg leading-none">2.4k</div>
            <div className="text-[8px] uppercase tracking-[0.15em] text-slate-500 font-bold mt-1">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-black text-lg leading-none">418</div>
            <div className="text-[8px] uppercase tracking-[0.15em] text-slate-500 font-bold mt-1">Following</div>
          </div>
          <div className="text-center">
            <div className="font-black text-lg leading-none">45.1k</div>
            <div className="text-[8px] uppercase tracking-[0.15em] text-slate-500 font-bold mt-1">Likes</div>
          </div>
        </div>

        <div className="flex gap-3 w-full max-w-sm">
          <Button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest text-[10px] h-12 rounded-xl shadow-lg shadow-orange-900/20">
            Go Live Now
          </Button>
          <Button variant="outline" className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] h-12 rounded-xl">
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="w-full bg-black/40 backdrop-blur-md border-y border-white/5 h-14 p-0">
          <TabsTrigger value="videos" className="flex-1 h-full data-[state=active]:bg-white/5 data-[state=active]:text-orange-500 rounded-none border-r border-white/5">
            <Grid className="w-5 h-5" />
          </TabsTrigger>
          <TabsTrigger value="liked" className="flex-1 h-full data-[state=active]:bg-white/5 data-[state=active]:text-orange-500 rounded-none">
            <Heart className="w-5 h-5" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="videos" className="p-1 grid grid-cols-3 gap-1 bg-black/20">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="aspect-square bg-slate-900 group relative rounded-sm overflow-hidden border border-white/5">
              <img 
                src={`https://picsum.photos/seed/${i + 500}/300/300`} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                alt="post"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter">
                <Grid className="w-2.5 h-2.5 text-orange-500" />
                {Math.floor(Math.random() * 100)}K
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="liked" className="flex flex-col items-center justify-center py-24 text-slate-500 text-xs font-bold uppercase tracking-widest">
           <Heart className="w-12 h-12 mb-4 opacity-10 text-orange-500" />
           <p className="opacity-40">Private content</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
