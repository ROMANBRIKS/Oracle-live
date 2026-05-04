import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Radio } from "lucide-react";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-orange-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-cyan-600/20 rounded-full blur-[100px]" />

      <div className="flex flex-col items-center mb-12 z-10">
        <div className="w-20 h-20 bg-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-orange-900/40 transform rotate-12">
          <Radio className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase">Oracle <span className="text-orange-500">Live</span></h1>
        <p className="text-slate-500 mt-3 font-bold uppercase tracking-[0.3em] text-[10px]">Connect • Stream • Conquer</p>
      </div>

      <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl z-10">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Channel</label>
            <Input 
              type="email" 
              placeholder="operator@oracle.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/40 border-white/5 h-14 rounded-xl focus:ring-orange-500 text-sm font-medium placeholder:text-slate-700"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Key</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/40 border-white/5 h-14 rounded-xl focus:ring-orange-500 text-sm font-medium placeholder:text-slate-700"
            />
          </div>

          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 h-14 font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-orange-900/20 transition-all active:scale-95">
            Initialize Session
          </Button>
        </form>

        <div className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest">
          <span className="text-slate-500">New Operator? </span>
          <button className="text-orange-400 hover:text-orange-300 transition-colors">Register Unit</button>
        </div>
      </div>
      
      <div className="absolute bottom-8 text-[8px] text-slate-700 uppercase tracking-[0.4em] font-black">
        Oracle Systems v1.0.4 Stb
      </div>
    </div>
  );
}
