import React from "react";
import { MapPin, Phone, Clock, Truck, CreditCard, Sparkles, MessageCircle } from "lucide-react";
import { contact } from "../data/bakery";

export const Contact: React.FC = () => {
  const handleOpenAi = () => {
    window.dispatchEvent(new CustomEvent("open-bakery-ai"));
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Page Intro */}
      <section className="page-intro">
        <div className="container">
          <span className="eyebrow">Direct Contact & Location</span>
          <h1 className="serif">Get in Touch with Sree's Bakery</h1>
          <p>
            Have a question about cake flavours, delivery schedules, or placing a customized order? Call us directly, visit our bakery location, or chat with our grounded AI assistant.
          </p>
        </div>
      </section>

      {/* Main Details Grid */}
      <section className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 1. Address & Location Card */}
          <div className="luxury-card p-8 space-y-4 bg-white">
            <div className="w-12 h-12 rounded-2xl bg-[#FCECE9] text-[#8B263E] flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#2B1810]">
              Bakery Location
            </h3>
            <address className="not-italic text-sm text-stone-600 leading-relaxed">
              <strong>Sree's Home Bakery</strong>
              <br />Mega Residency 64-1h-5e/ff4,
              <br />Janaki Ram Nagar, Treasury Colony,
              <br />Pratap Nagar, Kakinada – 533004
              <br />Andhra Pradesh, India
            </address>
          </div>

          {/* 2. Phone Numbers & Timings Card */}
          <div className="luxury-card p-8 space-y-4 bg-white">
            <div className="w-12 h-12 rounded-2xl bg-[#FCECE9] text-[#8B263E] flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#2B1810]">
              Direct Phone Lines
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-stone-600">
                Call or WhatsApp for enquiries & immediate assistance:
              </p>
              <div className="flex flex-col gap-1.5 pt-1">
                {contact.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-2 text-base font-bold text-[#8B263E] hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    {phone}
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                <Clock className="w-4 h-4 text-[#C58A32]" />
                Operating Hours:
              </div>
              <p className="text-xs text-stone-600 pl-6">
                9:00 AM – 9:00 PM daily
              </p>
            </div>
          </div>

          {/* 3. Delivery & Payment Card */}
          <div className="luxury-card p-8 space-y-4 bg-white">
            <div className="w-12 h-12 rounded-2xl bg-[#FCECE9] text-[#8B263E] flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#2B1810]">
              Delivery & Payment
            </h3>

            <div className="space-y-3 text-sm text-stone-600">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2B1810]">
                  <Truck className="w-4 h-4 text-[#8B263E]" />
                  Home Delivery:
                </div>
                <p className="text-xs pl-6 leading-relaxed">
                  Delivered safely via Rapido. Delivery charges are paid directly by the customer.
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2B1810]">
                  <CreditCard className="w-4 h-4 text-[#8B263E]" />
                  Payment Methods:
                </div>
                <p className="text-xs pl-6">
                  Payment is accepted seamlessly through PhonePe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive AI Banner */}
      <section className="container">
        <div className="luxury-card p-8 sm:p-12 bg-[#FAF5EC] border border-[#EADED3] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1810]">
              Instant Answers with Sree's Bakery AI
            </h3>
            <p className="text-sm text-stone-600 max-w-xl">
              Get immediate, accurate answers regarding our cake flavours, verified menu pricing, dietary options, or customized theme orders.
            </p>
          </div>

          <button
            onClick={handleOpenAi}
            className="btn btn-primary text-sm flex items-center gap-2 shadow-md flex-none"
          >
            <Sparkles className="w-4 h-4 text-[#E0A952]" />
            Ask Bakery AI Now
          </button>
        </div>
      </section>
    </div>
  );
};
export default Contact;
