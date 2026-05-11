import React from "react";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  glow?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, glow = true, className = "", ...props }) => {
  return (
    <button
      className={`
        crystal-button 
        bg-cyan-400/20 
        text-cyan-400 
        border-cyan-400/50 
        font-black 
        uppercase 
        italic 
        tracking-widest 
        transition-all 
        hover:bg-cyan-400 
        hover:text-black 
        active:scale-95
        ${glow ? 'shadow-[0_0_20px_rgba(34,211,238,0.2)]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
