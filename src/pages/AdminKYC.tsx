import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, CheckCircle, XCircle, Clock, 
  ExternalLink, Eye, MapPin, User, FileText
} from "lucide-react";

interface KYCRecord {
  id: number;
  userId: string;
  username: string;
  full_name: string;
  country: string;
  id_type: string;
  id_front: string;
  id_back: string;
  selfie: string;
  status: string;
  created_at: string;
}

const AdminKYC: React.FC = () => {
  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<KYCRecord | null>(null);

  const fetchRecords = async () => {
    try {
      const res = await axios.get("/api/kyc/all");
      setRecords(res.data);
    } catch (err) {
      console.error("Failed to fetch KYC records", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    let reason = "";
    if (action === 'reject') {
      reason = prompt("Enter Rejection Reason:") || "Invalid documents";
    }

    try {
      await axios.post(`/api/kyc/${action}/${id}`, { reason });
      fetchRecords();
      setSelected(null);
    } catch (err) {
      console.error(`KYC ${action} failed`, err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 italic uppercase tracking-tight">
            <ShieldCheck className="text-white/40" size={20} /> Identity Verification Center
          </h2>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">Global KYC Compliance & Document Auditing</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
      ) : records.length === 0 ? (
        <div className="py-20 text-center liquid-glass rounded-[3rem] border-dashed">
          <p className="text-white/20 text-[10px] font-black uppercase italic tracking-widest">No identity records found in database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(r)}
              className={`liquid-glass p-5 rounded-[2rem] group cursor-pointer border hover:border-blue-500/30 transition-all ${
                selected?.id === r.id ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                    r.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                    'bg-amber-500/10 text-amber-500'
                  }`}>
                    {r.status === 'approved' ? <CheckCircle size={20} /> : r.status === 'rejected' ? <XCircle size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <h3 className="font-black text-sm tracking-tight uppercase italic">{r.full_name}</h3>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">@{r.username}</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest font-mono">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  <span className={`text-[9px] font-black uppercase ${
                    r.status === 'approved' ? 'text-emerald-500' : 
                    r.status === 'rejected' ? 'text-red-500' : 'text-amber-400'
                  }`}>{r.status}</span>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                 <div className="flex-1 flex gap-2 overflow-hidden">
                    {[r.id_front, r.id_back, r.selfie].map((img, idx) => (
                      <div key={idx} className="w-12 h-12 bg-black rounded-lg overflow-hidden border border-white/10 shrink-0">
                         <img src={`/${img}`} alt="doc" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                 </div>
                 <Eye size={16} className="text-white/20 group-hover:text-blue-500 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Verification Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border border-white/10 w-full max-w-4xl rounded-[3rem] p-8 relative"
            >
              <button 
                onClick={() => setSelected(null)}
                className="absolute right-8 top-8 w-12 h-12 liquid-glass rounded-full flex items-center justify-center"
              >
                <XCircle size={24} />
              </button>

              <div className="flex gap-8 flex-col lg:flex-row">
                {/* Details */}
                <div className="w-full lg:w-1/3 space-y-6">
                  <div>
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-1">{selected.full_name}</h2>
                    <p className="text-blue-400 font-mono text-sm">@{selected.username}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-white/60">
                      <MapPin size={16} className="text-white/30" />
                      <span className="text-sm font-bold uppercase tracking-widest">{selected.country}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/60">
                      <IdentificationCard size={16} className="text-white/30" />
                      <span className="text-sm font-bold uppercase tracking-widest">{selected.id_type}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/60">
                      <Clock size={16} className="text-white/30" />
                      <span className="text-sm font-bold uppercase tracking-widest">{new Date(selected.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {selected.status === 'pending' && (
                    <div className="pt-8 flex flex-col gap-3">
                      <button 
                        onClick={() => handleAction(selected.id, 'approve')}
                        className="w-full py-4 bg-emerald-500 text-black rounded-2xl font-black uppercase italic tracking-widest hover:scale-105 transition-all"
                      >
                        Approve Identity
                      </button>
                      <button 
                         onClick={() => handleAction(selected.id, 'reject')}
                        className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black uppercase italic tracking-widest hover:bg-red-500 hover:text-white transition-all"
                      >
                        Reject Submission
                      </button>
                    </div>
                  )}
                </div>

                {/* Documents */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                   <div className="space-y-2">
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">ID Front Image</p>
                     <div className="aspect-[4/3] bg-black rounded-[2rem] border border-white/5 overflow-hidden group">
                        <img src={`/${selected.id_front}`} className="w-full h-full object-contain cursor-zoom-in" onClick={() => window.open(`/${selected.id_front}`)} />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">ID Back Image</p>
                     <div className="aspect-[4/3] bg-black rounded-[2rem] border border-white/5 overflow-hidden group">
                        <img src={`/${selected.id_back}`} className="w-full h-full object-contain cursor-zoom-in" onClick={() => window.open(`/${selected.id_back}`)} />
                     </div>
                   </div>
                   <div className="space-y-2 md:col-span-2">
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Live Verification Selfie</p>
                     <div className="aspect-video lg:aspect-[21/9] bg-black rounded-[2rem] border border-white/5 overflow-hidden group">
                        <img src={`/${selected.selfie}`} className="w-full h-full object-contain cursor-zoom-in" onClick={() => window.open(`/${selected.selfie}`)} />
                     </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface IdentificationCardProps {
    className?: string;
    size?: number;
}

const IdentificationCard = ({ className, size = 20 }: IdentificationCardProps) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M16 10h2" />
        <path d="M16 14h2" />
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <circle cx="9" cy="11" r="3" />
        <path d="M5 18a4 4 0 0 1 8 0" />
    </svg>
);

export default AdminKYC;
