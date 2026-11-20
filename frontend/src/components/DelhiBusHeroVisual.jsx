import React from 'react';

/**
 * DelhiBusHeroVisual
 * Displays the Delhi India Gate + DTC bus hero illustration image.
 * Replaces the previous inline SVG with a raster asset for a richer visual.
 */
export default function DelhiBusHeroVisual({ className = '' }) {
  return (
    <div className={`w-full overflow-hidden rounded-2xl relative select-none ${className}`}>
      <img
        src="/hero-bus-illustration.jpg"
        alt="Delhi India Gate and DTC blue bus illustration"
        className="w-full h-auto object-cover max-w-[520px] mx-auto"
        draggable={false}
      />
    </div>
  );
}
