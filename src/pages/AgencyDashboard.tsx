import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import { Users, TrendingUp, DollarSign, Shield, ChevronRight, UserPlus, Search, LayoutDashboard, Settings, LogOut, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AgencyDashboard() {
  const [members, setMembers] = useState<any[]>([]);
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // For demo, we use a sample agency ID if none provided
  const agencyId = "sample-agency";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all agencies for demo and find the sample one
        const agenciesRes = await axios.get("/api/agencies");
        let currentAgency = agenciesRes.data.find((a: any) => a.id === agencyId);
        
        if (!currentAgency && agenciesRes.data.length > 0) {
            currentAgency = agenciesRes.data[0];
        }
        
        if (currentAgency) {
            setAgency(currentAgency);
            const membersRes = await axios.get(`/api/agencies/members/${currentAgency.id}`);
            setMembers(membersRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch agency data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-10">
        <h2 className="text-3xl font-black uppercase italic mb-4">No Agency Found</h2>
        <p className="text-gray-400 mb-8 max-w-md text-center">You need to create or be part of an agency to access this dashboard.</p>
        <button onClick={() => navigate("/")} className="bg-white text-black px-8 py-3 rounded-2xl font-black uppercase italic tracking-widest">Go Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-zinc-900/50 border-r border-white/5 flex flex-col p-6 fixed h-full z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl italic text-white shadow-lg shadow-indigo-600/20">O</div>
            <span className="hidden md:block text-lg font-black tracking-tighter italic uppercase">Oracle Agency</span>
        </div>

        <nav className="flex-1 space-y-2">
            {[
                { icon: LayoutDashboard, label: 'Dashboard', active: true },
                { icon: Users, label: 'Creators' },
                { icon: TrendingUp, label: 'Analytics' },
                { icon: Search, label: 'Recruit' },
                { icon: Settings, label: 'Settings' }
            ].map((item, i) => (
                <button 
                  key={i} 
                  className={`w-full p-3 rounded-2xl flex items-center gap-4 transition-all group ${item.active ? 'bg-indigo-600 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                >
                    <item.icon size={20} />
                    <span className="hidden md:block text-sm font-bold">{item.label}</span>
                </button>
            ))}
        </nav>

        <button className="p-3 rounded-2xl flex items-center gap-4 text-red-400 hover:bg-red-400/10 transition-all mt-auto mb-10">
            <LogOut size={20} />
            <span className="hidden md:block text-sm font-bold">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20 md:ml-64 p-6 md:p-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400">
                        {agency.region || 'GLOBAL'} HQ
                    </span>
                    {agency.verified ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                            <Shield size={12} /> Verified Agency
                        </span>
                    ) : null}
                </div>
                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
                    {agency.name}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <button className="bg-white text-black px-6 py-3 rounded-2xl text-sm font-black italic tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                    <UserPlus size={18} />
                    RECRUIT TALENT
                </button>
            </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
                { label: 'Total Creators', value: agency.total_creators, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { label: 'Total Revenue', value: `${agency.total_revenue.toLocaleString()} Coins`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                { label: 'Commission Rate', value: `${agency.commission_rate}%`, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-400/10' }
            ].map((stat, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="bg-zinc-900/50 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group"
                >
                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
                        <stat.icon size={24} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">{stat.label}</p>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">{stat.value}</h2>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
                </motion.div>
            ))}
        </div>

        {/* Members Table */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-[3rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Creator Roster</h3>
                <div className="flex items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer text-xs font-bold uppercase tracking-widest">
                    <span>View All</span>
                    <ChevronRight size={14} />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Creator</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Revenue (Coins)</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Agency Share</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        <AnimatePresence>
                            {members.map((member, i) => (
                                <motion.tr 
                                  key={member.creator_id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="hover:bg-white/5 transition-colors group"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <img 
                                              src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.creator_id}`} 
                                              className="w-12 h-12 rounded-2xl border border-white/10"
                                              alt={member.username} 
                                            />
                                            <div>
                                                <p className="font-black italic uppercase tracking-tight text-lg leading-none mb-1">{member.username}</p>
                                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Oracle Creator</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-emerald-400 text-lg">{(member.revenue_generated || 0).toLocaleString()}</span>
                                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Lifetime Coins</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-indigo-400 text-lg">{(member.agency_commission_earned || 0).toLocaleString()}</span>
                                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{agency.commission_rate}% Cut</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            member.contract_status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                            {member.contract_status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                                            <LayoutGrid size={18} className="text-white/40" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
}
