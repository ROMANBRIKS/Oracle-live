import React, { useEffect, useState } from "react";
import { Users, Plus, Shield, Crown, TrendingUp, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";

interface Agency {
  id: number;
  name: string;
  owner_id: string;
  owner_name: string;
  member_count: number;
}

const Agency: React.FC = () => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [myAgency, setMyAgency] = useState<Agency | null>(null);
  const [agencyName, setAgencyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const localStorageUser = localStorage.getItem("user");
  const user = localStorageUser ? JSON.parse(localStorageUser) : null;

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [allAgenciesRes, myAgencyRes] = await Promise.all([
        axios.get("/api/agencies"),
        axios.get(`/api/agencies/user/${user.id}`)
      ]);
      setAgencies(allAgenciesRes.data);
      setMyAgency(myAgencyRes.data);
    } catch (err) {
      console.error("Failed to load agency data", err);
      setError("Failed to load agency data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAgency = async () => {
    if (!agencyName.trim() || !user) return;
    try {
      await axios.post("/api/agencies/create", {
        ownerId: user.id,
        agencyName: agencyName.trim()
      });
      setAgencyName("");
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create agency");
    }
  };

  const handleJoinAgency = async (agencyId: number) => {
    if (!user) return;
    try {
      await axios.post("/api/agencies/join", {
        userId: user.id,
        agencyId
      });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to join agency");
    }
  };

  if (loading && agencies.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      {/* Header Section */}
      <section className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
          <Users className="text-cyan-400" size={32} />
          Agency Hub
        </h1>
        <p className="text-white/50 text-sm font-medium uppercase tracking-widest">
          Recruit Hosts • Scale Earnings • Build Empire
        </p>
      </section>

      {/* error toast if any */}
      <AnimatePresence>
        {error && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm font-bold flex justify-between items-center"
            >
                {error}
                <button onClick={() => setError(null)} className="opacity-50 hover:opacity-100 italic">Dismiss</button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* User Status / Create Section */}
      {!myAgency ? (
        <motion.div 
          className="crystal-glass p-8 rounded-[2rem] space-y-6 relative overflow-hidden group"
          whileHover={{ scale: 1.01 }}
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shield size={120} className="text-cyan-400" />
          </div>
          
          <div className="space-y-4 relative z-10">
            <h2 className="text-xl font-bold flex items-center gap-2 italic">
              <Plus className="text-cyan-400" /> Start Your Agency
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-[80%] italic">
              Become a business owner. Recruit streamers to your agency and earn a 5% cut on all their gifts.
            </p>
          </div>

          <div className="flex gap-2 relative z-10">
            <input
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="YOUR AGENCY NAME..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold tracking-tight focus:outline-none focus:border-cyan-400/50 transition-colors uppercase italic"
            />
            <button 
              onClick={handleCreateAgency}
              className="crystal-button bg-cyan-400/20 text-cyan-400 border-cyan-400/50 px-6 font-black uppercase text-xs italic tracking-widest hover:bg-cyan-400 hover:text-black transition-all"
            >
              CREATE
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="crystal-glass p-8 rounded-[2rem] border-cyan-400/20 bg-cyan-400/[0.02] space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6">
                <Crown size={40} className="text-yellow-400 opacity-50 shadow-[0_0_20px_rgba(250,204,21,0.3)]" />
             </div>
             
             <div className="space-y-1">
                <span className="text-cyan-400 text-[10px] font-black tracking-widest uppercase italic">ACTIVE CONTRACT</span>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">{myAgency.name}</h2>
                <div className="flex gap-4 pt-2">
                    <div className="flex flex-col">
                        <span className="text-white/30 text-[8px] font-bold uppercase tracking-widest">OWNER</span>
                        <span className="text-sm font-black italic uppercase">{myAgency.owner_name}</span>
                    </div>
                     <div className="flex flex-col">
                        <span className="text-white/30 text-[8px] font-bold uppercase tracking-widest">MEMBERS</span>
                        <span className="text-sm font-black italic uppercase text-cyan-400">{myAgency.member_count}</span>
                    </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3 pt-4">
                <button className="crystal-button bg-white/5 border-white/10 py-3 text-[10px] font-black uppercase italic tracking-widest">
                    Dashboard
                </button>
                <button className="crystal-button bg-white/5 border-white/10 py-3 text-[10px] font-black uppercase italic tracking-widest">
                    Manage
                </button>
             </div>
        </div>
      )}

      {/* Discovery Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
            <TrendingUp className="text-cyan-400" size={20} />
            Top Agencies
          </h3>
          <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Global Rankings</span>
        </div>

        <div className="space-y-3">
          {agencies.filter(a => a.id !== myAgency?.id).map((agency, index) => (
            <motion.div
              layout
              key={agency.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="crystal-glass p-5 rounded-2xl flex items-center justify-between group hover:border-cyan-400/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center font-black text-cyan-400 italic">
                  #{index + 1}
                </div>
                <div className="flex flex-col">
                  <h4 className="font-black uppercase italic tracking-tight group-hover:text-cyan-400 transition-colors uppercase">
                    {agency.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">Owner:</span>
                    <span className="text-[10px] text-cyan-400 font-black italic">{agency.owner_name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="block text-xs font-black text-white italic">{agency.member_count}</span>
                  <span className="block text-[8px] text-white/30 font-bold uppercase tracking-widest">Members</span>
                </div>
                {!myAgency && (
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleJoinAgency(agency.id);
                    }}
                    className="w-10 h-10 crystal-button rounded-xl flex items-center justify-center hover:bg-cyan-400 hover:text-black transition-all"
                  >
                    <Plus size={20} />
                  </button>
                )}
                <ChevronRight className="text-white/20 group-hover:text-cyan-400 transition-colors" size={20} />
              </div>
            </motion.div>
          ))}
          
          {agencies.filter(a => a.id !== myAgency?.id).length === 0 && (
            <div className="py-12 text-center crystal-glass rounded-3xl border-dashed">
                <p className="text-white/30 text-xs font-bold uppercase tracking-widest italic">No other agencies found...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Agency;
