"use client";

import { useEffect, useState } from "react";

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const safeImages = images.filter(Boolean);

  const closeLightbox = () => setIsLightboxOpen(false);
  const showPrevious = () => setActiveImage((current) => (current - 1 + safeImages.length) % safeImages.length);
  const showNext = () => setActiveImage((current) => (current + 1) % safeImages.length);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") setActiveImage((current) => (current - 1 + safeImages.length) % safeImages.length);
      if (event.key === "ArrowRight") setActiveImage((current) => (current + 1) % safeImages.length);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, safeImages.length]);

  if (safeImages.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        No property images available
      </div>
    );
  }

  return (
    <section aria-label={`${title} photo gallery`}>
      <button
        type="button"
        onClick={() => setIsLightboxOpen(true)}
        className="block w-full overflow-hidden rounded-2xl bg-slate-200 text-left"
        aria-label={`Open ${title} photo ${activeImage + 1} in full screen`}
      >
        <img
          src={safeImages[activeImage]}
          alt={`${title}, property photo ${activeImage + 1}`}
          className="h-[20rem] w-full object-cover sm:h-[30rem]"
          loading="eager"
        />
      </button>

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {safeImages.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveImage(index)}
            className={`min-h-20 overflow-hidden rounded-lg border-2 sm:min-h-24 ${activeImage === index ? "border-[var(--brand)]" : "border-transparent"}`}
            aria-label={`Show ${title}, property photo ${index + 1}`}
            aria-pressed={activeImage === index}
          >
            <img
              src={image}
              alt={`${title}, thumbnail photo ${index + 1}`}
              className="h-20 w-full object-cover sm:h-24"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(13_29_30_/_92%)] p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photo viewer`}
          onClick={closeLightbox}
        >
          <button type="button" onClick={closeLightbox} className="absolute right-4 top-4 button-secondary min-h-12 min-w-12 p-0 text-2xl" aria-label="Close photo viewer">×</button>
          {safeImages.length > 1 && <button type="button" onClick={(event) => { event.stopPropagation(); showPrevious(); }} className="absolute left-3 top-1/2 button-secondary min-h-12 min-w-12 -translate-y-1/2 p-0 text-2xl sm:left-8" aria-label="Previous photo">‹</button>}
          <img
            src={safeImages[activeImage]}
            alt={`${title}, property photo ${activeImage + 1}`}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          {safeImages.length > 1 && <button type="button" onClick={(event) => { event.stopPropagation(); showNext(); }} className="absolute right-3 top-1/2 button-secondary min-h-12 min-w-12 -translate-y-1/2 p-0 text-2xl sm:right-8" aria-label="Next photo">›</button>}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm font-bold text-white">{activeImage + 1} / {safeImages.length}</p>
        </div>
      )}
    </section>
  );
}
