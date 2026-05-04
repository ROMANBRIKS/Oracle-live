import { Home, Search, PlusSquare, PlayCircle, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Discover", path: "/discover" },
    { icon: PlusSquare, label: "Upload", path: "/upload", isSpecial: true },
    { icon: PlayCircle, label: "Live", path: "/live" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-lg border-t border-white/10 flex items-center justify-around px-4 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        if (item.isSpecial) {
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex items-center justify-center w-12 h-8"
            >
              <div className="absolute inset-0 bg-cyan-400 rounded-lg -translate-x-1" />
              <div className="absolute inset-0 bg-orange-500 rounded-lg translate-x-1" />
              <div className="absolute inset-0 bg-white rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-black" />
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 transition-colors",
              isActive ? "text-orange-500" : "text-white/40"
            )}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
