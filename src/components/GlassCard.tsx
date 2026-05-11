import React from "react";
import { theme } from "../lib/theme";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "" }) => {
  return (
    <div className={`crystal-glass ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
