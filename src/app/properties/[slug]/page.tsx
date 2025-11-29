import { notFound } from "next/navigation";
import {
  PROPERTY_VARIANTS,
  SHARED_AMENITIES,
  getPropertyBySlug,
} from "@/lib/properties";
import { PropertyHeroGallery } from "./PropertyHeroGallery";

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

