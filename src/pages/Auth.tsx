import React, { useState, useEffect } from "react";
import { LogIn, UserPlus, ShieldCheck } from "lucide-react";
import axios from "axios";

function Auth({ setUser }: { setUser: (user: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    const handleLoginMessage = (event: MessageEvent) => {
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        const { token, user } = event.data;
        localStorage.setItem("token", token);
        const userData = JSON.stringify(user);
        localStorage.setItem("user", userData);
        setUser(userData);
      }
    };
    window.addEventListener("message", handleLoginMessage);
    return () => window.removeEventListener("message", handleLoginMessage);
  }, [setUser]);

  const loginWithGoogle = async () => {
    try {
      const res = await axios.get("/api/auth/google/url");
      const { url } = res.data;
      window.open(url, "google_auth", "width=500,height=600");
    } catch (err) {
      console.error(err);
      alert("Failed to initiate Google login");
    }
  };

  const login = async (customUsername?: string, customPassword?: string) => {
    const u = customUsername || username;
    const p = customPassword || password;

    try {
      const res = await axios.post("/api/users/login", { username: u, password: p });
      const data = res.data;

      if (data.token) {
        localStorage.setItem("token", data.token);
        const userData = JSON.stringify(data);
        localStorage.setItem("user", userData);
        setUser(userData);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  const register = async () => {
    try {
      await axios.post("/api/users/register", { username, password });
      alert("Registered! Now login.");
      setIsRegister(false);
    } catch (err: any) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  const skipForDev = async () => {
    const devUsername = "Developer";
    const devPassword = "password123";

    try {
      // Try login first
      const res = await axios.post("/api/users/login", { username: devUsername, password: devPassword });
      const data = res.data;
      localStorage.setItem("token", data.token);
      const userData = JSON.stringify(data);
      localStorage.setItem("user", userData);
      setUser(userData);
    } catch (err) {
      // If fails, try register then login
      try {
        await axios.post("/api/users/register", { username: devUsername, password: devPassword, role: "admin" });
        const res = await axios.post("/api/users/login", { username: devUsername, password: devPassword });
        const data = res.data;
        localStorage.setItem("token", data.token);
        const userData = JSON.stringify(data);
        localStorage.setItem("user", userData);
        setUser(userData);
      } catch (regErr) {
        console.error("Dev skip failed", regErr);
        alert("Dev skip failed. Check server console.");
      }
    }
  };

  return (
    <div className="min-h-full bg-zinc-950 flex flex-col items-center justify-center p-6 gap-8 overflow-y-auto">
      {/* BRANDING */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-20 h-20 bg-gradient-to-tr from-pink-500 via-rose-500 to-yellow-500 rounded-3xl shadow-2xl shadow-pink-500/20 rotate-12 flex items-center justify-center animate-glow">
          <ShieldCheck size={40} className="text-white -rotate-12" />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter italic uppercase underline decoration-pink-500 underline-offset-8">Oracle</h1>
          <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase">The Live Future</p>
        </div>
      </div>

      <div className="w-full max-w-sm bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 space-y-6 shadow-2xl">
        <h2 className="text-xl font-bold text-center tracking-tight">{isRegister ? "Create Account" : "Welcome Back"}</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-zinc-500 ml-4 tracking-widest">Username</label>
            <input
              placeholder="oracle_user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-full py-4 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-zinc-500 ml-4 tracking-widest">Password</label>
            <input
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-full py-4 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-zinc-700"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {isRegister ? (
            <button 
              onClick={() => register()} 
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-full shadow-lg shadow-pink-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              style={{ background: '#ff0050' }}
            >
              <UserPlus size={18} />
              Sign Up
            </button>
          ) : (
            <button 
              onClick={() => login()} 
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-full shadow-lg shadow-pink-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              style={{ background: '#ff0050' }}
            >
              <LogIn size={18} />
              Login
            </button>
          )}

          <div className="flex items-center gap-4 my-2 px-2">
            <div className="h-px flex-1 bg-white/5"></div>
            <span className="text-[10px] text-zinc-600 font-bold tracking-widest">OR</span>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>

          <button 
            onClick={loginWithGoogle} 
            className="w-full bg-white text-zinc-950 font-bold py-4 rounded-full active:scale-95 transition-all flex items-center justify-center gap-3 px-6 shadow-xl"
            style={{ padding: '16px' }}
          >
            <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="google" />
            <span className="text-sm">Sign in with Google</span>
          </button>

          <button 
            onClick={skipForDev}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-4 rounded-full active:scale-95 transition-all text-sm"
            style={{ background: '#27272a' }}
          >
            Skip for Dev
          </button>
        </div>

        <p className="text-center text-xs text-zinc-500 pt-4">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-pink-500 font-bold hover:underline"
            style={{ background: 'none', padding: 0 }}
          >
            {isRegister ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;
