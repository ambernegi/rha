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
          <li>Ocean-view master suite and curated interiors</li>
          <li>Flexible stays: entire villa or private rooms</li>
          <li>Instant Google login and secure payments (mock)</li>
        </ul>
      </div>
    </div>
  );
}

