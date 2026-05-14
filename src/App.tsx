import React, { useState, useEffect, lazy, Suspense } from "react";
import axios from "axios";
import { Bell, LogOut } from "lucide-react";
import { Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";

// Lazy Loaded Pages
const Home = lazy(() => import("./pages/Home"));
const SwipeFeed = lazy(() => import("./pages/SwipeFeed"));
const Agency = lazy(() => import("./pages/Agency"));
const Admin = lazy(() => import("./pages/Admin"));
const CreatorDashboard = lazy(() => import("./pages/CreatorDashboard"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Withdraw = lazy(() => import("./pages/Withdraw"));
const FiatWithdrawal = lazy(() => import("./pages/FiatWithdrawal"));
const AdminFiatPayouts = lazy(() => import("./pages/AdminFiatPayouts"));
const ModerationDashboard = lazy(() => import("./pages/ModerationDashboard"));
const CreatorAnalytics = lazy(() => import("./pages/CreatorAnalytics"));
const CreatorRevenue = lazy(() => import("./pages/CreatorRevenue"));
const LiveRoom = lazy(() => import("./pages/LiveRoom"));
const HostLiveRoom = lazy(() => import("./pages/HostLiveRoom"));
const HlsViewer = lazy(() => import("./pages/HlsViewer"));
const MultiGuestRoom = lazy(() => import("./pages/MultiGuestRoom"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const TreasuryDashboard = lazy(() => import("./pages/TreasuryDashboard"));
const ForYouPage = lazy(() => import("./pages/ForYouPage"));
const ClipsPage = lazy(() => import("./pages/ClipsPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const StreamerLivePage = lazy(() => import("./pages/StreamerLivePage"));
const ViewerPage = lazy(() => import("./pages/ViewerPage"));
const RevenueDashboard = lazy(() => import("./pages/RevenueDashboard"));
const ClipCenter = lazy(() => import("./pages/ReplayCenter"));
const PkBattleRoom = lazy(() => import("./pages/PkBattleRoom"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const AgencyDashboard = lazy(() => import("./pages/AgencyDashboard"));
const StaffAdminLogin = lazy(() => import("./pages/StaffAdminLogin"));
const NotificationsPage = lazy(() => import("./pages/Notifications"));
const KYCPage = lazy(() => import("./pages/KYC"));
const TransactionHistory = lazy(() => import("./pages/TransactionHistory"));
const CloudReplayPage = lazy(() => import("./pages/CloudReplayPage"));
const TikTokLiveRoom = lazy(() => import("./pages/TikTokLiveRoom"));
const TangoProfile = lazy(() => import("./pages/TangoProfile"));
const LocationLanding = lazy(() => import("./pages/LocationLanding"));
const Auth = lazy(() => import("./pages/Auth"));

// Regular Components
import Coins from "./components/Coins";
import LeaderboardModal from "./components/Leaderboard";
import Notifications from "./components/Notifications";
import BottomNav from "./components/BottomNav";

function App() {
  const [user, setUser] = useState(localStorage.getItem("user"));
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [user]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.clear();
          setUser(null);
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

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
    return (
      <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>}>
        <Auth setUser={setUser} />
      </Suspense>
    );
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
    if (path === "/fiat-withdraw") return "wallet";
    if (path === "/leaderboard") return "leaderboard";
    return "";
  };

  return (
    <div className="flex flex-col h-full bg-[#000] bg-crystal-void text-white font-sans overflow-hidden">
      
      {/* Top Header - Liquid Glass style */}
      <header className="flex justify-between items-center px-6 py-5 liquid-glass border-b border-white/5 sticky top-0 z-50 rounded-b-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <Link to="/" className="flex items-center gap-4 group no-underline">
          <div className="w-12 h-12 crystal-button bg-cyan-400 text-black flex items-center justify-center font-black text-2xl italic shadow-[0_0_20px_rgba(34,211,238,0.5)] group-hover:scale-110 transition-transform">O</div>
          <div className="flex flex-col">
            <h1 className="font-black tracking-tighter text-2xl italic uppercase text-white leading-none">Oracle</h1>
            <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-0.5 bg-cyan-400" />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] leading-none italic">Neural Network</span>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-5">
          {user && JSON.parse(user).role === "admin" && (
            <Link to="/admin/fiat" className="bg-cyan-400/10 border border-cyan-400/30 px-5 py-2 rounded-2xl flex items-center gap-3 hover:bg-cyan-400/20 transition-all">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]"></div>
              <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest italic">Governance</span>
            </Link>
          )}
          <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate("/notifications")}
                className="w-12 h-12 crystal-button group"
                title="Transmissions"
              >
                <Bell size={18} className="text-white/40 group-hover:text-cyan-400 transition-colors" />
              </button>
              <button 
                onClick={logout}
                className="w-12 h-12 crystal-button group"
                title="Disconnect"
              >
                <LogOut size={18} className="text-white/40 group-hover:text-rose-500 transition-colors" />
              </button>
          </div>
          <div className="h-10 w-px bg-white/5 mx-2" />
          <Coins />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 scroll-smooth">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center bg-black">
             <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<ForYouPage />} />
            <Route path="/home" element={<Home onStreamClick={navigateToStream} />} />
            <Route path="/live" element={<SwipeFeed initialStreamId={activeStreamId} />} />
            <Route path="/agency" element={<Agency />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/dashboard" element={<CreatorDashboard />} />
            <Route path="/wallet" element={<Wallet onWithdraw={() => navigate("/withdraw")} />} />
            <Route path="/withdraw" element={<Withdraw onBack={() => navigate("/wallet")} />} />
            <Route path="/fiat-withdraw" element={<FiatWithdrawal />} />
            <Route path="/admin/fiat" element={<AdminFiatPayouts />} />
            <Route path="/admin/moderation" element={<ModerationDashboard />} />
            <Route path="/creator/analytics" element={<CreatorAnalytics />} />
            <Route path="/creator/revenue" element={<CreatorRevenue />} />
            <Route path="/live/room/:roomId" element={<LiveRoom />} />
            <Route path="/live/host/:roomId" element={<HostLiveRoom />} />
            <Route path="/live/hls/:roomId" element={<HlsViewer />} />
            <Route path="/live/pk/:battleId" element={<PkBattleRoom />} />
            <Route path="/multi-guest/:roomId" element={<MultiGuestRoom />} />
            <Route path="/multi-guest" element={<MultiGuestRoom />} />
            <Route path="/moderation" element={<ModerationDashboard />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/treasury" element={<TreasuryDashboard />} />
            <Route path="/broadcast/:roomId" element={<StreamerLivePage />} />
            <Route path="/view/:roomId" element={<ViewerPage />} />
            <Route path="/creator/revenue" element={<RevenueDashboard />} />
            <Route path="/creator/clips" element={<ClipCenter />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/agency-dashboard" element={<AgencyDashboard />} />
            <Route path="/clips" element={<ClipsPage />} />
            <Route path="/staff/login" element={<StaffAdminLogin />} />
            <Route path="/notifications" element={<NotificationsPage onBack={() => navigate("/")} />} />
            <Route path="/kyc" element={<KYCPage onBack={() => navigate("/")} />} />
            <Route path="/transactions" element={<TransactionHistory />} />
            <Route path="/cloud-replays" element={<CloudReplayPage />} />
            <Route path="/tiktok-live" element={<TikTokLiveRoom />} />
            <Route path="/tango-profile" element={<TangoProfile />} />
            
            {/* SEO Landing Routes (Pyramid Structure) */}
            <Route path="/:service/:regionSlug" element={<LocationLanding />} />
            <Route path="/:service/:regionSlug/:citySlug" element={<LocationLanding />} />
          </Routes>
        </Suspense>
      </main>

      {/* Bottom Navigation (Floating Crystal Pill) */}
      <BottomNav 
        page={getActivePage()} 
        setPage={(p) => navigate(p === "home" ? "/" : `/${p}`)} 
        openLeaderboard={() => setIsLeaderboardOpen(true)} 
        user={user ? JSON.parse(user) : null}
      />

      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
      <Notifications />
    </div>
  );
}

export default App;
