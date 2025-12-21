/**
 * Mock Property Data
 * Comprehensive dummy data for development and testing
 * Properties across Ghana: Accra, Kumasi, Tamale, Takoradi, Cape Coast, etc.
 */

import { Property } from "@/components/PropertyCard";

// Extended Property interface with coordinates and additional fields
export interface MapProperty extends Property {
  latitude: number;
  longitude: number;
  images?: string[];
  propertyType?: "house" | "apartment" | "land" | "commercial";
  transactionType?: "buy" | "rent";
}

export interface DetailedProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  plotSize?: number;
  description: string;
  amenities: string[];
  latitude: number;
  longitude: number;
  address: string;
  negotiable?: boolean;
  owner: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    memberSince: string;
    phone?: string;
  };
  transactionType: "buy" | "rent";
  propertyType?: "house" | "apartment" | "land" | "commercial";
  yearBuilt?: number;
  propertySize?: number;
  listedDate?: string;
  propertyId?: string;
  features?: {
    furnished?: boolean;
    airConditioning?: boolean;
    heating?: boolean;
    balcony?: boolean;
    garden?: boolean;
    garage?: boolean;
    elevator?: boolean;
    swimmingPool?: boolean;
  };
}

// Comprehensive property data across Ghana
export const ALL_PROPERTIES: Property[] = [
  // Accra Properties
  {
    id: "1",
    title: "4 Bedroom House in East Legon",
    location: "East Legon, Accra",
    price: 850000,
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=500&fit=crop",
    bedrooms: 4,
    bathrooms: 3,
    isSaved: false,
  },
  {
    id: "2",
    title: "Modern 3 Bedroom Apartment",
    location: "Airport Residential, Accra",
    price: 650000,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=500&fit=crop",
    bedrooms: 3,
    bathrooms: 2,
    isSaved: true,
  },
  {
    id: "3",
    title: "Luxury Villa with Pool",
    location: "Labone, Accra",
    price: 1200000,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=500&fit=crop",
    bedrooms: 5,
    bathrooms: 4,
    isSaved: false,
  },
  {
    id: "4",
    title: "2 Bedroom House for Rent",
    location: "Cantonments, Accra",
    price: 3500,
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=300&h=300&fit=crop",
    bedrooms: 2,
    bathrooms: 1,
    isSaved: false,
  },
  {
    id: "5",
    title: "Spacious 3 Bedroom Apartment",
    location: "Osu, Accra",
    price: 4500,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=300&h=300&fit=crop",
    bedrooms: 3,
    bathrooms: 2,
    isSaved: true,
  },
  {
    id: "6",
    title: "Cozy 1 Bedroom Studio",
    location: "Adabraka, Accra",
    price: 2000,
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=300&h=300&fit=crop",
    bedrooms: 1,
    bathrooms: 1,
    isSaved: false,
  },
  {
    id: "7",
    title: "Modern 2 Bedroom Apartment",
    location: "Teshie, Accra",
    price: 2800,
    image:
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=300&h=300&fit=crop",
    bedrooms: 2,
    bathrooms: 2,
    isSaved: false,
  },
  {
    id: "8",
    title: "Luxury 4 Bedroom Duplex",
    location: "Spintex, Accra",
    price: 1200000,
    image:
      "https://images.unsplash.com/photo-1600585154084-4c5f0ea33f38?w=300&h=300&fit=crop",
    bedrooms: 4,
    bathrooms: 3,
    isSaved: false,
  },
  {
    id: "9",
    title: "Affordable 1 Bedroom Flat",
    location: "Madina, Accra",
    price: 1800,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=300&fit=crop",
    bedrooms: 1,
    bathrooms: 1,
    isSaved: false,
  },
  {
    id: "10",
    title: "Executive 5 Bedroom Mansion",
    location: "Roman Ridge, Accra",
    price: 2500000,
    image:
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&h=500&fit=crop",
    bedrooms: 5,
    bathrooms: 5,
    isSaved: false,
  },
  // Kumasi Properties
  {
    id: "11",
    title: "3 Bedroom House in Asokwa",
    location: "Asokwa, Kumasi",
    price: 450000,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=500&fit=crop",
    bedrooms: 3,
    bathrooms: 2,
    isSaved: false,
  },
  {
    id: "12",
    title: "2 Bedroom Apartment for Rent",
    location: "Ahodwo, Kumasi",
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=300&h=300&fit=crop",
    bedrooms: 2,
    bathrooms: 1,
    isSaved: false,
  },
  {
    id: "13",
    title: "4 Bedroom Family Home",
    location: "Patasi, Kumasi",
    price: 680000,
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=500&fit=crop",
    bedrooms: 4,
    bathrooms: 3,
    isSaved: false,
  },
  {
    id: "14",
    title: "Commercial Space for Rent",
    location: "Adum, Kumasi",
    price: 5000,
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=500&fit=crop",
    bedrooms: 0,
    bathrooms: 2,
    isSaved: false,
  },
  // Tamale Properties
  {
    id: "15",
    title: "3 Bedroom House",
    location: "Lamashegu, Tamale",
    price: 320000,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=500&fit=crop",
    bedrooms: 3,
    bathrooms: 2,
    isSaved: false,
  },
  {
    id: "16",
    title: "2 Bedroom Apartment",
    location: "Kalpohin, Tamale",
    price: 1800,
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=300&h=300&fit=crop",
    bedrooms: 2,
    bathrooms: 1,
    isSaved: false,
  },
  // Takoradi Properties
  {
    id: "17",
    title: "Beachfront 4 Bedroom Villa",
    location: "Beach Road, Takoradi",
    price: 950000,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=500&fit=crop",
    bedrooms: 4,
    bathrooms: 3,
    isSaved: false,
  },
  {
    id: "18",
    title: "3 Bedroom House",
    location: "Fijai, Takoradi",
    price: 420000,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=500&fit=crop",
    bedrooms: 3,
    bathrooms: 2,
    isSaved: false,
  },
  // Cape Coast Properties
  {
    id: "19",
    title: "Historic 3 Bedroom House",
    location: "University Area, Cape Coast",
    price: 380000,
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=500&fit=crop",
    bedrooms: 3,
    bathrooms: 2,
    isSaved: false,
  },
  {
    id: "20",
    title: "2 Bedroom Apartment",
    location: "Kotokuraba, Cape Coast",
    price: 2200,
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=300&h=300&fit=crop",
    bedrooms: 2,
    bathrooms: 1,
    isSaved: false,
  },
  // Sunyani Properties
  {
    id: "21",
    title: "3 Bedroom House",
    location: "New Town, Sunyani",
    price: 350000,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=500&fit=crop",
    bedrooms: 3,
    bathrooms: 2,
    isSaved: false,
  },
  // Koforidua Properties
  {
    id: "22",
    title: "2 Bedroom House",
    location: "Effiduase, Koforidua",
    price: 280000,
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=300&h=300&fit=crop",
    bedrooms: 2,
    bathrooms: 1,
    isSaved: false,
  },
  // Ho Properties
  {
    id: "23",
    title: "3 Bedroom Apartment",
    location: "Ho Central, Ho",
    price: 300000,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=500&fit=crop",
    bedrooms: 3,
    bathrooms: 2,
    isSaved: false,
  },
  // Bolgatanga Properties
  {
    id: "24",
    title: "2 Bedroom House",
    location: "Zuarungu, Bolgatanga",
    price: 250000,
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=300&h=300&fit=crop",
    bedrooms: 2,
    bathrooms: 1,
    isSaved: false,
  },
  // Wa Properties
  {
    id: "25",
    title: "3 Bedroom House",
    location: "Wa Central, Wa",
    price: 290000,
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=500&fit=crop",
    bedrooms: 3,
    bathrooms: 2,
    isSaved: false,
  },
];

// Map properties with coordinates
export const MAP_PROPERTIES: MapProperty[] = [
  // Accra
  {
    id: "1",
    title: "4 Bedroom House in East Legon",
    location: "East Legon, Accra",
    price: 850000,
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=500&fit=crop",
    bedrooms: 4,
    bathrooms: 3,
    isSaved: false,
    latitude: 5.6037,
    longitude: -0.187,
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=500&fit=crop",
    ],
    propertyType: "house",
    transactionType: "buy",
  },
  {
    id: "2",
    title: "Modern 3 Bedroom Apartment",
    location: "Airport Residential, Accra",
    price: 650000,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=500&fit=crop",
    bedrooms: 3,
    bathrooms: 2,
    isSaved: true,
    latitude: 5.6147,
    longitude: -0.1756,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=500&fit=crop",
    ],
    propertyType: "apartment",
    transactionType: "buy",
  },
  {
    id: "3",
    title: "Luxury Villa with Pool",
    location: "Labone, Accra",
    price: 1200000,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=500&fit=crop",
    bedrooms: 5,
    bathrooms: 4,
    isSaved: false,
    latitude: 5.5556,
    longitude: -0.1969,
    propertyType: "house",
    transactionType: "buy",
  },
  {
    id: "4",
    title: "2 Bedroom House for Rent",
    location: "Cantonments, Accra",
    price: 3500,
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=300&h=300&fit=crop",
    bedrooms: 2,
    bathrooms: 1,
    isSaved: false,
    latitude: 5.5667,
    longitude: -0.1833,
    propertyType: "house",
    transactionType: "rent",
  },
  {
    id: "5",
    title: "Spacious 3 Bedroom Apartment",
    location: "Osu, Accra",
    price: 4500,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=300&h=300&fit=crop",
    bedrooms: 3,
    bathrooms: 2,
    isSaved: true,
    latitude: 5.55,
    longitude: -0.1667,
    propertyType: "apartment",
    transactionType: "rent",
  },
  {
    id: "6",
    title: "Cozy 1 Bedroom Studio",
    location: "Adabraka, Accra",
    price: 2000,
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=300&h=300&fit=crop",
    bedrooms: 1,
    bathrooms: 1,
    isSaved: false,
    latitude: 5.55,
    longitude: -0.2,
    propertyType: "apartment",
    transactionType: "rent",
  },
  {
    id: "7",
    title: "Modern 2 Bedroom Apartment",
    location: "Teshie, Accra",
    price: 2800,
    image:
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=300&h=300&fit=crop",
    bedrooms: 2,
    bathrooms: 2,
    isSaved: false,
    latitude: 5.5833,
    longitude: -0.0667,
    propertyType: "apartment",
    transactionType: "rent",
  },
  {
    id: "8",
    title: "Luxury 4 Bedroom Duplex",
    location: "Spintex, Accra",
    price: 1200000,
    image:
      "https://images.unsplash.com/photo-1600585154084-4c5f0ea33f38?w=300&h=300&fit=crop",
    bedrooms: 4,
    bathrooms: 3,
    isSaved: false,
    latitude: 5.6167,
    longitude: -0.1167,
    propertyType: "house",
    transactionType: "buy",
  },
  // Kumasi
  {
    id: "11",
    title: "3 Bedroom House in Asokwa",
    location: "Asokwa, Kumasi",
    price: 450000,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=500&fit=crop",
    bedrooms: 3,
    bathrooms: 2,
    isSaved: false,
    latitude: 6.6885,
    longitude: -1.6244,
    propertyType: "house",
    transactionType: "buy",
  },
  {
    id: "12",
    title: "2 Bedroom Apartment for Rent",
    location: "Ahodwo, Kumasi",
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=300&h=300&fit=crop",
    bedrooms: 2,
    bathrooms: 1,
    isSaved: false,
    latitude: 6.7,
    longitude: -1.6167,
    propertyType: "apartment",
    transactionType: "rent",
  },
  // Tamale
  {
    id: "15",
    title: "3 Bedroom House",
    location: "Lamashegu, Tamale",
    price: 320000,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=500&fit=crop",
    bedrooms: 3,
    bathrooms: 2,
    isSaved: false,
    latitude: 9.4075,
    longitude: -0.8397,
    propertyType: "house",
    transactionType: "buy",
  },
  // Takoradi
  {
    id: "17",
    title: "Beachfront 4 Bedroom Villa",
    location: "Beach Road, Takoradi",
    price: 950000,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=500&fit=crop",
    bedrooms: 4,
    bathrooms: 3,
    isSaved: false,
    latitude: 4.8845,
    longitude: -1.7554,
    propertyType: "house",
    transactionType: "buy",
  },
];

// Featured properties (for dashboard)
export const FEATURED_PROPERTIES: Property[] = ALL_PROPERTIES.slice(0, 3);

// Near you properties (for dashboard)
export const NEAR_YOU_PROPERTIES: Property[] = ALL_PROPERTIES.slice(3, 6);

// New listings (for dashboard)
export const NEW_LISTINGS: Property[] = ALL_PROPERTIES.slice(6, 9);

// Detailed property data (for property detail screen)
export const DETAILED_PROPERTIES: Record<string, DetailedProperty> = {
  "1": {
    id: "1",
    title: "4 Bedroom House in East Legon",
    location: "East Legon, Accra",
    price: 850000,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop",
    ],
    bedrooms: 4,
    bathrooms: 3,
    plotSize: 2,
    description:
      "Beautiful modern 4-bedroom house located in the prestigious East Legon area. This stunning property features spacious rooms, modern finishes, and a well-maintained garden. Perfect for families looking for comfort and style in a prime location. The house boasts a contemporary design with large windows that allow natural light to flood the interior spaces. The open-plan living area seamlessly connects to a modern kitchen equipped with high-end appliances. Each bedroom is generously sized with built-in wardrobes and en-suite bathrooms. The master bedroom features a walk-in closet and a luxurious bathroom with a bathtub and separate shower. The property also includes a private garden, perfect for outdoor entertaining and relaxation.",
    amenities: ["Water", "Electricity", "Security", "Parking", "Internet"],
    latitude: 5.6037,
    longitude: -0.187,
    address: "123 Main Street, East Legon, Accra",
    negotiable: true,
    owner: {
      id: "owner1",
      name: "Kofi Mensah",
      avatar: "https://i.pravatar.cc/150?img=12",
      verified: true,
      memberSince: "2023",
      phone: "+233123456789",
    },
    transactionType: "buy",
    propertyType: "house",
    yearBuilt: 2020,
    propertySize: 350,
    listedDate: "2024-01-15",
    propertyId: "PR-2024-001234",
    features: {
      furnished: true,
      airConditioning: true,
      heating: false,
      balcony: true,
      garden: true,
      garage: true,
      elevator: false,
      swimmingPool: false,
    },
  },
  "2": {
    id: "2",
    title: "Modern 3 Bedroom Apartment",
    location: "Airport Residential, Accra",
    price: 650000,
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
    ],
    bedrooms: 3,
    bathrooms: 2,
    plotSize: 1,
    description:
      "Stylish 3-bedroom apartment in the heart of Airport Residential area. This modern apartment features contemporary design, high-quality finishes, and excellent security. Perfect for professionals and small families seeking a comfortable living space in a prime location.",
    amenities: ["Water", "Electricity", "Security", "Parking", "Internet"],
    latitude: 5.6147,
    longitude: -0.1756,
    address: "456 Airport Road, Airport Residential, Accra",
    negotiable: false,
    owner: {
      id: "owner2",
      name: "Ama Asante",
      avatar: "https://i.pravatar.cc/150?img=5",
      verified: true,
      memberSince: "2022",
      phone: "+233987654321",
    },
    transactionType: "buy",
    propertyType: "apartment",
    yearBuilt: 2021,
    propertySize: 180,
    listedDate: "2024-02-01",
    propertyId: "PR-2024-002345",
    features: {
      furnished: false,
      airConditioning: true,
      heating: false,
      balcony: true,
      garden: false,
      garage: true,
      elevator: true,
      swimmingPool: false,
    },
  },
  "3": {
    id: "3",
    title: "Luxury Villa with Pool",
    location: "Labone, Accra",
    price: 1200000,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
    ],
    bedrooms: 5,
    bathrooms: 4,
    plotSize: 3,
    description:
      "Stunning luxury villa with private pool in the prestigious Labone area. This magnificent property offers the ultimate in luxury living with spacious rooms, premium finishes, and exceptional amenities. Perfect for discerning buyers seeking elegance and sophistication.",
    amenities: [
      "Water",
      "Electricity",
      "Security",
      "Parking",
      "Internet",
      "Pool",
    ],
    latitude: 5.5556,
    longitude: -0.1969,
    address: "789 Labone Road, Labone, Accra",
    negotiable: false,
    owner: {
      id: "owner3",
      name: "Yaw Boateng",
      avatar: "https://i.pravatar.cc/150?img=8",
      verified: true,
      memberSince: "2021",
      phone: "+233555123456",
    },
    transactionType: "buy",
    propertyType: "house",
    yearBuilt: 2019,
    propertySize: 500,
    listedDate: "2024-01-20",
    propertyId: "PR-2024-003456",
    features: {
      furnished: true,
      airConditioning: true,
      heating: false,
      balcony: true,
      garden: true,
      garage: true,
      elevator: false,
      swimmingPool: true,
    },
  },
  "4": {
    id: "4",
    title: "2 Bedroom House for Rent",
    location: "Cantonments, Accra",
    price: 3500,
    images: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop",
    ],
    bedrooms: 2,
    bathrooms: 1,
    plotSize: 1,
    description:
      "Cozy 2-bedroom house available for rent in Cantonments. Well-maintained property with modern amenities, perfect for small families or professionals. Located in a quiet neighborhood with easy access to major amenities.",
    amenities: ["Water", "Electricity", "Security", "Parking"],
    latitude: 5.5667,
    longitude: -0.1833,
    address: "456 Cantonments Road, Cantonments, Accra",
    negotiable: true,
    owner: {
      id: "owner4",
      name: "Akosua Adjei",
      avatar: "https://i.pravatar.cc/150?img=15",
      verified: true,
      memberSince: "2023",
      phone: "+233244567890",
    },
    transactionType: "rent",
    propertyType: "house",
    yearBuilt: 2018,
    propertySize: 120,
    listedDate: "2024-02-10",
    propertyId: "PR-2024-004567",
    features: {
      furnished: false,
      airConditioning: true,
      heating: false,
      balcony: true,
      garden: true,
      garage: false,
      elevator: false,
      swimmingPool: false,
    },
  },
  "5": {
    id: "5",
    title: "Spacious 3 Bedroom Apartment",
    location: "Osu, Accra",
    price: 4500,
    images: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    ],
    bedrooms: 3,
    bathrooms: 2,
    plotSize: 1,
    description:
      "Spacious 3-bedroom apartment in the vibrant Osu area. Modern design with excellent natural light, perfect for families. Close to restaurants, shops, and entertainment venues.",
    amenities: ["Water", "Electricity", "Security", "Parking", "Internet"],
    latitude: 5.55,
    longitude: -0.1667,
    address: "321 Osu Road, Osu, Accra",
    negotiable: true,
    owner: {
      id: "owner5",
      name: "Kwame Asante",
      avatar: "https://i.pravatar.cc/150?img=20",
      verified: true,
      memberSince: "2022",
      phone: "+233277890123",
    },
    transactionType: "rent",
    propertyType: "apartment",
    yearBuilt: 2021,
    propertySize: 150,
    listedDate: "2024-02-15",
    propertyId: "PR-2024-005678",
    features: {
      furnished: true,
      airConditioning: true,
      heating: false,
      balcony: true,
      garden: false,
      garage: true,
      elevator: true,
      swimmingPool: false,
    },
  },
};

// Helper function to get detailed property by ID
export const getDetailedProperty = (id: string): DetailedProperty | null => {
  return DETAILED_PROPERTIES[id] || null;
};

// Helper function to get property by ID
export const getPropertyById = (id: string): Property | null => {
  return ALL_PROPERTIES.find((p) => p.id === id) || null;
};

// Helper function to get map property by ID
export const getMapPropertyById = (id: string): MapProperty | null => {
  return MAP_PROPERTIES.find((p) => p.id === id) || null;
};

// Get saved properties (properties with isSaved: true)
export const getSavedProperties = (): Property[] => {
  return ALL_PROPERTIES.filter((p) => p.isSaved === true);
};

// Get saved property IDs as a Set
export const getSavedPropertyIds = (): Set<string> => {
  const savedIds = new Set<string>();
  ALL_PROPERTIES.forEach((p) => {
    if (p.isSaved) {
      savedIds.add(p.id);
    }
  });
  return savedIds;
};
