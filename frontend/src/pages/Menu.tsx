import React, { useState, useEffect } from "react";
import { Search, Sparkles, Clock, ShieldCheck } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { api } from "../services/api";
import { cakes, cookies, brownies, chocolates, specialTreats } from "../data/bakery";

export const Menu: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const categories = [
    "All",
    "Cakes",
    "Cookies",
    "Brownies",
    "Chocolates",
    "Special Treats",
  ];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.fetchMenu();
        if (res.success && res.products && res.products.length > 0) {
          setDbProducts(res.products);
        }
      } catch {
        // Fallback to static verified catalog
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Combine or fallback to static catalog
  const allItems =
    dbProducts.length > 0
      ? dbProducts
      : [
          ...cakes.map((c) => ({ ...c, category: "Cakes", description: "Fresh whipped cream layers. Egg & eggless available." })),
          ...cookies.map((c) => ({
            ...c,
            category: "Cookies",
            description: c.name.includes("Millet")
              ? "Verified Note: Only Millet Cookies are explicitly confirmed as having no sugar and no maida."
              : "Crispy freshly baked batch using wholesome ingredients.",
          })),
          ...brownies.map((b) => ({ ...b, category: "Brownies", description: "Fudgy, melt-in-mouth dark chocolate brownies." })),
          ...chocolates.map((ch) => ({ ...ch, category: "Chocolates", description: "Handcrafted artisan chocolates molded fresh." })),
          ...specialTreats.map((st) => ({
            ...st,
            category: "Special Treats",
            description: st.name.includes("Millet")
              ? "Verified Note: Only Millet Cookies are explicitly confirmed as having no sugar and no maida."
              : "Signature dessert confections for celebrations.",
          })),
        ];

  const filteredItems = allItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-12 pb-20">
      {/* Page Intro */}
      <section className="page-intro">
        <div className="container">
          <span className="eyebrow">Verified Bakery Catalog</span>
          <h1 className="serif">Our Fresh Bakery Menu</h1>
          <p>
            Explore our verified collection of handcrafted cakes, wholesome cookies, fudgy brownies, and artisan chocolates baked fresh daily in Kakinada.
          </p>

          {/* Policy Badges */}
          <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-[#EADED3] text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8B263E]" />
              <span>Cakes: Place order 1 day before</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8B263E]" />
              <span>Egg and eggless options available</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C58A32]" />
              <span>Customized cakes & chocolates available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Filter Toolbar */}
      <section className="container">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-[#8B263E] text-white shadow-sm"
                    : "bg-white text-stone-700 border border-[#EADED3] hover:border-[#8B263E] hover:text-[#8B263E]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search flavours, cookies..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-full border border-[#EADED3] bg-white text-[#2B1810] outline-none focus:border-[#8B263E]"
            />
          </div>
        </div>

        {/* Product Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#EADED3] space-y-3">
            <p className="text-stone-500 text-sm">No bakery items matched your search criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="btn btn-sm btn-secondary text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {filteredItems.map((item, idx) => (
              <ProductCard
                key={item.id || idx}
                name={item.name}
                price={item.price}
                category={item.category}
                description={item.description}
                image={item.image_url || item.image}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
export default Menu;
