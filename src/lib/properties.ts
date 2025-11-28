export type PropertyVariant = {
  slug: string;
  name: string;
  subtitle: string;
  priceLabel: string;
  description: string;
  mainImage: string;
  mainImageAlt: string;
  gallery: string[];
};

export const SHARED_AMENITIES = [
  "AC",
  "Geyser",
  "Mussoorie view",
  "Jacuzzi",
  "BBQ bonfire (extra cost)",
  "Theater room",
  "Fully stocked kitchen",
];

export const PROPERTY_VARIANTS: PropertyVariant[] = [
  {
    slug: "entire-villa",
    name: "Entire Villa",
    subtitle: "Exclusive stay for your group",
    priceLabel: "₹15,000 / night",
    description:
      "Book the full villa for complete privacy and comfort, perfect for families or groups.",
    mainImage: "/images/villa.avif",
    mainImageAlt: "Exterior view of the villa with lawn and mountain backdrop",
    gallery: [
      "/images/livingroom.avif",
      "/images/lawn.avif",
      "/images/terrace.avif",
      "/images/masterbedroom.avif",
    ],
  },
  {
    slug: "3bhk-villa",
    name: "3BHK in Villa",
    subtitle: "Private 3-bedroom unit",
    priceLabel: "₹8,000 / night",
    description:
      "Spacious 3BHK within the villa, ideal for smaller groups who still want a villa experience.",
    mainImage: "/images/masterbedroom.avif",
    mainImageAlt: "Master bedroom with warm lighting and mountain views",
    gallery: [
      "/images/livingarea.avif",
      "/images/balcony.jpg",
      "/images/bathroom2.jpg",
    ],
  },
  {
    slug: "single-rooms",
    name: "Single Rooms in Villa",
    subtitle: "Cozy private rooms",
    priceLabel: "Contact us for pricing",
    description:
      "Comfortable individual rooms inside the villa, with access to the common living area and terrace.",
    mainImage: "/images/bedroom3.avif",
    mainImageAlt: "Cozy bedroom with balcony and view",
    gallery: [
      "/images/commonarea.avif",
      "/images/terrace2 .avif",
      "/images/Theaterroom.avif",
    ],
  },
];

export function getPropertyBySlug(slug: string) {
  return PROPERTY_VARIANTS.find((p) => p.slug === slug);
}


