import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import { ImageUpload } from "../components/ImageUpload";
import { api } from "../services/api";
import { toast } from "sonner";
import { Send, CheckCircle2, Clock, Truck, ShieldCheck, UserCheck } from "lucide-react";

export const Order: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Read query params for pre-selected product
  const searchParams = new URLSearchParams(window.location.search);
  const initialProduct = searchParams.get("product") || "";

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    product: initialProduct,
    quantity: "1",
    requiredDate: "",
    eggPreference: "Eggless",
    customization: "",
    deliveryRequired: "Yes",
    additionalMessage: "",
    referenceImageUrl: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name,
        phone: prev.phone || user.phone,
        email: prev.email || user.email,
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Please provide your name and contact phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitOrder(formData);
      if (res.success) {
        setSubmittedId(res.id);
        toast.success(res.message);
      } else {
        toast.error("Unable to submit enquiry. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "Unable to submit enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Intro Header */}
      <section className="page-intro">
        <div className="container">
          <span className="eyebrow">Enquiry & Request</span>
          <h1 className="serif">Send an Order Enquiry</h1>
          <p>
            Tell us what you'd like to order! All our bakes are handcrafted fresh to order. After you submit your enquiry, our bakery will contact you to confirm pricing and availability.
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-[#EADED3] text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8B263E]" />
              <span>Cake orders: 1 day in advance</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#8B263E]" />
              <span>Rapido Delivery (paid by customer)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8B263E]" />
              <span>Payment via PhonePe</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Order Form */}
      <section className="container max-w-3xl">
        {submittedId ? (
          <div className="luxury-card p-8 sm:p-12 text-center space-y-4 bg-white border-2 border-emerald-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#2B1810]">
              Enquiry #{submittedId} Received!
            </h2>
            <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              Your enquiry has been received. The bakery will contact you for confirmation.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setSubmittedId(null);
                  setFormData({
                    name: user?.name || "",
                    phone: user?.phone || "",
                    email: user?.email || "",
                    product: "",
                    quantity: "1",
                    requiredDate: "",
                    eggPreference: "Eggless",
                    customization: "",
                    deliveryRequired: "Yes",
                    additionalMessage: "",
                    referenceImageUrl: "",
                  });
                }}
                className="btn btn-secondary text-xs"
              >
                Submit Another Enquiry
              </button>
              {user && (
                <Link href="/user" className="btn btn-primary text-xs">
                  Track in Customer Board
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="luxury-card p-6 sm:p-10 bg-white">
            {!isAuthenticated && (
              <div className="mb-6 p-3.5 rounded-xl bg-[#FAF5EC] border border-[#EADED3] flex items-center justify-between gap-3 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#8B263E]" />
                  <span>Have an account? Log in to automatically track this enquiry in your customer dashboard.</span>
                </div>
                <Link href="/login" className="font-bold text-[#8B263E] hover:underline flex-none">
                  Log in
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-[#EADED3] pb-4">
                <h3 className="font-serif text-2xl font-bold text-[#2B1810]">
                  Bakery Order Enquiry
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Please fill out your requirements. We will contact you at 7981468535 / 8801121818 to confirm.
                </p>
              </div>

              {/* Name and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh"
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
                    placeholder="e.g. 7981468535"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Product and Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="form-label">Product / Item *</label>
                  <input
                    type="text"
                    required
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    placeholder="e.g. Chocolate Cake (1 kg) or Ragi Cookies"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Quantity</label>
                  <input
                    type="text"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g. 1 kg / 2 boxes"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Required Date, Egg Preference, Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Required Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.requiredDate}
                    onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Egg / Eggless</label>
                  <select
                    value={formData.eggPreference}
                    onChange={(e) => setFormData({ ...formData, eggPreference: e.target.value })}
                    className="form-select"
                  >
                    <option value="Eggless">Eggless</option>
                    <option value="With Egg">With Egg</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Delivery Required?</label>
                  <select
                    value={formData.deliveryRequired}
                    onChange={(e) => setFormData({ ...formData, deliveryRequired: e.target.value })}
                    className="form-select"
                  >
                    <option value="Yes">Yes (Via Rapido)</option>
                    <option value="No">No (Self Pickup)</option>
                  </select>
                </div>
              </div>

              {/* Customization & Message */}
              <div>
                <label className="form-label">Customization / Name on Cake</label>
                <input
                  type="text"
                  value={formData.customization}
                  onChange={(e) => setFormData({ ...formData, customization: e.target.value })}
                  placeholder="e.g. Write 'Happy Birthday Dad' with dark chocolate drip"
                  className="form-input"
                />
              </div>

              {/* Reference Image Upload */}
              <ImageUpload
                value={formData.referenceImageUrl}
                onChange={(url) => setFormData({ ...formData, referenceImageUrl: url })}
                label="Reference Photo (Optional)"
              />

              {/* Additional Message */}
              <div>
                <label className="form-label">Additional Message or Delivery Address</label>
                <textarea
                  rows={3}
                  value={formData.additionalMessage}
                  onChange={(e) => setFormData({ ...formData, additionalMessage: e.target.value })}
                  placeholder="Delivery address in Kakinada or any special preparation instructions..."
                  className="form-textarea"
                />
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full text-sm py-3.5 flex items-center justify-center gap-2 shadow-md"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Enquiry
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-stone-500 mt-2">
                  Your enquiry has been received. The bakery will contact you for confirmation.
                </p>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
};
export default Order;
