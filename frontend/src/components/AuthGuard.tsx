import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-amber-800/20 border-t-amber-800 rounded-full animate-spin mb-4" />
        <p className="text-stone-600 font-serif text-lg tracking-wide">Loading your bakery portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return <>{children}</>;
};

export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-amber-900/20 border-t-amber-900 rounded-full animate-spin mb-4" />
        <p className="text-stone-600 font-serif text-lg tracking-wide">Verifying administrator credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    setLocation("/admin/login");
    return null;
  }

  return <>{children}</>;
};

export const RedirectIfAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    if (isAdmin) {
      setLocation("/admin");
    } else {
      setLocation("/user");
    }
    return null;
  }

  return <>{children}</>;
};
