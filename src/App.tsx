import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import LiveScreen from "./screens/LiveScreen";
import ProfileScreen from "./screens/ProfileScreen";
import BottomNav from "./components/BottomNav";

function DiscoverScreen() {
  return <div className="min-h-screen bg-black text-white flex items-center justify-center">Discover Screen Coming Soon</div>;
}

function UploadScreen() {
  return <div className="min-h-screen bg-black text-white flex items-center justify-center">Upload Screen Coming Soon</div>;
}

export default function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen bg-black">
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/discover" element={<DiscoverScreen />} />
            <Route path="/upload" element={<UploadScreen />} />
            <Route path="/live" element={<LiveScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}
