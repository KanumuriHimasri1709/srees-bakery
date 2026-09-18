import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { RedirectIfAuth } from "../components/AuthGuard";
import { api } from "../services/api";
import { toast } from "sonner";
import { Lock, Mail, Phone, ArrowRight, UserCheck } from "lucide-react";

export const Login: React.FC = () => {
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error("Please enter your email or phone and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.login({ identifier, password });
      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        toast.success(res.message || "Welcome back!");
        setLocation("/user");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid email/phone or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RedirectIfAuth>
      <div className="min-h-[85vh] pt-36 pb-20 flex items-center justify-center bg-gradient-to-b from-[#F7EFE5] via-[#FDFBF7] to-white">
        <div className="container max-w-md">
          <div className="luxury-card p-8 sm:p-10 bg-white border border-[#EADED3] shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <span className="w-12 h-12 rounded-full bg-[#8B263E] text-white inline-flex items-center justify-center font-serif text-2xl font-bold shadow-md">
                S
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#2B1810]">
                Customer Login
              </h2>
              <p className="text-xs text-stone-500">
                Log in to view your orders, custom cake enquiries, and profile.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Email or Phone Number</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@example.com or 7981468535"
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full text-sm py-3 flex items-center justify-center gap-2 mt-2 shadow-md"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-600 space-y-2">
              <p>
                Don't have an account yet?{" "}
                <Link href="/register" className="font-bold text-[#8B263E] hover:underline">
                  Create Account
                </Link>
              </p>
              <p className="pt-2 text-[11px] text-stone-400">
                Bakery staff or administrator?{" "}
                <Link href="/admin/login" className="text-stone-600 hover:text-[#8B263E] underline">
                  Admin Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </RedirectIfAuth>
  );
};
export default Login;
