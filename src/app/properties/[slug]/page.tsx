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

        <div style={{ marginBottom: "1.25rem" }}>
          <Image
            src={property.mainImage}
            alt={property.mainImageAlt}
            width={1200}
            height={700}
            style={{ borderRadius: "1rem", width: "100%", height: "auto" }}
          />
        </div>

        <p className="muted" style={{ marginBottom: "1.25rem" }}>
          {property.description}
        </p>

        <div className="form-grid">
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

          <div className="card">
            <div className="card-header">
              <div className="card-title">Gallery</div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {property.gallery.map((src) => (
                <Image
                  key={src}
                  src={src}
                  alt={property.name}
                  width={400}
                  height={260}
                  style={{
                    borderRadius: "0.75rem",
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Ready to stay at {property.name}?</div>
            <div className="card-subtitle">
              Continue to the booking flow to pick your exact dates.
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
  );
}

