import Link from "next/link";
import Image from "next/image";
import { PROPERTY_VARIANTS } from "@/lib/properties";
import { COMMON_GALLERY } from "@/lib/commonGallery";
import { GalleryLightbox } from "@/components/GalleryLightbox";

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
            <Link href="/properties/entire-villa" className="btn-primary">
              View stays
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              View my bookings
            </Link>
          </div>
        </div>
        <div className="hero-card">
          <h2>Why stay at RHA Villa?</h2>
          <ul>
            <li>Flexible configurations: entire villa, 3BHK, or private rooms</li>
            <li>Thoughtfully designed spaces for families, friends, and remote work</li>
          </ul>
          <div
            className="card-subtitle"
            style={{ marginTop: "0.9rem", fontSize: "0.85rem" }}
          >
            <strong>Perfect Rajpur–Mussoorie location</strong>
            <br />
            1.5 km from Rajpur Road cafés & restaurants · 5 km from Pacific Mall ·
            6 km from Mussoorie Road, the gateway to the hills.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Common spaces</div>
            <div className="card-subtitle">
              Outdoors and shared areas — tap to view full-size photos.
            </div>
          </div>
          <span className="badge">Gallery</span>
        </div>
        <GalleryLightbox title="RHA Villa — Common spaces" images={COMMON_GALLERY} />
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
            <Link
              key={property.slug}
              href={`/properties/${property.slug}`}
              className="card card-link"
            >
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
              <span className="btn-secondary" style={{ width: "fit-content" }}>
                View details
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


