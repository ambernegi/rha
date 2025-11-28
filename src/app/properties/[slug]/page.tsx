export default function PropertyPage({
    params,
  }: {
    params: { slug: string };
  }) {
    return (
      <div className="hero">
        <div className="hero-content">
          <h1>Property: {params.slug}</h1>
          <p>Property details page coming soon.</p>
        </div>
      </div>
    );
  }