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
      { src: "/images/villa.avif", label: "Villa exterior" },
      { src: "/images/villa2.avif", label: "Villa facade" },
      { src: "/images/lawn.avif", label: "Lawn and garden" },
      { src: "/images/lawn2.avif", label: "Lawn with mountain views" },
      { src: "/images/livingroom.avif", label: "Main living room" },
      { src: "/images/livingarea.avif", label: "Cozy living area" },
      { src: "/images/commonarea.avif", label: "Common lounge" },
      { src: "/images/commonarea2.avif", label: "Common seating area" },
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
      { src: "/images/kitchen.avif", label: "Kitchen" },
      { src: "/images/kitchen2.avif", label: "Kitchen counter" },
      { src: "/images/kitchen3.avif", label: "Kitchen appliances" },
      { src: "/images/kitchen4.avif", label: "Kitchen and dining" },
      { src: "/images/kitchen5.avif", label: "Pantry and storage" },
      { src: "/images/kitchen6.avif", label: "Fully stocked kitchen" },
      { src: "/images/terrace.avif", label: "Terrace seating" },
      { src: "/images/terrace2 .avif", label: "Terrace with valley views" },
      { src: "/images/terrace3.avif", label: "Terrace at sunset" },
      { src: "/images/Theaterroom.avif", label: "Theater room" },
      { src: "/images/theaterroom2.avif", label: "Theater seating" },
      { src: "/images/bonfire.avif", label: "Bonfire setup" },
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
      { src: "/images/masterbedroom.avif", label: "Master bedroom" },
      { src: "/images/bedroom2.jpg", label: "Bedroom 2" },
      { src: "/images/Gfloorbedroom.jpg", label: "Ground floor bedroom" },
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
    priceLabel: "₹1,500 / night",
    description:
      "Comfortable individual rooms inside the villa, with access to the common living area and terrace.",
    mainImage: "/images/bedroom3.avif",
    mainImageAlt: "Cozy bedroom with balcony and view",
    gallery: [
      { src: "/images/commonarea.avif", label: "Common living area" },
      { src: "/images/terrace2 .avif", label: "Shared terrace" },
      { src: "/images/Theaterroom.avif", label: "Shared theater room" },
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


