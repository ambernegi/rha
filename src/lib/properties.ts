export type PropertyVariant = {
  slug: string;
  name: string;
  subtitle: string;
  priceLabel: string;
  description: string;
  mainImage: string;
  mainImageAlt: string;
  gallery: string[];
  highlights?: string[];
  rateOptions?: { label: string; price: string }[];
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
      "/images/villa.avif",
      "/images/villa2.avif",
      "/images/lawn.avif",
      "/images/lawn2.avif",
      "/images/livingroom.avif",
      "/images/livingarea.avif",
      "/images/commonarea.avif",
      "/images/commonarea2.avif",
      "/images/masterbedroom.avif",
      "/images/masterbedroom2.jpg",
      "/images/bedroom2.jpg",
      "/images/bedroom3.avif",
      "/images/bedroom4.jpeg",
      "/images/Gfloorbedroom.jpg",
      "/images/kidsbedroom.jpg",
      "/images/bathroom.avif",
      "/images/bathroom2.jpg",
      "/images/bathroom4.jpg",
      "/images/washroomgfloor.avif",
      "/images/kitchen.avif",
      "/images/kitchen2.avif",
      "/images/kitchen3.avif",
      "/images/kitchen4.avif",
      "/images/kitchen5.avif",
      "/images/kitchen6.avif",
      "/images/terrace.avif",
      "/images/terrace2 .avif",
      "/images/terrace3.avif",
      "/images/Theaterroom.avif",
      "/images/theaterroom2.avif",
      "/images/bonfire.avif",
    ],
    highlights: [
      "Perfect for large families and groups",
      "Private access to entire villa, lawn, and terrace",
      "Dedicated theater room and multiple living areas",
      "Ideal for celebrations, offsites, and long weekends",
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
      "/images/masterbedroom.avif",
      "/images/bedroom2.jpg",
      "/images/Gfloorbedroom.jpg",
    ],
    highlights: [
      "Three comfortable bedrooms including one on the ground floor",
      "Private space while still part of the main villa",
      "Great for smaller families or groups of friends",
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
    highlights: [
      "Private rooms with access to shared living and terrace",
      "Budget-friendly way to experience the villa",
      "Ideal for solo travellers or couples",
    ],
    rateOptions: [
      { label: "Room with shared bathroom", price: "₹1,200 / night" },
      { label: "Room with attached bathroom", price: "₹1,500 / night" },
      { label: "Twin sharing (per person)", price: "₹1,500 / night" },
    ],
  },
];

export function getPropertyBySlug(slug: string) {
  return PROPERTY_VARIANTS.find((p) => p.slug === slug);
}


