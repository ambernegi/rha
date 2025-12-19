"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { PropertyVariant } from "@/lib/properties";

type Props = {
  property: PropertyVariant;
};

export function PropertyHeroGallery({ property }: Props) {
  const [gridOpen, setGridOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const images = property.gallery.length
    ? property.gallery
    : [
        {
          src: property.mainImage,
          label: property.name,
        },
      ];

  const [first, ...rest] = images;
  const secondary = rest.slice(0, 4);
  const extraCount = Math.max(0, images.length - 5);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goPrev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setActiveIndex((i) => (i + 1) % images.length);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, images.length]);

  // Prevent background scroll when any modal is open (mobile UX).
  useEffect(() => {
    const open = gridOpen || lightboxOpen;
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [gridOpen, lightboxOpen]);

  const active = useMemo(() => images[activeIndex], [images, activeIndex]);

  return (
    <>
      <div className="card">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.5fr)",
            gap: "0.5rem",
            gridAutoRows: "minmax(120px, 1fr)",
          }}
        >
          <div
            style={{
              position: "relative",
              gridRow: "1 / span 2",
            }}
          >
            <Image
              src={first.src}
              alt={first.label || property.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              style={{
                borderRadius: "1rem",
                objectFit: "cover",
              }}
            />
            <button
              type="button"
              onClick={() => openLightbox(0)}
              style={{
                position: "absolute",
                inset: 0,
                background: "transparent",
                border: "none",
                cursor: "zoom-in",
              }}
              aria-label="Open photo"
            />
          </div>

          {secondary.map((img, index) => {
            const isLast = index === secondary.length - 1;
            const absoluteIndex = index + 1;

            return (
              <div
                key={img.src}
                style={{
                  position: "relative",
                  borderRadius: "0.9rem",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={img.src}
                  alt={img.label || property.name}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  style={{
                    objectFit: "cover",
                  }}
                />
                <button
                  type="button"
                  onClick={() => openLightbox(absoluteIndex)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "transparent",
                    border: "none",
                    cursor: "zoom-in",
                  }}
                  aria-label="Open photo"
                />
                {isLast && (
                  <button
                    type="button"
                    onClick={() => setGridOpen(true)}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      bottom: "0.75rem",
                      backgroundColor: "rgba(15,15,15,0.7)",
                      color: "white",
                      borderRadius: "999px",
                      border: "1px solid rgba(156,163,175,0.6)",
                      padding: "0.4rem 0.9rem",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                    }}
                  >
                    +{images.length} photos
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {gridOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(15,23,42,0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: "1120px",
              width: "100%",
              maxHeight: "100%",
              background: "#020617",
              borderRadius: "1rem",
              border: "1px solid rgba(148,163,184,0.6)",
              padding: "1rem 1.25rem 1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div>
                <div className="card-title">{property.name}</div>
                <div className="card-subtitle">
                  All photos from {property.name}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGridOpen(false)}
                style={{
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.6)",
                  background: "transparent",
                  color: "var(--text-muted)",
                  fontSize: "0.8rem",
                  padding: "0.25rem 0.9rem",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
            <div
              style={{
                overflowY: "auto",
                paddingRight: "0.25rem",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "0.9rem",
                }}
              >
                {images.map((img, idx) => (
                  <figure key={img.src} style={{ margin: 0 }}>
                    <div
                      style={{
                        position: "relative",
                        borderRadius: "0.9rem",
                        overflow: "hidden",
                        minHeight: "180px",
                      }}
                    >
                      <Image
                        src={img.src}
                        alt={img.label || property.name}
                        fill
                        sizes="(min-width: 768px) 25vw, 50vw"
                        style={{
                          objectFit: "cover",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setGridOpen(false);
                          openLightbox(idx);
                        }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "transparent",
                          border: "none",
                          cursor: "zoom-in",
                        }}
                        aria-label="Open photo"
                      />
                    </div>
                    <figcaption
                      style={{
                        marginTop: "0.35rem",
                        fontSize: 12,
                        color: "var(--text-muted)",
                      }}
                    >
                      {img.label || property.name}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {lightboxOpen && active && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => closeLightbox()}
        >
          <div
            className="modal"
            style={{ width: "min(1100px, 100%)", padding: "0.9rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <div className="muted">
                {activeIndex + 1} / {images.length}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" className="btn-secondary" onClick={() => goPrev()}>
                  Prev
                </button>
                <button type="button" className="btn-secondary" onClick={() => goNext()}>
                  Next
                </button>
                <button type="button" className="btn-secondary" onClick={() => closeLightbox()}>
                  Close
                </button>
              </div>
            </div>

            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 9",
                borderRadius: "0.9rem",
                overflow: "hidden",
                border: "1px solid rgba(148,163,184,0.35)",
              }}
              onTouchStart={(e) => {
                const t = e.touches[0];
                setTouchStart({ x: t.clientX, y: t.clientY });
              }}
              onTouchEnd={(e) => {
                if (!touchStart) return;
                const t = e.changedTouches[0];
                const dx = t.clientX - touchStart.x;
                const dy = t.clientY - touchStart.y;
                setTouchStart(null);
                if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy)) return;
                if (dx < 0) goNext();
                else goPrev();
              }}
            >
              <Image
                src={active.src}
                alt={active.label || property.name}
                fill
                sizes="(min-width: 768px) 80vw, 100vw"
                style={{ objectFit: "contain", background: "#000" }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}


