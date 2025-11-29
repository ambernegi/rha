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

  const heroImages = property.gallery.slice(0, 5);
  const moreImages = property.gallery.slice(5);

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

        {/* Hero image layout similar to Airbnb: one large + supporting images */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              heroImages.length > 1
                ? "minmax(0, 2fr) minmax(0, 1.4fr)"
                : "minmax(0, 1fr)",
            gridTemplateRows: heroImages.length > 2 ? "repeat(2, 1fr)" : "1fr",
            gap: "0.5rem",
            marginTop: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          {heroImages.map((img, index) => (
            <div
              key={img.src}
              style={
                index === 0 && heroImages.length > 1
                  ? { gridRow: "1 / span 2" }
                  : {}
              }
            >
              <Image
                src={img.src}
                alt={img.label || property.name}
                width={index === 0 ? 1200 : 600}
                height={index === 0 ? 800 : 400}
                style={{
                  borderRadius: "0.9rem",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          ))}
        </div>

        {/* Main content layout: details left, booking card right */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.1fr)",
            gap: "1.75rem",
            alignItems: "flex-start",
          }}
        >
          <div className="stack-lg">
            <section>
              <h2
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  marginBottom: "0.35rem",
                }}
              >
                About this stay
              </h2>
              <p className="muted" style={{ margin: 0 }}>
                {property.description}
              </p>
            </section>

            {property.highlights && property.highlights.length > 0 && (
              <section>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginBottom: "0.35rem",
                  }}
                >
                  Highlights
                </h3>
                <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: 14 }}>
                  {property.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "0.35rem",
                }}
              >
                Amenities
              </h3>
              <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: 14 }}>
                {SHARED_AMENITIES.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            {property.rateOptions && property.rateOptions.length > 0 && (
              <section>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginBottom: "0.35rem",
                  }}
                >
                  Rates
                </h3>
                <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: 14 }}>
                  {property.rateOptions.map((rate) => (
                    <li key={rate.label}>
                      <strong>{rate.label}:</strong> {rate.price}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">{property.priceLabel}</div>
                <div className="card-subtitle">
                  per night · taxes extra · flexible configurations
                </div>
              </div>
            </div>
            <p className="muted" style={{ marginBottom: "0.9rem" }}>
              Pick your dates and group size on the next step to see the exact
              price and availability.
            </p>
            <div className="hero-actions">
              <a href="/book" className="btn-primary">
                Start booking
              </a>
            </div>
          </div>
        </div>

        {/* Additional photos section */}
        {moreImages.length > 0 && (
          <div style={{ marginTop: "1.75rem" }}>
            <div
              className="card-header"
              style={{ paddingLeft: 0, paddingRight: 0 }}
            >
              <div className="card-title">More photos</div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {moreImages.map((img) => (
                <figure key={img.src} style={{ margin: 0 }}>
                  <Image
                    src={img.src}
                    alt={img.label || property.name}
                    width={400}
                    height={260}
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
        )}
      </div>
    </div>
  );
}

