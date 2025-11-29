"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { GalleryImage } from "@/lib/properties";

type PropertyGalleryProps = {
  title: string;
  coverSrc: string;
  coverAlt: string;
  images: GalleryImage[];
};

export default function PropertyGallery({
  title,
  coverSrc,
  coverAlt,
  images,
}: PropertyGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const allImages = useMemo<GalleryImage[]>(() => {
    const list: GalleryImage[] = [];
    list.push({ src: coverSrc, label: coverAlt || title });
    for (const img of images) {
      if (!list.some((i) => i.src === img.src)) {
        list.push(img);
      }
    }
    return list;
  }, [coverSrc, coverAlt, images, title]);

  const visibleTiles = allImages.slice(0, 5);
  const mainImage = visibleTiles[0];
  const secondaryTiles = visibleTiles.slice(1);
  const extraCount = allImages.length - visibleTiles.length;

  const openAt = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const next = () => {
    setActiveIndex((prev) => (prev + 1) % allImages.length);
  };

  const prev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1,
    );
  };

  return (
    <>
      <div className="card">
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              secondaryTiles.length > 0
                ? "minmax(0, 2fr) minmax(0, 1.5fr)"
                : "minmax(0, 1fr)",
            gap: "0.75rem",
          }}
        >
          <button
            type="button"
            onClick={() => openAt(0)}
            style={{
              border: "none",
              background: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "inherit",
            }}
          >
            <Image
              src={mainImage.src}
              alt={mainImage.label || title}
              width={1200}
              height={700}
              style={{
                borderRadius: "1.25rem",
                width: "100%",
                height: "auto",
                objectFit: "cover",
                display: "block",
              }}
            />
          </button>

          {secondaryTiles.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gridTemplateRows: "repeat(2, minmax(0, 1fr))",
                gap: "0.5rem",
              }}
            >
              {secondaryTiles.map((img, index) => {
                const absoluteIndex = index + 1; // offset because main image is 0
                const isLastTile = index === secondaryTiles.length - 1;
                const badgeText =
                  extraCount > 0 && isLastTile
                    ? `+${extraCount} photos`
                    : "";

                return (
                  <button
                    key={img.src}
                    type="button"
                    onClick={() => openAt(absoluteIndex)}
                    style={{
                      position: "relative",
                      border: "none",
                      background: "none",
                      padding: 0,
                      cursor: "pointer",
                      textAlign: "inherit",
                    }}
                  >
                    <Image
                      src={img.src}
                      alt={img.label || title}
                      width={600}
                      height={400}
                      style={{
                        borderRadius: "0.9rem",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    {badgeText && (
                      <span
                        style={{
                          position: "absolute",
                          right: "0.6rem",
                          bottom: "0.6rem",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "999px",
                          background:
                            "rgba(15, 23, 42, 0.85)",
                          color: "white",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                        }}
                      >
                        {badgeText}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.9)",
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 1.5rem",
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: "0.95rem",
              }}
            >
              {title}
            </span>
            <button
              type="button"
              onClick={close}
              className="btn-secondary"
              style={{
                background: "rgba(15, 23, 42, 0.85)",
                color: "white",
                borderColor: "rgba(148, 163, 184, 0.6)",
              }}
            >
              Close
            </button>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.5rem",
              padding: "0 1.5rem 1.5rem",
            }}
          >
            <button
              type="button"
              onClick={prev}
              className="btn-secondary"
              style={{
                background: "rgba(15, 23, 42, 0.85)",
                color: "white",
                borderColor: "rgba(148, 163, 184, 0.6)",
              }}
            >
              ‹
            </button>

            <div
              style={{
                maxWidth: "960px",
                width: "100%",
              }}
            >
              <Image
                src={allImages[activeIndex].src}
                alt={allImages[activeIndex].label || title}
                width={1600}
                height={1000}
                style={{
                  borderRadius: "1rem",
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
              <div
                style={{
                  marginTop: "0.5rem",
                  color: "rgba(229, 231, 235, 0.85)",
                  fontSize: "0.85rem",
                  textAlign: "center",
                }}
              >
                {allImages[activeIndex].label || title} ·{" "}
                {activeIndex + 1} / {allImages.length}
              </div>
            </div>

            <button
              type="button"
              onClick={next}
              className="btn-secondary"
              style={{
                background: "rgba(15, 23, 42, 0.85)",
                color: "white",
                borderColor: "rgba(148, 163, 184, 0.6)",
              }}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </>
  );
}


