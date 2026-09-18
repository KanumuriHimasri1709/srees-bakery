import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { RedirectIfAuth } from "../components/AuthGuard";
import { api } from "../services/api";
import { toast } from "sonner";
import { UserPlus, ArrowRight } from "lucide-react";

export const Register: React.FC = () => {
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validations
    if (formData.name.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.register({
        name: formData.name.trim(),
        phone: cleanPhone,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        toast.success(res.message || "Account created successfully! Welcome to Sree's Home Bakery.");
        setLocation("/user");
      } else {
        toast.error("Registration failed. Please check your information.");
      }
    } catch (err: any) {
      toast.error(err.message || "Registration failed. An account with this email or phone may already exist.");
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
                Create Customer Account
              </h2>
              <p className="text-xs text-stone-500">
                Register to track your enquiries, save cake preferences, and receive your 10% welcome offer.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sravanthi Reddy"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Password (min 6 characters) *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a secure password"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                  className="form-input"
                />
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
                    <UserPlus className="w-4 h-4" />
                    <span>Register Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-600">
              <p>
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-[#8B263E] hover:underline">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </RedirectIfAuth>
  );
};
export default Register;
