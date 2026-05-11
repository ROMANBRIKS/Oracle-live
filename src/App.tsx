import React, { useState, useEffect } from "react";
import axios from "axios";
import Home from "./pages/Home";
import SwipeFeed from "./pages/SwipeFeed";
import Agency from "./pages/Agency";
import Admin from "./pages/Admin";
import CreatorDashboard from "./pages/CreatorDashboard";
import Wallet from "./pages/Wallet";
import Withdraw from "./pages/Withdraw";
import NotificationsPage from "./pages/Notifications";
import KYCPage from "./pages/KYC";
import TransactionHistory from "./pages/TransactionHistory";
import Auth from "./pages/Auth";
import Coins from "./components/Coins";
import Leaderboard from "./components/Leaderboard";
import Notifications from "./components/Notifications";
import BottomNav from "./components/BottomNav";
import { Bell, LogOut } from "lucide-react";
import { Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";
import LocationLanding from "./pages/LocationLanding";

function App() {
  const [user, setUser] = useState(localStorage.getItem("user"));
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && user) {
      const userData = JSON.parse(user);
      axios.post("/api/growth/track-share", {
        referrerId: ref,
        joinerId: userData.id,
        location: 'detect', // Backend handles this via headers
        device: navigator.userAgent
      }).then(() => console.log("Viral point tracked"));
    }
  }, [user]);

  const navigateToStream = (streamId: string) => {
    setActiveStreamId(streamId);
    navigate("/live");
  };

  if (!user || !token) {
    return <Auth setUser={setUser} />;
  }

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  // Helper to determine active page for BottomNav compatibility
  const getActivePage = () => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path === "/live") return "live";
    if (path === "/agency") return "agency";
    if (path === "/admin") return "admin";
    if (path === "/dashboard") return "dashboard";
    if (path === "/wallet") return "wallet";
    if (path === "/withdraw") return "withdraw";
    if (path === "/notifications") return "notifications";
    if (path === "/kyc") return "kyc";
    if (path === "/transactions") return "transactions";
    return "";
  };

  return (
    <div className="flex flex-col h-full bg-[#000] bg-crystal-void text-white font-sans overflow-hidden">
      
      {/* Top Header - Liquid Glass style */}
      <header className="flex justify-between items-center px-6 py-5 liquid-glass border-b border-white/5 sticky top-0 z-50 rounded-b-[2rem]">
        <Link to="/" className="flex items-center gap-3 decoration-0">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center font-black text-black italic shadow-2xl">O</div>
          <div className="flex flex-col">
            <span className="font-black tracking-tighter text-xl italic uppercase text-white">Oracle Live</span>
            <span className="text-[8px] font-black text-white/50 uppercase tracking-widest leading-none">Global Network</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          {user && JSON.parse(user).role === "admin" && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Admin Mode</span>
            </div>
          )}
          <button 
            onClick={() => navigate("/notifications")}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-500/40 transition-all group"
          >
            <Bell size={16} className="text-white group-hover:text-blue-500" />
          </button>
          <button 
            onClick={logout}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/40 transition-all group"
          >
            <LogOut size={16} className="text-white group-hover:text-red-500" />
          </button>
          <Coins />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 scroll-smooth">
        <Routes>
          <Route path="/" element={<Home onStreamClick={navigateToStream} />} />
          <Route path="/live" element={<SwipeFeed initialStreamId={activeStreamId} />} />
          <Route path="/agency" element={<Agency />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/dashboard" element={<CreatorDashboard />} />
          <Route path="/wallet" element={<Wallet onWithdraw={() => navigate("/withdraw")} />} />
          <Route path="/withdraw" element={<Withdraw onBack={() => navigate("/wallet")} />} />
          <Route path="/notifications" element={<NotificationsPage onBack={() => navigate("/")} />} />
          <Route path="/kyc" element={<KYCPage onBack={() => navigate("/")} />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          
          {/* SEO Landing Routes (Pyramid Structure) */}
          <Route path="/:service/:regionSlug" element={<LocationLanding />} />
          <Route path="/:service/:regionSlug/:citySlug" element={<LocationLanding />} />
        </Routes>
      </main>

      {/* Bottom Navigation (Floating Crystal Pill) */}
      <BottomNav 
        page={getActivePage()} 
        setPage={(p) => navigate(p === "home" ? "/" : `/${p}`)} 
        openLeaderboard={() => setIsLeaderboardOpen(true)} 
        user={user ? JSON.parse(user) : null}
      />

      <Leaderboard isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
      <Notifications />
    </div>
  );
}

export default App;
