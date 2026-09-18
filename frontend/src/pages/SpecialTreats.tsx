import React from "react";
import { ProductCard } from "../components/ProductCard";
import { brownies, chocolates, specialTreats } from "../data/bakery";
import { Sparkles, ShieldCheck, Heart } from "lucide-react";

export const SpecialTreats: React.FC = () => {
  return (
    <div className="space-y-16 pb-20">
      {/* Page Intro */}
      <section className="page-intro">
        <div className="container">
          <span className="eyebrow">Artisan Delights</span>
          <h1 className="serif">Special Treats & Confections</h1>
          <p>
            From decadent Apricot Delight and fudgy brownies to personalized name chocolates and wholesome millet cookies, every item is freshly crafted in small batches.
          </p>
        </div>
      </section>

      {/* Special Delights: Apricot, Muffins, Bento Cake */}
      <section className="container space-y-6">
        <div>
          <span className="eyebrow">Signature Confections</span>
          <h2 className="font-serif text-3xl font-bold text-[#2B1810] mt-1">
            Celebration Specials & Delights
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialTreats.map((treat, idx) => (
            <ProductCard
              key={idx}
              name={treat.name}
              price={treat.price}
              category="Special Treats"
              description={
                treat.name.includes("Millet")
                  ? "Dietary Note: Only Millet Cookies are explicitly confirmed as having no sugar and no maida."
                  : "Artisan fresh specialty prepared for sweet moments."
              }
              image={treat.image}
            />
          ))}
        </div>
      </section>

      {/* Verified Dietary Claim Spotlight: Millet Cookies */}
      <section className="container">
        <div className="rounded-3xl p-6 sm:p-8 bg-[#FAF5EC] border border-[#EADED3] flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[#8B263E] text-[#E0A952] flex-none flex items-center justify-center mt-1">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-stone-700">
            <h4 className="font-serif text-lg font-bold text-[#2B1810]">
              Verified Bakery Dietary Notice: Millet Cookies
            </h4>
            <p className="leading-relaxed">
              <strong>Only Millet Cookies</strong> are explicitly confirmed as having no sugar and no maida. This dietary claim applies exclusively to Millet Cookies and does not generalize to any other cakes, brownies, or cookies in our bakery.
            </p>
            <p className="text-stone-500 text-xs pt-1">
              Please contact the bakery at 7981468535 / 8801121818 to inquire about batch availability or custom sweetness levels.
            </p>
          </div>
        </div>
      </section>

      {/* Fudgy Brownies Section */}
      <section className="container space-y-6">
        <div>
          <span className="eyebrow">Rich & Fudgy</span>
          <h2 className="font-serif text-3xl font-bold text-[#2B1810] mt-1">
            Handcrafted Brownies
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {brownies.map((b, idx) => (
            <ProductCard
              key={idx}
              name={b.name}
              price={b.price}
              category="Brownies"
              description="Made with pure dark chocolate and butter for an intense fudgy crumb."
              image={b.image}
            />
          ))}
        </div>
      </section>

      {/* Artisan Chocolates Section */}
      <section className="container space-y-6">
        <div>
          <span className="eyebrow">Hand-Poured & Molded</span>
          <h2 className="font-serif text-3xl font-bold text-[#2B1810] mt-1">
            Custom Chocolates & Gift Boxes
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {chocolates.map((ch, idx) => (
            <ProductCard
              key={idx}
              name={ch.name}
              price={ch.price}
              category="Chocolates"
              description="Customized chocolates available. Gift packaging and name spelling available upon request."
              image={ch.image}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
export default SpecialTreats;
