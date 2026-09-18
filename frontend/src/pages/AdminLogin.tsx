import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { RedirectIfAuth } from "../components/AuthGuard";
import { api } from "../services/api";
import { toast } from "sonner";
import { Shield, Lock, Mail, ArrowRight, AlertTriangle } from "lucide-react";

export const AdminLogin: React.FC = () => {
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter administrator email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.adminLogin({ email: email.trim().toLowerCase(), password });
      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        toast.success("Administrator login successful.");
        setLocation("/admin");
      } else {
        toast.error("Administrator login failed. Please verify credentials.");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid administrator credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RedirectIfAuth>
      <div className="min-h-[85vh] pt-36 pb-20 flex items-center justify-center bg-[#2B1810]">
        <div className="container max-w-md">
          <div className="luxury-card p-8 sm:p-10 bg-[#FAF5EC] border border-[#EADED3] shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <span className="w-14 h-14 rounded-2xl bg-[#8B263E] text-[#E0A952] inline-flex items-center justify-center shadow-lg mx-auto">
                <Shield className="w-7 h-7" />
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#2B1810]">
                Bakery Admin Portal
              </h2>
              <p className="text-xs text-stone-600">
                Restricted access for bakery managers and administrators only.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 flex-none mt-0.5" />
              <span>
                Unauthorized access is strictly logged and forbidden. Customer accounts cannot log in here.
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Administrator Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sreesbakery.com"
                    className="form-input bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Admin Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full text-sm py-3.5 flex items-center justify-center gap-2 mt-2 shadow-md bg-[#8B263E] hover:bg-[#721E31]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-[#E0A952]" />
                    <span>Access Admin Dashboard</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-stone-200 text-center text-xs text-stone-500">
              <Link href="/login" className="hover:text-[#8B263E] underline">
                Return to Customer Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RedirectIfAuth>
  );
};
export default AdminLogin;
