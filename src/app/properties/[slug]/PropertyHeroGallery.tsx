"use client";

import { useState } from "react";
import Image from "next/image";
import type { PropertyVariant } from "@/lib/properties";

type Props = {
  property: PropertyVariant;
};

export function PropertyHeroGallery({ property }: Props) {
  const [open, setOpen] = useState(false);

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
          </div>

          {secondary.map((img, index) => {
            const isLast = index === secondary.length - 1;

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
                {isLast && (
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
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

      {open && (
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
                onClick={() => setOpen(false)}
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
                {images.map((img) => (
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
    </>
  );
}


