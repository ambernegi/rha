import Link from "next/link";
import Image from "next/image";
import { PROPERTY_VARIANTS } from "@/lib/properties";

export default function Home() {
  return (
    <div className="stack-lg">
      <div className="hero">
        <div className="hero-content">
          <h1>Escape to your private villa retreat</h1>
          <p>
            Seamlessly book the entire villa or individual rooms with live
            availability and instant confirmation.
          </p>
          <div className="hero-actions">
            <Link href="/book" className="btn-primary">
              Book now
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              View my bookings
            </Link>
          </div>
        </div>
        <div className="hero-card">
          <h2>Why stay at RHA Villa?</h2>
          <ul>
            <li>Ocean-view master suite and curated interiors</li>
            <li>Flexible stays: entire villa or private rooms</li>
            <li>Instant Google login and secure payments (mock)</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Stay options</div>
            <div className="card-subtitle">
              Explore the three configurations of RHA Villa and pick your
              perfect stay.
            </div>
          </div>
        </div>

        <div className="form-grid">
          {PROPERTY_VARIANTS.map((property) => (
            <div key={property.slug} className="card">
              <div style={{ marginBottom: "0.75rem" }}>
                <Image
                  src={property.mainImage}
                  alt={property.mainImageAlt}
                  width={800}
                  height={500}
                  style={{ borderRadius: "0.9rem", width: "100%", height: "auto" }}
                />
              </div>
              <div className="card-header">
                <div>
                  <div className="card-title">{property.name}</div>
                  <div className="card-subtitle">{property.subtitle}</div>
                </div>
                <span className="badge badge-success">
                  {property.priceLabel}
                </span>
              </div>
              <p className="muted" style={{ marginBottom: "0.75rem" }}>
                {property.description}
              </p>
              <Link
                href={`/properties/${property.slug}`}
                className="btn-secondary"
              >
                View details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}