import { notFound } from "next/navigation";
import Link from "next/link";
import { SHARED_AMENITIES, getPropertyBySlug } from "@/lib/properties";
import { PropertyHeroGallery } from "./PropertyHeroGallery";

export default function PropertyPage({ params }: any) {
  const property = getPropertyBySlug(params?.slug);

  if (!property) {
    return notFound();
  }

  const bookingSlugByPropertySlug: Record<string, string> = {
    "entire-villa": "entire_villa",
    "3bhk-villa": "villa_3bhk",
    // The "Single Rooms" variant is a category; default to an attached-bathroom room config.
    "single-rooms": "attached_1",
  };

  const selectedConfigurationSlug =
    bookingSlugByPropertySlug[property.slug] ?? "entire_villa";

  const bookHref = `/book?configurationSlug=${encodeURIComponent(
    selectedConfigurationSlug,
  )}`;

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
      </div>

      <PropertyHeroGallery property={property} />

      <div className="card">
        <p className="muted" style={{ marginBottom: "1.25rem" }}>
          {property.description}
        </p>

        <div className="form-grid">
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

          {property.rules && property.rules.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">House rules</div>
              </div>
              <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: 14 }}>
                {property.rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          )}
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
          <Link
            href={bookHref}
            className="btn-primary"
          >
            Book Now
          </Link>
        </div>
      </div>

      <div className="property-sticky-cta">
        <div className="property-sticky-cta-inner">
          <div>
            <div className="booking-sticky-title">{property.name}</div>
            <div className="booking-sticky-subtitle">{property.priceLabel}</div>
          </div>
          <Link href={bookHref} className="btn-primary">
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}

