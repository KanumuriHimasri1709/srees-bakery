import React from "react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const getBadgeStyle = (st: string) => {
    switch (st.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "reviewed":
        return "bg-sky-100 text-sky-900 border-sky-300";
      case "confirmed":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "in preparation":
        return "bg-purple-100 text-purple-900 border-purple-300";
      case "ready":
        return "bg-teal-100 text-teal-900 border-teal-300";
      case "completed":
        return "bg-stone-200 text-stone-800 border-stone-400";
      case "cancelled":
        return "bg-rose-100 text-rose-900 border-rose-300";
      default:
        return "bg-stone-100 text-stone-800 border-stone-300";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {status}
    </span>
  );
};
