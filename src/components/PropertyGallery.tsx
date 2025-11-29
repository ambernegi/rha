"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalleryImage } from "@/lib/properties";

type PropertyGalleryProps = {
  images: GalleryImage[];
  title: string;
};

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const previewImages = images.slice(0, 5);
  const remainingCount = images.length - previewImages.length;

  const openAt = (idx: number) => setActiveIndex(idx);
  const close = () => setActiveIndex(null);
  const showPrev = () => {
    setActiveIndex((prev) =>
      prev === null ? null : (prev - 1 + images.length) % images.length,
    );
  };
  const showNext = () => {
    setActiveIndex((prev) =>
      prev === null ? null : (prev + 1) % images.length,
    );
  };

  return (
    <>
      <div className="property-gallery-grid">
        {previewImages.map((img, idx) => {
          const isLast = idx === previewImages.length - 1 && remainingCount > 0;

          return (
            <button
              key={img.src}
              type="button"
              className={
                "property-gallery-tile" +
                (idx === 0 ? " property-gallery-tile-main" : "")
              }
              onClick={() => openAt(idx)}
            >
              <Image
                src={img.src}
                alt={img.label || title}
                width={900}
                height={600}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "1rem",
                }}
              />
              {isLast && (
                <div className="property-gallery-more">
                  +{remainingCount} photos
                </div>
              )}
            </button>
          );
        })}
      </div>

      {activeIndex !== null && (
        <div className="property-gallery-modal" onClick={close}>
          <div
            className="property-gallery-modal-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="property-gallery-modal-header">
              <span className="property-gallery-modal-title">{title}</span>
              <button
                type="button"
                className="property-gallery-modal-close"
                onClick={close}
              >
                ×
              </button>
            </div>

            <div className="property-gallery-modal-body">
              <button
                type="button"
                className="property-gallery-nav property-gallery-nav-left"
                onClick={showPrev}
              >
                ‹
              </button>

              <Image
                src={images[activeIndex].src}
                alt={images[activeIndex].label || title}
                width={1200}
                height={800}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: "1rem",
                }}
              />

              <button
                type="button"
                className="property-gallery-nav property-gallery-nav-right"
                onClick={showNext}
              >
                ›
              </button>
            </div>

            <div className="property-gallery-modal-footer">
              {activeIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


