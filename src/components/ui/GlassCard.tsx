import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  style = {},
  className = "",
  onClick,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`backdrop-blur-[20px] transition-all duration-300 ${onClick ? "cursor-pointer active:scale-95" : ""} ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: 24,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
