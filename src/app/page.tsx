import Link from "next/link";
import Image from "next/image";

const properties = [
  {
    slug: "3bhk-suite",
    name: "3 BHK in a Villa",
    headline: "3 BHK with private jacuzzi & sunset views",
    location: "Dehradun, India",
    details: "3 bedrooms · 3 beds · 2.5 bathrooms · Up to 6 guests",
    price: "₹18,000",
    badge: "Popular for small groups",
    amenities: ["Jacuzzi", "Barbeque", "Bonfire", "High-speed Wi‑Fi"],
    image: "/images/livingroom.avif",
  },
  {
    slug: "entire-villa",
    name: "Entire Villa · 5 Bedrooms",
    headline: "Entire hillside villa with theater room & lawn",
    location: "Dehradun, India",
    details: "5 bedrooms · 6 beds · 4.5 bathrooms · Up to 10 guests",
    price: "₹32,000",
    badge: "Best for families & groups",
    amenities: [
      "Jacuzzi",
      "Barbeque",
      "Bonfire",
      "High-speed Wi‑Fi",
      "Theater room",
      "Small lawn",
      "Balconies in all bedrooms",
    ],
    image: "/images/villa2.avif",
  },
];

export default function Home() {
  return (
    <div className="stack-lg">
      <header className="hero">
        <div className="hero-content">
          <h1>RHA Villa · Hillside escapes in Dehradun</h1>
          <p>
            Choose between a cosy 3 BHK in a villa or book the entire 5-bedroom
            hillside home — both with bonfire evenings, barbeques, and Mussoorie
            sunset views.
          </p>
          <div className="hero-actions">
            <Link href="/book" className="btn-primary">
              Quick book
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              View my bookings
            </Link>
          </div>
        </div>
        <div className="hero-card">
          <h2>Stay options at RHA Villa</h2>
          <ul>
            <li>3 BHK in a villa with private jacuzzi</li>
            <li>Entire 5-bedroom villa with theater room & lawn</li>
            <li>High-speed Wi‑Fi, barbeque, bonfire & sunset views</li>
          </ul>
        </div>
      </header>

      <section className="property-grid">
        {properties.map((p) => (
          <Link
            key={p.slug}
            href={`/properties/${p.slug}`}
            className="property-card"
          >
            <div className="property-card-image">
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(min-width: 768px) 420px, 100vw"
              />
            </div>
            <div className="property-card-body">
              <div className="property-card-header">
                <div>
                  <h3>{p.name}</h3>
                  <p className="property-location">{p.location}</p>
                </div>
                <span className="badge badge-success">★ 4.9</span>
              </div>
              <p className="property-headline">{p.headline}</p>
              <p className="property-details">{p.details}</p>
              <div className="property-amenities">
                {p.amenities.slice(0, 4).map((a) => (
                  <span key={a}>{a}</span>
                ))}
              </div>
              <div className="property-card-footer">
                <div>
                  <div className="property-price">{p.price}</div>
                  <div className="property-price-sub">per night</div>
                </div>
                <span className="badge">{p.badge}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
