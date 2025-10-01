import * as React from "react";

export function Button({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium transition ${className}`}
    >
      {children}
    </button>
  );
}
