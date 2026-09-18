import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { RequireAuth } from "../components/AuthGuard";
import { StatusBadge } from "../components/StatusBadge";
import { api } from "../services/api";
import { toast } from "sonner";
import {
  LayoutDashboard,
  ShoppingBag,
  Sparkles,
  User,
  LogOut,
  Clock,
  CheckCircle2,
  Calendar,
  Image as ImageIcon,
  Phone,
  Mail,
  Send,
  ArrowRight
} from "lucide-react";

export const UserBoard: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "enquiries" | "custom-cakes" | "profile">("overview");
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const loadUserEnquiries = async () => {
    setIsLoading(true);
    try {
      const res = await api.fetchUserEnquiries();
      if (res.success && res.enquiries) {
        setEnquiries(res.enquiries);
      }
    } catch {
      // Handled silently
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserEnquiries();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        phone: user.phone,
        email: user.email,
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await api.updateProfile(profileForm);
      if (res.success && res.user) {
        updateUser(res.user);
        toast.success("Profile updated successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Metrics based exclusively on customer's real database records
  const totalEnquiries = enquiries.length;
  const pendingEnquiries = enquiries.filter((e) => e.status === "Pending").length;
  const confirmedEnquiries = enquiries.filter((e) => ["Confirmed", "Reviewed", "In Preparation", "Ready"].includes(e.status)).length;
  const completedOrders = enquiries.filter((e) => e.status === "Completed").length;

  const customCakes = enquiries.filter((e) => e.type === "custom-cake");

  const handleOpenAi = () => {
    window.dispatchEvent(new CustomEvent("open-bakery-ai"));
  };

  return (
    <RequireAuth>
      <div className="pt-32 pb-20 bg-[#FDFBF7] min-h-screen">
        <div className="container space-y-8">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EADED3]">
            <div>
              <span className="eyebrow">Customer Portal</span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1810]">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Track your active bakery enquiries, manage your custom cake orders, and update your profile.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenAi}
                className="btn btn-sm btn-secondary text-xs flex items-center gap-1.5 border-[#F3D2CC] bg-[#FCECE9] text-[#8B263E]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C58A32]" />
                Ask Bakery AI
              </button>
              <a href="/order" className="btn btn-sm btn-primary text-xs">
                New Order Enquiry
              </a>
            </div>
          </div>

          {/* Main Dashboard Layout */}
          <div className="dashboard-grid">
            {/* Sidebar Navigation */}
            <aside className="dashboard-sidebar space-y-2">
              <div className="p-3 bg-[#FAF5EC] rounded-xl border border-[#EADED3] mb-4">
                <div className="font-serif font-bold text-sm text-[#2B1810]">{user?.name}</div>
                <div className="text-[11px] text-stone-500 truncate">{user?.email}</div>
                <div className="text-[11px] text-[#8B263E] font-semibold mt-1">Customer Account</div>
              </div>

              <button
                onClick={() => setActiveTab("overview")}
                className={`dashboard-nav-item ${activeTab === "overview" ? "active" : ""}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard Overview
              </button>

              <button
                onClick={() => setActiveTab("enquiries")}
                className={`dashboard-nav-item ${activeTab === "enquiries" ? "active" : ""}`}
              >
                <ShoppingBag className="w-4 h-4" />
                My Enquiries ({totalEnquiries})
              </button>

              <button
                onClick={() => setActiveTab("custom-cakes")}
                className={`dashboard-nav-item ${activeTab === "custom-cakes" ? "active" : ""}`}
              >
                <Sparkles className="w-4 h-4" />
                My Custom Cakes ({customCakes.length})
              </button>

              <button
                onClick={() => setActiveTab("profile")}
                className={`dashboard-nav-item ${activeTab === "profile" ? "active" : ""}`}
              >
                <User className="w-4 h-4" />
                Profile Settings
              </button>

              <div className="pt-4 mt-4 border-t border-stone-100">
                <button
                  onClick={logout}
                  className="dashboard-nav-item text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </aside>

            {/* Tab Panels */}
            <main className="space-y-6">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Metric Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="metric-card">
                      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Total Enquiries
                      </span>
                      <div className="metric-number">{totalEnquiries}</div>
                      <span className="text-[11px] text-stone-400 mt-1 block">All time requests</span>
                    </div>

                    <div className="metric-card bg-amber-50/40 border-amber-200/70">
                      <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                        Pending
                      </span>
                      <div className="metric-number text-amber-900">{pendingEnquiries}</div>
                      <span className="text-[11px] text-amber-700 mt-1 block">Awaiting bakery review</span>
                    </div>

                    <div className="metric-card bg-indigo-50/40 border-indigo-200/70">
                      <span className="text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                        Confirmed / Active
                      </span>
                      <div className="metric-number text-indigo-900">{confirmedEnquiries}</div>
                      <span className="text-[11px] text-indigo-700 mt-1 block">In preparation & ready</span>
                    </div>

                    <div className="metric-card bg-emerald-50/40 border-emerald-200/70">
                      <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                        Completed
                      </span>
                      <div className="metric-number text-emerald-900">{completedOrders}</div>
                      <span className="text-[11px] text-emerald-700 mt-1 block">Delivered celebrations</span>
                    </div>
                  </div>

                  {/* Recent Enquiries Preview */}
                  <div className="luxury-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-xl font-bold text-[#2B1810]">
                        Recent Enquiries
                      </h3>
                      <button
                        onClick={() => setActiveTab("enquiries")}
                        className="text-xs font-semibold text-[#8B263E] hover:underline flex items-center gap-1"
                      >
                        View all <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {enquiries.length === 0 ? (
                      <div className="text-center py-10 text-stone-500 text-xs space-y-2">
                        <p>You haven't submitted any enquiries yet.</p>
                        <a href="/menu" className="btn btn-sm btn-primary text-xs">
                          Explore Menu
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {enquiries.slice(0, 3).map((enq) => (
                          <div
                            key={enq.id}
                            className="p-4 rounded-xl border border-[#EADED3] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#2B1810]">
                                  #{enq.id} · {enq.type === "custom-cake" ? "Custom Cake" : enq.product || "Standard Order"}
                                </span>
                                <StatusBadge status={enq.status} />
                              </div>
                              <p className="text-xs text-stone-500">
                                Required for: <strong className="text-stone-700">{enq.required_date || "Not specified"}</strong> · Egg Preference: {enq.egg_preference}
                              </p>
                            </div>
                            <div className="text-[11px] text-stone-400">
                              Placed on {enq.created_at?.split(" ")[0]}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: MY ENQUIRIES TABLE */}
              {activeTab === "enquiries" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-[#2B1810]">
                        All Enquiries
                      </h3>
                      <p className="text-xs text-stone-500">
                        Status is updated directly by the bakery management team.
                      </p>
                    </div>
                  </div>

                  {enquiries.length === 0 ? (
                    <div className="luxury-card p-12 text-center text-stone-500 text-sm space-y-3">
                      <p>No enquiries found in your account.</p>
                      <a href="/order" className="btn btn-sm btn-primary text-xs">
                        Create an Enquiry
                      </a>
                    </div>
                  ) : (
                    <div className="data-table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Enquiry ID</th>
                            <th>Type / Item</th>
                            <th>Required Date</th>
                            <th>Egg Preference</th>
                            <th>Status</th>
                            <th>Submitted On</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enquiries.map((enq) => (
                            <tr key={enq.id}>
                              <td className="font-bold text-[#8B263E]">#{enq.id}</td>
                              <td>
                                <div className="font-semibold text-[#2B1810]">
                                  {enq.type === "custom-cake" ? "Custom Cake" : enq.product || "Order"}
                                </div>
                                {enq.flavour && (
                                  <div className="text-[11px] text-stone-500">Flavour: {enq.flavour} ({enq.size})</div>
                                )}
                              </td>
                              <td className="font-medium text-stone-700">
                                {enq.required_date || "—"}
                              </td>
                              <td>
                                <span className="text-xs px-2 py-0.5 rounded bg-stone-100 border border-stone-200">
                                  {enq.egg_preference || "Standard"}
                                </span>
                              </td>
                              <td>
                                <StatusBadge status={enq.status} />
                              </td>
                              <td className="text-stone-500 text-xs">
                                {enq.created_at?.split(" ")[0]}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MY CUSTOM CAKES */}
              {activeTab === "custom-cakes" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-[#2B1810]">
                        Custom Cake Requests
                      </h3>
                      <p className="text-xs text-stone-500">
                        View custom cake specifications and reference designs.
                      </p>
                    </div>
                    <a href="/custom-cakes" className="btn btn-sm btn-primary text-xs">
                      Build Another Custom Cake
                    </a>
                  </div>

                  {customCakes.length === 0 ? (
                    <div className="luxury-card p-12 text-center text-stone-500 text-sm space-y-3">
                      <p>You haven't submitted any custom cake enquiries yet.</p>
                      <a href="/custom-cakes" className="btn btn-sm btn-primary text-xs">
                        Build Custom Cake
                      </a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {customCakes.map((cake) => (
                        <div key={cake.id} className="luxury-card p-6 space-y-4 bg-white">
                          <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
                            <div>
                              <span className="text-xs font-bold text-[#8B263E]">
                                Enquiry #{cake.id}
                              </span>
                              <h4 className="font-serif text-lg font-bold text-[#2B1810]">
                                {cake.occasion || "Celebration Cake"}
                              </h4>
                            </div>
                            <StatusBadge status={cake.status} />
                          </div>

                          {/* Reference Photo Preview if uploaded */}
                          {cake.reference_image_url && (
                            <div className="relative h-44 rounded-xl overflow-hidden bg-stone-100 border border-[#EADED3]">
                              <img
                                src={cake.reference_image_url}
                                alt="Reference Design"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                                <ImageIcon className="w-3 h-3 text-[#E0A952]" />
                                Your Reference Photo
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
                            <div>
                              <span className="text-stone-400 block">Flavour & Size:</span>
                              <strong>{cake.flavour || "Chocolate"} · {cake.size || "1 kg"}</strong>
                            </div>
                            <div>
                              <span className="text-stone-400 block">Required Date:</span>
                              <strong>{cake.required_date || "—"}</strong>
                            </div>
                            <div>
                              <span className="text-stone-400 block">Egg Preference:</span>
                              <strong>{cake.egg_preference}</strong>
                            </div>
                            <div>
                              <span className="text-stone-400 block">Theme & Colour:</span>
                              <strong>{cake.theme || "Standard"} ({cake.colour || "Default"})</strong>
                            </div>
                          </div>

                          {cake.message_on_cake && (
                            <div className="p-2.5 rounded-lg bg-[#FAF5EC] text-xs text-stone-700 border border-[#EADED3]">
                              <span className="text-[10px] uppercase font-bold text-[#8B263E] block">Message on Cake:</span>
                              "{cake.message_on_cake}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PROFILE */}
              {activeTab === "profile" && (
                <div className="max-w-xl space-y-6">
                  <div className="luxury-card p-6 sm:p-8 bg-white space-y-6">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-[#2B1810]">
                        Customer Profile
                      </h3>
                      <p className="text-xs text-stone-500 mt-1">
                        Keep your contact information up-to-date so our bakery can easily reach you for enquiry confirmations.
                      </p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label className="form-label">Contact Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          required
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label className="form-label">Account Role</label>
                        <input
                          type="text"
                          disabled
                          value="Customer (Read-only)"
                          className="form-input bg-stone-100 text-stone-500 cursor-not-allowed"
                        />
                        <p className="text-[10px] text-stone-400 mt-1">
                          Role permissions are assigned and managed by bakery administrators.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="btn btn-primary text-xs py-3 w-full shadow-sm"
                      >
                        {isUpdatingProfile ? "Saving changes..." : "Save Profile Changes"}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
};
export default UserBoard;
