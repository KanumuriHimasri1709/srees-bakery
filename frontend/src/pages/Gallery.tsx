import React from "react";
import { GalleryGrid } from "../components/GalleryGrid";
import { Sparkles, Camera } from "lucide-react";

export const Gallery: React.FC = () => {
  return (
    <div className="space-y-12 pb-20">
      {/* Intro Header */}
      <section className="page-intro">
        <div className="container">
          <span className="eyebrow">Our Portfolio</span>
          <h1 className="serif">Real Bakery Creations</h1>
          <p>
            Browse genuine photographs of cakes, celebration bakes, cookies, and handcrafted confections prepared with passion at Sree’s Home Bakery in Kakinada.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-[#8B263E] font-semibold">
            <Camera className="w-4 h-4 text-[#C58A32]" />
            All 45 images are authentic photos of our past orders. Click any cake to view or create a similar design!
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="container">
        <GalleryGrid />
      </section>
    </div>
  );
};
export default Gallery;
