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
            <li>Ocean-view master suite and thoughtfully curated interiors</li>
            <li>Flexible stays: entire villa, 3BHK, or private rooms</li>
            <li>Instant Google login and streamlined booking experience</li>
          </ul>
          <div
            className="card-subtitle"
            style={{ marginTop: "0.9rem", fontSize: "0.85rem" }}
          >
            <strong>Close to everything, away from the noise</strong>
            <br />
            Pacific Mall – 5 km · Mussoorie Road – 6 km · Rajpur Road – 1.5 km
          </div>
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
                  style={{
                    borderRadius: "0.9rem",
                    width: "100%",
                    height: "auto",
                  }}
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


