import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, CheckCircle, XCircle, Camera, 
  Upload, ArrowLeft, Globe, User
} from "lucide-react";

const IdentificationCard = ({ className, size = 20 }: { className?: string, size?: number }) => (
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

interface KYCStatus {
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
}

const KYC: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [status, setStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    country: "",
    idType: "passport",
  });
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    idFront: null,
    idBack: null,
    selfie: null,
  });

  const userRes = localStorage.getItem("user");
  const user = userRes ? JSON.parse(userRes) : null;

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`/api/kyc/status/${user.id}`);
        setStatus(res.data);
      } catch (err) {
        console.error("Status fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const submitKYC = async () => {
    if (!user) return;
    if (!form.fullName || !form.country || !files.idFront || !files.idBack || !files.selfie) {
      alert("Please complete all fields and upload all required documents.");
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    data.append("userId", user.id);
    data.append("fullName", form.fullName);
    data.append("country", form.country);
    data.append("idType", form.idType);
    data.append("idFront", files.idFront);
    data.append("idBack", files.idBack);
    data.append("selfie", files.selfie);

    try {
      const res = await axios.post("/api/kyc/submit", data);
      if (res.data.success) {
        alert("KYC Submitted for review!");
        setStatus({ status: 'pending', created_at: new Date().toISOString() });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  if (status?.status === 'approved') {
    return (
      <div className="min-h-screen bg-black p-6 py-20 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-8">
          <CheckCircle className="text-emerald-500" size={48} />
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Verified</h1>
        <p className="text-white/40 font-mono text-sm max-w-xs">Your identity is cryptographically verified. Capital access unlocked.</p>
        <button onClick={onBack} className="mt-12 py-4 px-12 liquid-glass rounded-[2rem] font-black uppercase italic tracking-widest">Return</button>
      </div>
    );
  }

  if (status?.status === 'pending') {
    return (
      <div className="min-h-screen bg-black p-6 py-20 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mb-8">
          <Shield className="text-amber-500 animate-pulse" size={48} />
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Under Review</h1>
        <p className="text-white/40 font-mono text-sm max-w-xs">Intelligence is vetting your documents. Estimated time: 2-4 hours.</p>
        <button onClick={onBack} className="mt-12 py-4 px-12 liquid-glass rounded-[2rem] font-black uppercase italic tracking-widest">Return</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="p-6">
        <button onClick={onBack} className="w-12 h-12 liquid-glass rounded-2xl flex items-center justify-center mb-8">
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Identify</h1>
        <p className="text-white/40 text-sm mb-10 font-mono">Verify your bio-identity to unlock platform liquidity.</p>

        {status?.status === 'rejected' && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-8 flex gap-4 items-center">
            <XCircle className="text-red-500 shrink-0" size={24} />
            <div>
              <p className="text-red-400 font-bold text-sm">Previous Submission Rejected</p>
              <p className="text-red-400/60 text-[10px] uppercase font-black">{status.rejection_reason || "Invalid documents."}</p>
            </div>
          </div>
        )}

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="FULL LEGAL NAME"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                className="w-full h-16 bg-white/5 border border-white/10 rounded-[1.5rem] pl-14 pr-6 text-sm font-black uppercase tracking-widest focus:border-blue-500/50 outline-none transition-all"
              />
            </div>
            
            <div className="relative group">
              <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="COUNTRY OF RESIDENCE"
                value={form.country}
                onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                className="w-full h-16 bg-white/5 border border-white/10 rounded-[1.5rem] pl-14 pr-6 text-sm font-black uppercase tracking-widest focus:border-blue-500/50 outline-none transition-all"
              />
            </div>

            <div className="relative group">
               <IdentificationCard className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" size={20} />
              <select
                value={form.idType}
                onChange={e => setForm(f => ({ ...f, idType: e.target.value }))}
                className="w-full h-16 bg-white/5 border border-white/10 rounded-[1.5rem] pl-14 pr-12 text-sm font-black uppercase tracking-widest focus:border-blue-500/50 outline-none transition-all appearance-none"
              >
                <option value="passport">Passport</option>
                <option value="national_id">National ID</option>
                <option value="drivers_license">Driver's License</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'idFront', label: 'ID FRONT', icon: <Upload size={20} /> },
              { id: 'idBack', label: 'ID BACK', icon: <Upload size={20} /> },
              { id: 'selfie', label: 'LIVE SELFIE', icon: <Camera size={20} />, full: true }
            ].map(upload => (
              <label 
                key={upload.id}
                className={`${upload.full ? 'col-span-2' : ''} h-32 liquid-glass border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-500/30 transition-all relative overflow-hidden`}
              >
                <input type="file" className="hidden" onChange={e => handleFileChange(e, upload.id)} accept="image/*" />
                {files[upload.id] ? (
                  <div className="absolute inset-0 bg-emerald-500/20 flex flex-col items-center justify-center p-4">
                    <CheckCircle className="text-emerald-500 mb-2" size={24} />
                    <span className="text-[10px] font-black uppercase text-emerald-400 truncate w-full text-center">{files[upload.id]!.name}</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                      {upload.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{upload.label}</span>
                  </>
                )}
              </label>
            ))}
          </div>

          <button
            onClick={submitKYC}
            disabled={submitting}
            className={`w-full py-6 rounded-[2rem] font-black uppercase italic tracking-[0.2em] shadow-2xl transition-all ${
              submitting ? 'bg-white/10 text-white/20 scale-95' : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {submitting ? 'Transmitting Intelligence...' : 'Initiate Verification'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYC;
