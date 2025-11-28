import Image from "next/image";
import { notFound } from "next/navigation";
import {
  PROPERTY_VARIANTS,
  SHARED_AMENITIES,
  getPropertyBySlug,
} from "@/lib/properties";

export default function PropertyPage({ params }: any) {
  const property = getPropertyBySlug(params?.slug);

  if (!property) {
    return notFound();
  }

  const topGalleryImages = property.gallery.slice(0, 4);
  const remainingGallery = property.gallery.slice(4);
  const galleryForSection =
    remainingGallery.length > 0 ? remainingGallery : property.gallery;

  return (
    <div className="stack-lg">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">{property.name}</div>
            <div className="card-subtitle">{property.subtitle}</div>
          </div>
          <span className="badge badge-success">{property.priceLabel}</span>
        </div>

        {/* Top gallery layout inspired by Airbnb: one large image with four supporting photos */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              topGalleryImages.length > 0
                ? "minmax(0, 2fr) minmax(0, 1.5fr)"
                : "minmax(0, 1fr)",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <Image
              src={property.mainImage}
              alt={property.mainImageAlt}
              width={1200}
              height={700}
              style={{
                borderRadius: "1.25rem",
                width: "100%",
                height: "auto",
                objectFit: "cover",
              }}
            />
          </div>

          {topGalleryImages.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gridTemplateRows: "repeat(2, minmax(0, 1fr))",
                gap: "0.5rem",
              }}
            >
              {topGalleryImages.map((img) => (
                <Image
                  key={img.src}
                  src={img.src}
                  alt={img.label || property.name}
                  width={600}
                  height={400}
                  style={{
                    borderRadius: "0.9rem",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <p className="muted" style={{ marginBottom: "1.5rem" }}>
          {property.description}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.1fr)",
            gap: "1.5rem",
            alignItems: "flex-start",
          }}
        >
          <div className="stack-lg">
            {property.highlights && property.highlights.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Highlights</div>
                </div>
                <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: 14 }}>
                  {property.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <div className="card-title">Amenities</div>
              </div>
              <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: 14 }}>
                {SHARED_AMENITIES.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            {property.rateOptions && property.rateOptions.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Rates</div>
                </div>
                <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: 14 }}>
                  {property.rateOptions.map((rate) => (
                    <li key={rate.label}>
                      <strong>{rate.label}:</strong> {rate.price}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <div className="card-title">More photos</div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "0.9rem",
                }}
              >
                {galleryForSection.map((img) => (
                  <figure key={img.src} style={{ margin: 0 }}>
                    <Image
                      src={img.src}
                      alt={img.label || property.name}
                      width={480}
                      height={320}
                      style={{
                        borderRadius: "0.75rem",
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                      }}
                    />
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

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  Stay at {property.name}
                </div>
                <div className="card-subtitle">
                  From {property.priceLabel} &middot; Taxes and fees may apply.
                </div>
              </div>
            </div>
            <div className="hero-actions">
              <a href="/book" className="btn-primary">
                Start booking
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

