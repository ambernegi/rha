import Link from "next/link";
import Image from "next/image";

const PHOTOS = [
  "/villa-1.jpg",
  "/villa-2.jpg",
  "/villa-3.jpg",
  "/villa-4.jpg",
];

export default function Home() {
  return (
    <div className="listing-page">
      <section className="listing-header">
        <div>
          <h1 className="listing-title">RHA Villa · Oceanfront luxury retreat</h1>
          <div className="listing-meta">
            <span>★ 4.9 · 8 reviews</span>
            <span>·</span>
            <span>Entire villa · 4 bedrooms · 8 guests</span>
            <span>·</span>
            <span>Goa, India</span>
          </div>
        </div>
      </section>

      <section className="listing-gallery">
        <div className="listing-gallery-main">
          <Image
            src={PHOTOS[0]}
            alt="RHA Villa main view"
            fill
            sizes="(min-width: 1024px) 900px, 100vw"
            className="listing-gallery-image"
            priority
          />
        </div>
        <div className="listing-gallery-grid">
          {PHOTOS.slice(1).map((src, idx) => (
            <div key={src} className="listing-gallery-item">
              <Image
                src={src}
                alt={`RHA Villa photo ${idx + 2}`}
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
              <h2>Entire villa hosted by Amber</h2>
              <p>4 bedrooms · 5 beds · 4.5 bathrooms · Up to 8 guests</p>
            </div>
            <div className="listing-host-avatar">A</div>
          </div>

          <div className="listing-highlights">
            <div>
              <h3>Oceanfront infinity pool</h3>
              <p>Swim with uninterrupted views over the Arabian Sea.</p>
            </div>
            <div>
              <h3>Curated interiors</h3>
              <p>Design-forward spaces with warm wood, stone and soft light.</p>
            </div>
            <div>
              <h3>Chef & concierge</h3>
              <p>In-villa breakfast, housekeeping and on-call concierge.</p>
            </div>
          </div>

          <div className="listing-section">
            <h3 className="listing-section-title">About this place</h3>
            <p>
              Wake up to panoramic ocean views, coffee on the terrace, and long
              evenings around the pool. RHA Villa is designed for slow stays —
              with generous common spaces, private ensuite bedrooms and thoughtful
              details throughout.
            </p>
            <p>
              Whether you book the entire villa or just a room, availability and
              pricing are always live. Sign in with Google, pick your dates, and
              confirm in a few clicks.
            </p>
          </div>

          <div className="listing-section">
            <h3 className="listing-section-title">What this place offers</h3>
            <div className="listing-amenities">
              <span>Infinity pool</span>
              <span>High-speed Wi‑Fi</span>
              <span>Air conditioning</span>
              <span>Fully equipped kitchen</span>
              <span>Daily housekeeping</span>
              <span>On-site parking</span>
              <span>Ocean-view terrace</span>
              <span>Generator backup</span>
            </div>
          </div>
        </div>

        <aside className="listing-column-booking">
          <div className="listing-booking-card">
            <div className="listing-booking-header">
              <div>
                <div className="listing-price">₹45,000</div>
                <div className="listing-price-sub">night · entire villa</div>
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
