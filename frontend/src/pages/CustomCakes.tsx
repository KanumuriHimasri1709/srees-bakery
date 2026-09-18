import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { ImageUpload } from "../components/ImageUpload";
import { api } from "../services/api";
import { toast } from "sonner";
import { Sparkles, CheckCircle2, Clock, Truck, ShieldCheck, Heart } from "lucide-react";

export const CustomCakes: React.FC = () => {
  const [location] = useLocation();
  const { user } = useAuth();

  // Parse query parameters if redirected from gallery
  const searchParams = new URLSearchParams(window.location.search);
  const initialRef = searchParams.get("ref") || "";
  const initialTitle = searchParams.get("title") || "";

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    occasion: "",
    requiredDate: "",
    flavour: "Chocolate",
    size: "1 kg",
    eggPreference: "Eggless",
    theme: initialTitle ? `Inspired by ${initialTitle}` : "",
    colour: "",
    sweetness: "Standard",
    messageOnCake: "",
    additionalMessage: "",
    referenceImageUrl: initialRef,
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
      const res = await api.submitCustomCake(formData);
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

  const flavours = [
    "Vanilla",
    "Pineapple",
    "Strawberry",
    "Butterscotch",
    "Blueberry",
    "Chocolate",
    "Rasmalai",
    "Black Forest",
    "Red Velvet",
    "Tender Coconut",
    "Custom Combination",
  ];

  const sizes = ["½ kg", "1 kg", "1.5 kg", "2 kg", "2.5 kg", "3 kg+ (Multi-tier)"];

  return (
    <div className="space-y-16 pb-20">
      {/* Intro Header */}
      <section className="page-intro">
        <div className="container">
          <span className="eyebrow">Custom Cake Studio</span>
          <h1 className="serif">Your idea. Your cake.</h1>
          <p>
            Whether it's a themed birthday celebration, an elegant tiered wedding masterpiece, or a personalized message cake, we handcraft custom cakes tailored exactly to your vision.
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-[#EADED3] text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8B263E]" />
              <span>Orders must be placed at least 1 day before</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8B263E]" />
              <span>Egg and eggless options available</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#8B263E]" />
              <span>Delivery via Rapido (customer paid)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Builder Form */}
      <section className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Inspiration Gallery & Trust */}
          <div className="lg:col-span-5 space-y-6">
            <div className="luxury-card p-6 bg-[#FAF5EC]/60 space-y-4">
              <h3 className="font-serif text-2xl font-bold text-[#2B1810]">
                Custom Creations by Sree
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Take a look at some of the authentic custom themed celebration cakes crafted right here in our Kakinada kitchen:
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <img
                  src="/assets/gallery/original-004.jpg"
                  alt="Square Custom Cake"
                  className="rounded-xl object-cover h-36 w-full border border-[#EADED3]"
                />
                <img
                  src="/assets/gallery/original-014.jpg"
                  alt="Message Custom Cake"
                  className="rounded-xl object-cover h-36 w-full border border-[#EADED3]"
                />
                <img
                  src="/assets/gallery/original-035.jpg"
                  alt="Purple Custom Cake"
                  className="rounded-xl object-cover h-36 w-full border border-[#EADED3]"
                />
                <img
                  src="/assets/gallery/original-036.jpg"
                  alt="Modern Celebration Cake"
                  className="rounded-xl object-cover h-36 w-full border border-[#EADED3]"
                />
              </div>
            </div>

            <div className="luxury-card p-6 bg-white space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#8B263E] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#C58A32]" />
                How Custom Orders Work
              </div>
              <ol className="space-y-2.5 text-xs text-stone-600 list-decimal list-inside leading-relaxed">
                <li>
                  <strong>Submit your idea:</strong> Fill in your preferred flavour, theme, and upload design photos.
                </li>
                <li>
                  <strong>Direct Confirmation:</strong> The bakery contacts you at 7981468535 / 8801121818 to finalize pricing and specifics.
                </li>
                <li>
                  <strong>Bake & Deliver:</strong> Your cake is freshly prepared and safely delivered via Rapido or available for pickup.
                </li>
              </ol>
            </div>
          </div>

          {/* Right Column: Interactive Custom Cake Builder Form */}
          <div className="lg:col-span-7">
            {submittedId ? (
              <div className="luxury-card p-8 sm:p-12 text-center space-y-4 bg-white border-2 border-emerald-100">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-[#2B1810]">
                  Enquiry #{submittedId} Received!
                </h2>
                <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  Your enquiry has been received. The bakery will contact you for confirmation and pricing details.
                </p>
                <div className="pt-4 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => {
                      setSubmittedId(null);
                      setFormData({
                        name: user?.name || "",
                        phone: user?.phone || "",
                        email: user?.email || "",
                        occasion: "",
                        requiredDate: "",
                        flavour: "Chocolate",
                        size: "1 kg",
                        eggPreference: "Eggless",
                        theme: "",
                        colour: "",
                        sweetness: "Standard",
                        messageOnCake: "",
                        additionalMessage: "",
                        referenceImageUrl: "",
                      });
                    }}
                    className="btn btn-secondary text-xs"
                  >
                    Submit Another Enquiry
                  </button>
                  {user && (
                    <a href="/user" className="btn btn-primary text-xs">
                      View in My Board
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="luxury-card p-6 sm:p-10 bg-white">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="border-b border-[#EADED3] pb-4">
                    <h3 className="font-serif text-2xl font-bold text-[#2B1810]">
                      Custom Cake Request
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Fill out the details below so we can craft your ideal celebration cake.
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Customer Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Sravanthi"
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
                        placeholder="e.g. 9876543210"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Occasion & Required Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Occasion</label>
                      <input
                        type="text"
                        value={formData.occasion}
                        onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                        placeholder="e.g. Birthday, Anniversary"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Required Date (1 day in advance) *</label>
                      <input
                        type="date"
                        required
                        value={formData.requiredDate}
                        onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Flavour, Size & Egg Preference */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">Cake Flavour</label>
                      <select
                        value={formData.flavour}
                        onChange={(e) => setFormData({ ...formData, flavour: e.target.value })}
                        className="form-select"
                      >
                        {flavours.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Size / Weight</label>
                      <select
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className="form-select"
                      >
                        {sizes.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
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
                  </div>

                  {/* Theme, Colour & Sweetness */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">Theme / Concept</label>
                      <input
                        type="text"
                        value={formData.theme}
                        onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                        placeholder="e.g. Princess, Cricket, Floral"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Preferred Colour</label>
                      <input
                        type="text"
                        value={formData.colour}
                        onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                        placeholder="e.g. Pastel pink, Royal blue"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Sweetness Preference</label>
                      <select
                        value={formData.sweetness}
                        onChange={(e) => setFormData({ ...formData, sweetness: e.target.value })}
                        className="form-select"
                      >
                        <option value="Standard">Standard</option>
                        <option value="Mild Sweet">Mild / Less Sweet</option>
                        <option value="Rich Sweet">Rich & Sweet</option>
                      </select>
                    </div>
                  </div>

                  {/* Message on Cake */}
                  <div>
                    <label className="form-label">Name / Message to Write on Cake</label>
                    <input
                      type="text"
                      value={formData.messageOnCake}
                      onChange={(e) => setFormData({ ...formData, messageOnCake: e.target.value })}
                      placeholder="e.g. Happy 5th Birthday Ananya!"
                      className="form-input"
                    />
                  </div>

                  {/* Reference Image Upload */}
                  <ImageUpload
                    value={formData.referenceImageUrl}
                    onChange={(url) => setFormData({ ...formData, referenceImageUrl: url })}
                    label="Reference Cake Photo / Design (Optional)"
                  />

                  {/* Additional Requirements */}
                  <div>
                    <label className="form-label">Additional Requirements or Dietary Notes</label>
                    <textarea
                      rows={3}
                      value={formData.additionalMessage}
                      onChange={(e) => setFormData({ ...formData, additionalMessage: e.target.value })}
                      placeholder="Any special details, toppers, delivery instructions..."
                      className="form-textarea"
                    />
                  </div>

                  {/* Submit Button */}
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
                          <Sparkles className="w-4 h-4 text-[#E0A952]" />
                          Submit Custom Cake Enquiry
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-center text-stone-500 mt-2">
                      Your enquiry will be sent directly to Sree's Home Bakery for confirmation.
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
export default CustomCakes;
