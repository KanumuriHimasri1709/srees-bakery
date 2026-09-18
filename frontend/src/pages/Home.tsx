import React from "react";
import { Link } from "wouter";
import { Sparkles, ArrowRight, Clock, Truck, ShieldCheck, Heart, Instagram } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { GalleryGrid } from "../components/GalleryGrid";
import { cakes, specialTreats } from "../data/bakery";

export const Home: React.FC = () => {
  const featuredCakes = cakes.slice(0, 4);
  const featuredTreats = specialTreats.slice(0, 4);

  const handleOpenAi = () => {
    window.dispatchEvent(new CustomEvent("open-bakery-ai"));
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 overflow-hidden bg-gradient-to-b from-[#F7EFE5] via-[#FDFBF7] to-white border-b border-[#EADED3]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCECE9] text-[#8B263E] text-xs font-bold tracking-widest uppercase border border-[#F3D2CC]">
                <Sparkles className="w-3.5 h-3.5 text-[#C58A32]" />
                Artisan Home Bakery · Kakinada
              </div>

              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#2B1810] leading-[1.05]">
                Sweet moments, <br />
                <span className="italic font-normal text-[#8B263E]">beautifully baked.</span>
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
                Freshly baked cakes, cookies, chocolates and special treats made for your celebrations in Kakinada.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/menu" className="btn btn-primary text-sm shadow-md">
                  Explore Menu
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/custom-cakes" className="btn btn-secondary text-sm">
                  Create Your Cake
                </Link>
                <button onClick={handleOpenAi} className="btn btn-ghost text-sm text-[#8B263E] hover:bg-[#FCECE9]">
                  <Sparkles className="w-4 h-4 text-[#C58A32]" />
                  Ask AI
                </button>
              </div>

              {/* Verified Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-stone-200/80 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8B263E]" />
                  <span>Place 1 day before</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#8B263E]" />
                  <span>Rapido Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#8B263E]" />
                  <span>Egg & Eggless Available</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-4 rounded-3xl bg-[#F3D2CC]/40 transform -rotate-2" />
                <div className="relative rounded-3xl overflow-hidden border-8 border-white shadow-2xl bg-stone-100 aspect-[4/5]">
                  <img
                    src="/assets/gallery/original-027.jpg"
                    alt="Sree's Home Bakery Signature Cake"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 right-4 bg-[#8B263E]/95 backdrop-blur-sm text-white px-4 py-2 rounded-2xl text-xs font-serif shadow-lg border border-white/20">
                    <span className="block text-[10px] text-[#E0A952] uppercase tracking-wider">Handcrafted</span>
                    Signature Celebration Cake
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Cakes Section */}
      <section className="container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="eyebrow">Signature Flavours</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1810] mt-1">
              Freshly Baked Celebration Cakes
            </h2>
          </div>
          <Link href="/menu" className="text-sm font-semibold text-[#8B263E] hover:underline flex items-center gap-1">
            View full cake menu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCakes.map((cake, idx) => (
            <ProductCard
              key={idx}
              name={cake.name}
              price={cake.price}
              category="Cakes"
              description="Crafted with pure ingredients. Egg and eggless options available."
              image={cake.image}
            />
          ))}
        </div>
      </section>

      {/* 3. Custom Cakes Banner Section */}
      <section className="container">
        <div className="relative rounded-3xl overflow-hidden bg-[#2B1810] text-white p-8 md:p-14 border border-[#3D2314] shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-[#E0A952]">
                ✦ Made To Order
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight text-[#FDFBF7]">
                Your idea. Your cake.
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-lg">
                Have a dream celebration cake in mind? Share your theme, colours, flavour, or upload an inspiration photo. Sree’s Home Bakery brings your vision to life.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link href="/custom-cakes" className="btn btn-primary text-sm bg-[#8B263E] text-white">
                  Build Custom Cake
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/gallery" className="btn btn-secondary text-sm bg-white/10 text-white border-white/20 hover:bg-white/20">
                  View Cake Gallery
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <img
                src="/assets/gallery/original-010.jpg"
                alt="Theme Cake"
                className="w-full h-44 sm:h-52 rounded-2xl object-cover border-2 border-white/20 shadow-md"
              />
              <img
                src="/assets/gallery/original-012.jpg"
                alt="Custom Cake"
                className="w-full h-44 sm:h-52 rounded-2xl object-cover border-2 border-white/20 shadow-md mt-6"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Special Treats Section */}
      <section className="container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="eyebrow">Handcrafted Confections</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1810] mt-1">
              Special Treats & Brownies
            </h2>
          </div>
          <Link href="/special-treats" className="text-sm font-semibold text-[#8B263E] hover:underline flex items-center gap-1">
            See all special treats <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredTreats.map((treat, idx) => (
            <ProductCard
              key={idx}
              name={treat.name}
              price={treat.price}
              category="Special Treats"
              description="Freshly prepared home confectionery with authentic flavours."
              image={treat.image}
            />
          ))}
        </div>
      </section>

      {/* 5. Real Creations Gallery Preview */}
      <section className="container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="eyebrow">Real Bakes</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1810] mt-1">
              Original Creations from Our Oven
            </h2>
          </div>
          <Link href="/gallery" className="text-sm font-semibold text-[#8B263E] hover:underline flex items-center gap-1">
            Browse complete gallery <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <GalleryGrid limit={8} />
      </section>

      {/* 6. First Order Offer Banner */}
      <section className="container">
        <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-[#8B263E] to-[#721E31] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg border border-[#A63650]">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[#E0A952] text-xs font-bold uppercase tracking-wider">
              <Instagram className="w-3.5 h-3.5" />
              Special First-Order Welcome
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Get 10% OFF on Your First Bakery Order!
            </h3>
            <p className="text-sm text-stone-200 max-w-xl">
              Follow the bakery Instagram page and share it with your friends to receive 10% OFF on your very first order with Sree's Home Bakery.
            </p>
          </div>

          <Link href="/order" className="btn btn-secondary text-xs sm:text-sm bg-white text-[#8B263E] hover:bg-[#FDFBF7] shadow-sm flex-none">
            Claim 10% Offer
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 7. AI Assistant Feature */}
      <section className="container">
        <div className="rounded-3xl border border-[#EADED3] bg-[#FAF5EC] p-8 sm:p-12">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="w-12 h-12 rounded-full bg-[#8B263E] text-[#E0A952] inline-flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6" />
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1810]">
              Have questions? Ask our AI Assistant
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Our assistant is grounded in verified bakery information. Ask about chocolate cake prices, eggless options, bakery operating hours, or lead times anytime!
            </p>
            <button
              onClick={handleOpenAi}
              className="btn btn-primary text-sm shadow-md"
            >
              Open Bakery AI
              <Sparkles className="w-4 h-4 text-[#E0A952]" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
