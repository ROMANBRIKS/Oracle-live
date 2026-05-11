import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  ShieldAlert, Users, Globe, Smartphone, TrendingUp, 
  Terminal, Zap, Target, Activity, DollarSign
} from 'lucide-react';

const AdminMissionControl: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/admin/mission-control');
        setData(res.data);
      } catch (err) {
        console.error("Dashboard failed to load", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-emerald-500 font-mono">
      <Terminal className="animate-pulse mr-2" /> INITIALIZING MISSION CONTROL...
    </div>
  );

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const refreshData = async () => {
    try {
      const res = await axios.get('/api/admin/mission-control');
      setData(res.data);
    } catch (err) {
      console.error("Dashboard failed to load", err);
    }
  };

  const handleAction = async (id: number, action: 'approve' | 'reject' | 'complete') => {
    try {
      await axios.post(`/api/admin/withdrawals/${action}/${id}`);
      refreshData();
    } catch (err) {
      console.error(`Action ${action} failed`, err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
            <ShieldAlert className="text-emerald-500 w-10 h-10" />
            MISSON CONTROL <span className="text-emerald-500/50 text-sm font-mono tracking-widest">v4.2.0</span>
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-2">Active Surveillance: Global Corridors & Whale Logic Engine</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-emerald-500/30 px-6 py-3 rounded-xl flex flex-col items-end">
            <span className="text-[10px] text-emerald-500/60 font-mono uppercase tracking-widest">Growth Engine</span>
            <span className="text-emerald-500 font-bold">READY</span>
          </div>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Whales', val: data.summary.total_whales, icon: Target, color: 'text-emerald-400' },
          { label: 'Top Region', val: data.summary.top_growth_region, icon: Globe, color: 'text-blue-400' },
          { label: 'Platform Wealth', val: `${Math.round(data.summary.platform_wealth)}k USD`, icon: DollarSign, color: 'text-amber-400' },
          { label: 'Payout Queue', val: data.summary.pending_withdrawals, icon: Activity, color: 'text-red-400' }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="bg-slate-900 border border-white/5 p-6 rounded-2xl relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 p-4 opacity-10 ${stat.color}`}>
              <stat.icon size={48} />
            </div>
            <p className="text-slate-500 text-sm font-mono uppercase mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-white">{stat.val}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Whale Geography Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-white/5 p-6 rounded-3xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Globe className="text-blue-500" /> High-Value Target Locations
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.geography}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                <XAxis dataKey="location_iso" stroke="#ffffff40" fontSize={12} />
                <YAxis stroke="#ffffff40" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Distribution */}
        <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Smartphone className="text-emerald-500" /> Luxury Device Index
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.devices}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {data.devices.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {data.devices.map((d: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-sm font-mono">
                <span className="text-slate-500">{d.device_info || 'Unknown iPhone'}</span>
                <span className="text-white">{d.count} Users</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Whale Activity */}
        <div className="lg:col-span-2 bg-slate-900 border border-white/5 p-6 rounded-3xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="text-amber-500" /> Recent Capital Flow
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-white/5">
                  <th className="pb-4 font-normal">Identity</th>
                  <th className="pb-4 font-normal">Region</th>
                  <th className="pb-4 font-normal">Capital</th>
                  <th className="pb-4 font-normal">Whale Score</th>
                  <th className="pb-4 font-normal">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.recent_activity.map((act: any, i: number) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="py-4 font-bold text-white">{act.username}</td>
                    <td className="py-4 text-blue-400">{act.location_iso}</td>
                    <td className="py-4 text-emerald-400 font-mono">${act.amount}</td>
                    <td className="py-4">
                      <div className="bg-slate-800 rounded-full h-1.5 w-24">
                        <div 
                          className="bg-emerald-500 h-1.5 rounded-full" 
                          style={{ width: `${Math.min(act.whale_score, 100)}%` }} 
                        />
                      </div>
                    </td>
                    <td className="py-4 text-xs text-slate-500">{act.device_info?.substring(0, 20)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Viral Leaderboard */}
        <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Zap className="text-amber-400" /> Viral Propulsion Leads
          </h2>
          <div className="space-y-6">
            {data.viral_performance.map((vp: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-emerald-500">
                  #{i+1}
                </div>
                <div className="flex-1">
                  <p className="font-bold">{vp.username}</p>
                  <p className="text-xs text-slate-500 font-mono">{vp.viral_points} Momentum Points</p>
                </div>
                <div className="w-12 h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div className="bg-amber-400 h-full" style={{ width: `${(vp.viral_points / 500) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-xl font-bold text-sm hover:bg-emerald-500 hover:text-black transition-all">
            MANUAL OVERRIDE: PUSH ALGO
          </button>
        </div>
      </div>

      {/* Withdrawal Queue */}
      <div className="mt-8 bg-slate-900 border border-white/5 p-6 rounded-3xl">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-400">
          <Activity size={24} /> Liquidity & Payout Pipeline
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-white/5">
                <th className="pb-4 font-normal">Merchant/User</th>
                <th className="pb-4 font-normal">Amount</th>
                <th className="pb-4 font-normal">Currency</th>
                <th className="pb-4 font-normal">Status</th>
                <th className="pb-4 font-normal">Wallet Address</th>
                <th className="pb-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-600 font-mono italic">No pending payouts in pipeline</td>
                </tr>
              ) : (
                data.withdrawals.map((w: any, i: number) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="py-4 font-bold text-white">{w.username}</td>
                    <td className="py-4 text-emerald-400 font-mono">{w.amount}</td>
                    <td className="py-4 text-blue-400 font-black">{w.currency}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                        w.status === 'queued' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-4 font-mono text-[10px] text-slate-500">{w.wallet_address}</td>
                    <td className="py-4 text-right space-x-2">
                      {w.status === 'pending' || w.status === 'queued' ? (
                        <button 
                          onClick={() => handleAction(w.id, 'approve')}
                          className="px-3 py-1 bg-emerald-500 text-black rounded-lg font-bold text-[10px] uppercase hover:scale-105 transition-all"
                        >
                          Approve
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleAction(w.id, 'complete')}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg font-bold text-[10px] uppercase hover:scale-105 transition-all"
                        >
                          Complete
                        </button>
                      )}
                      <button 
                        onClick={() => handleAction(w.id, 'reject')}
                        className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg font-bold text-[10px] uppercase hover:bg-red-500 hover:text-white transition-all"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMissionControl;
