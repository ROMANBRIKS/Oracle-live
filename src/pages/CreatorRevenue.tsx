import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { 
  Coins, Gem, DollarSign, ArrowUpRight, 
  TrendingUp, History, Landmark, ShieldCheck,
  ChevronRight, ArrowLeft, PieChart, Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreatorRevenue: React.FC = () => {
  const [revenue, setRevenue] = useState({
    coins: 0,
    diamonds: 0,
    estimatedUSD: 0,
    pending: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // MOCK DATA as requested for foundation
    setRevenue({
      coins: 250000,
      diamonds: 120000,
      estimatedUSD: 3400.50,
      pending: 450.00
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pb-32">
       {/* Header */}
       <header className="p-6 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate("/dashboard")} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <ArrowLeft size={20} />
             </button>
             <div>
                <h1 className="text-xl font-black italic uppercase tracking-tighter">Revenue Center</h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                   <ShieldCheck size={10} /> Verified Merchant Account
                </p>
             </div>
          </div>
          <button className="bg-white text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase italic tracking-widest hover:scale-105 transition-transform">
             Cash Out
          </button>
       </header>

       <div className="max-w-6xl mx-auto px-6 pt-12 space-y-10">
          {/* Main Stats Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-500 to-cyan-600 p-12 rounded-[4rem] relative overflow-hidden shadow-[0_30px_100px_rgba(16,185,129,0.2)]"
          >
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">Total Estimated Balance</p>
                <h2 className="text-7xl font-black italic tracking-tighter mb-8">${revenue.estimatedUSD.toLocaleString()}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-black/20 backdrop-blur-lg p-6 rounded-3xl border border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Pending Clearances</p>
                      <p className="text-2xl font-black italic tracking-tighter">${revenue.pending.toLocaleString()}</p>
                   </div>
                   <div className="bg-black/20 backdrop-blur-lg p-6 rounded-3xl border border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Platform Rank</p>
                      <p className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
                        TOP 1% <span className="text-xs bg-white/20 px-2 py-1 rounded text-white/60 not-italic uppercase tracking-widest">Global</span>
                      </p>
                   </div>
                </div>
             </div>

             {/* Background Decoration */}
             <div className="absolute top-0 right-0 p-12 opacity-10">
                <PieChart size={200} />
             </div>
             <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]" />
          </motion.div>

          {/* Asset Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <AssetCard 
                icon={<Coins className="text-amber-400" size={32} />}
                label="Oracle Coins"
                value={revenue.coins.toLocaleString()}
                color="border-amber-400/20"
                note="Ingame Currency"
             />
             <AssetCard 
                icon={<Gem className="text-cyan-400" size={32} />}
                label="Diamonds"
                value={revenue.diamonds.toLocaleString()}
                color="border-cyan-400/20"
                note="Redeemable Assets"
             />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <ActionCard icon={<History size={20} />} label="Earnings History" description="Detailed logs of all gifts and payouts received." />
             <ActionCard icon={<Landmark size={20} />} label="Bank Settings" description="Manage your MoMo and Bank account details." />
             <ActionCard icon={<Activity size={20} />} label="Revenue Insights" description="AI predictions for your potential next month earnings." />
          </div>

          {/* Growth Notice */}
          <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="text-center md:text-left">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Ready to scale?</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Join the Pro-Streamer Fund for direct sponsorship.</p>
             </div>
             <button className="liquid-glass border-white/20 px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                Apply for Growth Fund
             </button>
          </div>
       </div>
    </div>
  );
};

const AssetCard = ({ icon, label, value, color, note }: any) => (
  <div className={`bg-white/5 border ${color} p-10 rounded-[3.5rem] flex items-center justify-between group hover:bg-white/10 transition-all`}>
     <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-white/5 rounded-2.5xl flex items-center justify-center shadow-2xl">
           {icon}
        </div>
        <div>
           <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{note}</p>
           <h3 className="text-4xl font-black italic uppercase tracking-tighter">{value} <span className="text-sm opacity-20">{label.split(' ')[1]}</span></h3>
        </div>
     </div>
     <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
        <ChevronRight size={20} />
     </div>
  </div>
);

const ActionCard = ({ icon, label, description }: any) => (
  <button className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-left hover:bg-white/[0.08] transition-all group">
     <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 mb-6 group-hover:bg-cyan-500 group-hover:text-black transition-all">
        {icon}
     </div>
     <h4 className="text-lg font-black italic uppercase tracking-tighter mb-2">{label}</h4>
     <p className="text-[10px] font-bold text-white/20 leading-relaxed uppercase tracking-widest">{description}</p>
  </button>
);

export default CreatorRevenue;
