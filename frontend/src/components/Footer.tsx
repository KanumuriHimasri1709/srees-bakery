import React from "react";
import { Link } from "wouter";
import { MapPin, Phone, Clock, Truck, CreditCard, Shield } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2B1810] text-[#FDFBF7] pt-16 pb-12 border-t border-[#3D2314]">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-700/60">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-[#8B263E] text-white flex items-center justify-center font-serif font-bold text-lg">
                S
              </span>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Sree's Home Bakery
              </span>
            </div>
            <p className="text-stone-300 text-sm leading-relaxed">
              Handcrafted cakes, cookies, chocolates, and celebration treats freshly baked with love in Kakinada, Andhra Pradesh.
            </p>
            <div className="pt-2 text-xs text-[#E0A952] font-semibold tracking-wide">
              ✦ Freshly baked to order · Egg & eggless available
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-[#E0A952] mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm text-stone-300">
              <li>
                <Link href="/menu" className="hover:text-white transition-colors">
                  Bakery Menu
                </Link>
              </li>
              <li>
                <Link href="/custom-cakes" className="hover:text-white transition-colors">
                  Custom Cakes & Theme Bakes
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  Creations Gallery
                </Link>
              </li>
              <li>
                <Link href="/special-treats" className="hover:text-white transition-colors">
                  Special Treats & Brownies
                </Link>
              </li>
              <li>
                <Link href="/order" className="hover:text-white transition-colors">
                  Place an Enquiry
                </Link>
              </li>
            </ul>
          </div>

          {/* Business & Delivery Info */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-[#E0A952] mb-4">Ordering & Delivery</h4>
            <ul className="space-y-3 text-sm text-stone-300">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#C58A32] flex-none mt-0.5" />
                <span>9:00 AM – 9:00 PM (Daily)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#C58A32] flex-none mt-0.5" />
                <span>Home delivery through Rapido (Delivery charges paid by customer)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CreditCard className="w-4 h-4 text-[#C58A32] flex-none mt-0.5" />
                <span>Payment accepted via PhonePe</span>
              </li>
              <li className="text-xs text-stone-400 pl-6.5">
                Please place customized cake orders at least 1 day before.
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-[#E0A952] mb-4">Visit & Contact</h4>
            <div className="space-y-3 text-sm text-stone-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C58A32] flex-none mt-0.5" />
                <address className="not-italic leading-relaxed">
                  Mega Residency 64-1h-5e/ff4,
                  <br />Janaki Ram Nagar, Treasury Colony,
                  <br />Pratap Nagar, Kakinada – 533004
                </address>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#C58A32] flex-none mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <a href="tel:7981468535" className="hover:text-white transition-colors">
                    7981468535
                  </a>
                  <a href="tel:8801121818" className="hover:text-white transition-colors">
                    8801121818
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Sree's Home Bakery. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-stone-200 transition-colors">
              Contact Us
            </Link>
            <Link href="/user" className="hover:text-stone-200 transition-colors">
              Customer Portal
            </Link>
            <Link href="/admin/login" className="flex items-center gap-1 hover:text-stone-200 transition-colors">
              <Shield className="w-3.5 h-3.5 text-[#C58A32]" />
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
