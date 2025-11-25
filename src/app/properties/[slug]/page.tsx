import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const PROPERTY_CONFIG = {
  "3bhk-suite": {
    title: "3 BHK in a Villa · Dehradun",
    meta: "3 bedrooms · 3 beds · 2.5 bathrooms · Up to 6 guests",
    location: "Dehradun, India",
    price: "₹18,000",
    priceSub: "night · 3 BHK in villa",
    hostTitle: "3 BHK hosted by Amber",
    hostDetails: "3 bedrooms · 3 beds · 2.5 bathrooms · Up to 6 guests",
    highlights: [
      {
        title: "Private jacuzzi",
        body: "Unwind after a day of exploring with a warm soak overlooking the hills.",
      },
      {
        title: "Bonfire & barbeque",
        body: "Evening bonfires with a dedicated barbeque setup for your group.",
      },
      {
        title: "Mussoorie & sunset views",
        body: "Watch the sun dip behind the Mussoorie range from your balcony.",
      },
    ],
    amenities: [
      "Jacuzzi",
      "Barbeque",
      "Bonfire",
      "High-speed Wi‑Fi",
      "Mussoorie view",
      "Sunset view",
      "Balconies in bedrooms",
    ],
  },
  "entire-villa": {
    title: "Entire 5 Bedroom Villa · Dehradun",
    meta: "5 bedrooms · 6 beds · 4.5 bathrooms · Up to 10 guests",
    location: "Dehradun, India",
    price: "₹32,000",
    priceSub: "night · entire villa",
    hostTitle: "Entire villa hosted by Amber",
    hostDetails: "5 bedrooms · 6 beds · 4.5 bathrooms · Up to 10 guests",
    highlights: [
      {
        title: "Theater room",
        body: "Private movie nights with your group in a cosy theater-style room.",
      },
      {
        title: "Small lawn & bonfire",
        body: "Lawn gatherings, games and fireside conversations under the stars.",
      },
      {
        title: "Balconies in all bedrooms",
        body: "Every bedroom opens up to its own balcony with hillside views.",
      },
    ],
    amenities: [
      "Jacuzzi",
      "Barbeque",
      "Bonfire",
      "High-speed Wi‑Fi",
      "Mussoorie view",
      "Sunset view",
      "Theater room",
      "Small lawn",
      "Balconies in all bedrooms",
    ],
  },
} as const;

type PropertySlug = keyof typeof PROPERTY_CONFIG;

const PHOTOS_BY_PROPERTY: Record<PropertySlug, string[]> = {
  "3bhk-suite": [
    "/images/Gfloorbedroom.jpg",
    "/images/bedroom2.jpg",
    "/images/kidsbedroom.jpg",
    "/images/bathroom2.jpg",
  ],
  "entire-villa": [
    "/images/masterbedroom2.jpg",
    "/images/bedroom4.jpeg",
    "/images/Theaterroom.avif",
    "/images/lawn2.avif",
  ],
};

export default function PropertyPage({ params }: { params: any }) {
  const slug = params.slug as PropertySlug;
  const config = PROPERTY_CONFIG[slug];

  if (!config) {
    return notFound();
  }

  const photos = PHOTOS_BY_PROPERTY[slug] ?? PHOTOS_BY_PROPERTY["3bhk-suite"];

  return (
    <div className="listing-page">
      <section className="listing-header">
        <div>
          <h1 className="listing-title">{config.title}</h1>
          <div className="listing-meta">
            <span>★ 4.9 · 8 reviews</span>
            <span>·</span>
            <span>{config.meta}</span>
            <span>·</span>
            <span>{config.location}</span>
          </div>
        </div>
      </section>

      <section className="listing-gallery">
        <div className="listing-gallery-main">
          <Image
            src={photos[0]}
            alt={config.title}
            fill
            sizes="(min-width: 1024px) 900px, 100vw"
            className="listing-gallery-image"
            priority
          />
        </div>
        <div className="listing-gallery-grid">
          {photos.slice(1).map((src, idx) => (
            <div key={src} className="listing-gallery-item">
              <Image
                src={src}
                alt={`${config.title} photo ${idx + 2}`}
                fill
                sizes="(min-width: 1024px) 300px, 33vw"
                className="listing-gallery-image"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="listing-layout">
        <div className="listing-column-main">
          <div className="listing-host">
            <div>
              <h2>{config.hostTitle}</h2>
              <p>{config.hostDetails}</p>
            </div>
            <div className="listing-host-avatar">A</div>
          </div>

          <div className="listing-highlights">
            {config.highlights.map((h) => (
              <div key={h.title}>
                <h3>{h.title}</h3>
                <p>{h.body}</p>
              </div>
            ))}
          </div>

          <div className="listing-section">
            <h3 className="listing-section-title">About this place</h3>
            <p>
              Wake up to cool Dehradun mornings, Mussoorie ridgeline views and
              slow coffee on the balcony. Evenings are for bonfires, barbeques and
              long conversations under clear skies.
            </p>
            <p>
              Modern living room equipped with a 3-seater sofa, 4-seater dining
              table, a center table and a 65 inch smart TV – perfect for both
              relaxed conversations and movie nights.
            </p>
            <p>
              A fully well-equipped kitchen with premium amenities like a double
              door fridge, microwave, smart chimney, aquaguard, hob and cooking
              essentials like cutleries, pans, cookers, mixer & more. The caretaker
              can also act as a chef for your culinary needs (chargeable), so you
              can focus on your stay.
            </p>
            <p>
              Master bedroom for the Kings and the Queens, taking you back to the
              Victorian era – with an ensuite bathroom, walk-in wardrobe, hot and
              cold AC and a smart TV.
            </p>
            <p>All rooms have an AC so you stay comfortable year‑round.</p>
            <p>
              Sign in with Google, pick your dates, and confirm your stay in a
              few clicks. Our calendar is live and synced with all bookings.
            </p>
          </div>

          <div className="listing-section">
            <h3 className="listing-section-title">What this place offers</h3>
            <div className="listing-amenities">
              {config.amenities.map((a) => (
                <span key={a}>{a}</span>
              ))}
            </div>
          </div>
        </div>

        <aside className="listing-column-booking">
          <div className="listing-booking-card">
            <div className="listing-booking-header">
              <div>
                <div className="listing-price">{config.price}</div>
                <div className="listing-price-sub">{config.priceSub}</div>
              </div>
              <div className="listing-rating">★ 4.9</div>
            </div>

            <div className="listing-booking-cta">
              <Link href="/book" className="btn-primary listing-book-button">
                Check availability
              </Link>
              <p className="listing-booking-note">
                Live calendar · instant confirmation · secure Google sign‑in
              </p>
            </div>

            <div className="listing-booking-footer">
              <Link href="/dashboard">Already booked? View your stays →</Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}


