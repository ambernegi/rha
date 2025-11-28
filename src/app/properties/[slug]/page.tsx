import Image from "next/image";

const AMENITIES = [
  "AC",
  "Geyser",
  "Mussoorie view",
  "Jacuzzi",
  "BBQ bonfire (extra cost)",
  "Theater room",
  "Fully stocked kitchen",
];

const PROPERTIES = [
  {
    name: "Entire Villa",
    subtitle: "Exclusive stay for your group",
    price: "₹15,000 / night",
    description:
      "Book the full villa for complete privacy and comfort, perfect for families or groups.",
    imageSrc: "/images/villa.avif",
    imageAlt: "Exterior view of the villa with lawn and mountain backdrop",
  },
  {
    name: "3BHK in Villa",
    subtitle: "Private 3-bedroom unit",
    price: "₹8,000 / night",
    description:
      "Spacious 3BHK within the villa, ideal for smaller groups who still want a villa experience.",
    imageSrc: "/images/livingroom.avif",
    imageAlt: "Warm living room area of the villa",
  },
  {
    name: "Single Rooms in Villa",
    subtitle: "Cozy private rooms",
    price: "Contact us for pricing",
    description:
      "Comfortable individual rooms inside the villa, with access to the common living area and terrace.",
    imageSrc: "/images/bedroom3.avif",
    imageAlt: "Cozy bedroom with balcony and view",
  },
];

export default function PropertyPage() {
  return (
    <div className="stack-lg">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Stay options at RHA Villa</div>
            <div className="card-subtitle">
              Choose the configuration that best fits your group and budget.
            </div>
          </div>
        </div>

        <div className="form-grid">
          {PROPERTIES.map((property) => (
            <div key={property.name} className="card">
              <div style={{ marginBottom: "0.75rem" }}>
                <Image
                  src={property.imageSrc}
                  alt={property.imageAlt}
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
                <span className="badge badge-success">{property.price}</span>
              </div>
              <p className="muted" style={{ marginBottom: "0.75rem" }}>
                {property.description}
              </p>
              <div>
                <div
                  className="card-subtitle"
                  style={{ marginBottom: "0.4rem" }}
                >
                  Amenities
                </div>
                <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: 14 }}>
                  {AMENITIES.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

