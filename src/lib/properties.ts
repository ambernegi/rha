export type GalleryImage = {
  src: string;
  label: string;
};

export type PropertyVariant = {
  slug: string;
  name: string;
  subtitle: string;
  priceLabel: string;
  description: string;
  mainImage: string;
  mainImageAlt: string;
  gallery: GalleryImage[];
  highlights?: string[];
  rateOptions?: { label: string; price: string }[];
  rules?: string[];
};

export const SHARED_AMENITIES = [
  "AC",
  "Geyser",
  "Mountain view",
  "Mussoorie view",
  "Jacuzzi",
  "BBQ bonfire (extra cost)",
  "Theater room",
  "Fully stocked kitchen",
  "Parking available",
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
      // Configuration-specific photos (common/outdoor photos live on the Home page gallery).
      { src: "/images/masterbedroom.avif", label: "Master bedroom" },
      { src: "/images/masterbedroom2.jpg", label: "Master bedroom – alternate view" },
      { src: "/images/bedroom2.jpg", label: "Bedroom 2" },
      { src: "/images/bedroom3.avif", label: "Bedroom 3" },
      { src: "/images/bedroom4.jpeg", label: "Bedroom 4" },
      { src: "/images/Gfloorbedroom.jpg", label: "Ground floor bedroom" },
      { src: "/images/kidsbedroom.jpg", label: "Kids bedroom" },
      { src: "/images/bathroom.avif", label: "Bathroom" },
      { src: "/images/bathroom2.jpg", label: "Bathroom with shower" },
      { src: "/images/bathroom4.jpg", label: "Bathroom vanity" },
      { src: "/images/washroomgfloor.avif", label: "Ground floor washroom" },
      { src: "/images/balcony.jpg", label: "Balcony" },
    ],
    highlights: [
      "Perfect for large families, multiple couples, or group getaways",
      "Private access to entire villa, lawn, and terrace",
      "Dedicated theater room, kids room, and multiple living areas",
      "Ideal for celebrations, offsites, and long weekends",
    ],
    rules: [
      "Family-friendly property – ideal for families and small groups",
      "No loud music outdoors after 10:00 pm",
      "Small get-togethers allowed; no large parties or events without prior approval",
      "No smoking inside the villa; smoking allowed only on balconies and terrace",
      "Please respect neighbors and keep common areas tidy",
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
      { src: "/images/masterbedroom.avif", label: "Master bedroom" },
      { src: "/images/bedroom2.jpg", label: "Bedroom 2" },
      { src: "/images/Gfloorbedroom.jpg", label: "Ground floor bedroom" },
    ],
    highlights: [
      "Three comfortable bedrooms including one on the ground floor",
      "Private wing feel while still part of the main villa",
      "Perfect for smaller families or close friends",
    ],
    rules: [
      "Best suited for families or a quiet group of friends",
      "No loud music outdoors after 10:00 pm",
      "No house parties; only registered guests are allowed to stay overnight",
      "No smoking inside rooms; balconies and terrace only",
    ],
  },
  {
    slug: "single-rooms",
    name: "Single Rooms in Villa",
    subtitle: "Cozy private rooms",
    priceLabel: "₹1,500 / night",
    description:
      "Comfortable individual rooms inside the villa, with access to the common living area and terrace — perfect for staycations and workcations, with special offers for stays of 5+ nights.",
    mainImage: "/images/bedroom3.avif",
    mainImageAlt: "Cozy bedroom with balcony and view",
    gallery: [
      // Configuration-specific photos (common/outdoor photos live on the Home page gallery).
      { src: "/images/bedroom3.avif", label: "Bedroom" },
      { src: "/images/bedroom4.jpeg", label: "Bedroom – alternate" },
      { src: "/images/bathroom.avif", label: "Bathroom" },
      { src: "/images/bathroom4.jpg", label: "Bathroom vanity" },
    ],
    highlights: [
      "Private rooms with access to shared living area and terrace",
      "Budget-friendly way to experience the villa",
      "Ideal for solo travellers, remote workers, or couples planning a longer stay",
    ],
    rateOptions: [
      { label: "Room with shared bathroom", price: "₹1,200 / night" },
      { label: "Room with attached bathroom", price: "₹1,500 / night" },
      { label: "Twin sharing (per person)", price: "₹1,500 / night" },
    ],
    rules: [
      "Family-friendly floor with shared common spaces",
      "Quiet hours from 10:00 pm to 7:00 am in shared areas",
      "No visitors after 10:00 pm without prior intimation",
      "No smoking inside rooms; terrace and open areas only",
    ],
  },
];

export function getPropertyBySlug(slug: string) {
  return PROPERTY_VARIANTS.find((p) => p.slug === slug);
}


