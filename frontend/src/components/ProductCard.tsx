import React, { useState } from "react";
import { Link } from "wouter";
import { Sparkles, ArrowRight } from "lucide-react";
import { getFallbackImage } from "../data/bakery";

interface ProductCardProps {
  name: string;
  price: string;
  category: string;
  description?: string;
  image?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  name,
  price,
  category,
  description,
  image
}) => {
  const [imgSrc, setImgSrc] = useState<string>(image || getFallbackImage(name, category));

  const handleAskAi = () => {
    window.dispatchEvent(
      new CustomEvent("open-bakery-ai", {
        detail: { initialQuery: `What is the price and details of ${name}?` },
      })
    );
  };

  return (
    <div className="luxury-card flex flex-col h-full group overflow-hidden">
      {/* Product Image Frame */}
      <div className="relative h-60 w-full overflow-hidden bg-stone-100">
        <img
          src={imgSrc}
          alt={name}
          onError={() => setImgSrc(getFallbackImage(name, category))}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-[#FDFBF7]/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#8B263E] uppercase tracking-wider shadow-sm">
          {category}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-serif text-xl font-bold text-[#2B1810] group-hover:text-[#8B263E] transition-colors leading-snug">
              {name}
            </h3>
          </div>

          <div className="text-sm font-bold text-[#8B263E] mb-3">
            {price}
          </div>

          {description && (
            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
              {description}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
          <button
            onClick={handleAskAi}
            className="text-xs font-semibold text-stone-500 hover:text-[#8B263E] flex items-center gap-1 py-1 transition-colors"
            title="Ask AI about this item"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C58A32]" />
            Ask AI
          </button>

          <Link
            href={`/order?product=${encodeURIComponent(name)}`}
            className="btn btn-sm btn-secondary text-xs flex items-center gap-1 hover:bg-[#8B263E] hover:text-white transition-colors"
          >
            Enquire
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ProductCard;
