import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { X, ChevronLeft, ChevronRight, Sparkles, Wand2 } from "lucide-react";
import { photos, GalleryPhoto, getFallbackImage, galleryFilters } from "../data/bakery";

interface GalleryGridProps {
  initialCategory?: string;
  limit?: number;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  initialCategory = "All",
  limit
}) => {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const filteredPhotos = photos.filter((p) => {
    if (selectedCategory === "All") return true;
    return p.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const displayPhotos = limit ? filteredPhotos.slice(0, limit) : filteredPhotos;

  const activePhoto = activePhotoIndex !== null ? displayPhotos[activePhotoIndex] : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex((activePhotoIndex - 1 + displayPhotos.length) % displayPhotos.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex((activePhotoIndex + 1) % displayPhotos.length);
    }
  };

  const handleCreateSimilar = (photo: GalleryPhoto) => {
    // Navigate to /custom-cakes with photo.src preloaded in query
    setLocation(`/custom-cakes?ref=${encodeURIComponent(photo.src)}&title=${encodeURIComponent(photo.label)}`);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIndex === null) return;
      if (e.key === "Escape") setActivePhotoIndex(null);
      if (e.key === "ArrowLeft") {
        setActivePhotoIndex((prev) => (prev !== null ? (prev - 1 + displayPhotos.length) % displayPhotos.length : null));
      }
      if (e.key === "ArrowRight") {
        setActivePhotoIndex((prev) => (prev !== null ? (prev + 1) % displayPhotos.length : null));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhotoIndex, displayPhotos.length]);

  return (
    <div className="space-y-8">
      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {galleryFilters.map((cat) => (
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

      {/* Grid of Authentic Photos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {displayPhotos.map((photo, idx) => (
          <div
            key={idx}
            onClick={() => setActivePhotoIndex(idx)}
            className="group relative h-72 rounded-2xl overflow-hidden bg-stone-100 border border-[#EADED3] cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
          >
            <img
              src={photo.src}
              alt={photo.label}
              onError={(e) => {
                (e.target as HTMLImageElement).src = getFallbackImage(photo.label, photo.category);
              }}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <span className="text-[11px] font-medium text-[#E0A952] uppercase tracking-wider mb-1">
                {photo.category}
              </span>
              <h4 className="font-serif text-lg font-bold text-white leading-tight">
                {photo.label}
              </h4>
              <p className="text-xs text-stone-300 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#E0A952]" />
                Click to view details
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhotoIndex(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-2xl border border-stone-700/30 flex flex-col max-h-[92vh]"
          >
            {/* Lightbox Header with Close */}
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FCECE9] text-[#8B263E] text-xs font-semibold">
                  {activePhoto.category}
                </span>
                <span className="text-xs text-stone-500">
                  {activePhotoIndex! + 1} of {displayPhotos.length}
                </span>
              </div>
              <button
                onClick={() => setActivePhotoIndex(null)}
                className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lightbox Image Stage with Prev/Next Controls */}
            <div className="relative flex-1 bg-stone-950 flex items-center justify-center overflow-hidden min-h-[350px] max-h-[60vh]">
              <img
                src={activePhoto.src}
                alt={activePhoto.label}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getFallbackImage(activePhoto.label, activePhoto.category);
                }}
                className="max-h-full max-w-full object-contain"
              />

              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all"
                title="Previous Image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all"
                title="Next Image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Lightbox Footer & Action */}
            <div className="p-5 bg-white border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#2B1810]">
                  {activePhoto.label}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Authentic creation crafted by Sree's Home Bakery in Kakinada.
                </p>
              </div>

              <button
                onClick={() => handleCreateSimilar(activePhoto)}
                className="btn btn-primary text-xs flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4 text-[#E0A952]" />
                Create Similar Cake
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default GalleryGrid;
