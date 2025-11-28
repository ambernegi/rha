import Link from "next/link";

export default function Home() {
  return (
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
  );
}


