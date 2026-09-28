export const roomTypes = [
  {
    id: "rt-deluxe",
    name: "Deluxe King",
    tagline: "A calm retreat for two",
    description: "A warm, modern room with a king bed, workspace, rainfall shower, and views of Tagaytay's cool surroundings.",
    baseRate: 3000,
    displayRate: 4000,
    capacity: 2,
    beds: "1 King Bed",
    size: "32 m²",
    available: 8,
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=85",
    amenities: ["Breakfast for 2", "Fast Wi-Fi", "Smart TV", "Rainfall shower", "Air conditioning"]
  },
  {
    id: "rt-twin",
    name: "Premier Twin",
    tagline: "Flexible comfort for friends or family",
    description: "Two comfortable queen beds, a spacious seating area, and thoughtful details for shared stays.",
    baseRate: 3400,
    displayRate: 4400,
    capacity: 3,
    beds: "2 Queen Beds",
    size: "38 m²",
    available: 5,
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=85",
    amenities: ["Breakfast for 2", "Fast Wi-Fi", "Smart TV", "Mini refrigerator", "Air conditioning"]
  },
  {
    id: "rt-family",
    name: "Family Suite",
    tagline: "More room for everyone",
    description: "Designed for family stays with a generous sleeping layout, lounge space, and extra storage.",
    baseRate: 4300,
    displayRate: 5300,
    capacity: 5,
    beds: "2 Queen Beds + Sofa",
    size: "52 m²",
    available: 3,
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=85",
    amenities: ["Breakfast for 4", "Fast Wi-Fi", "Smart TV", "Family lounge", "Air conditioning"]
  },
  {
    id: "rt-suite",
    name: "Elara Suite",
    tagline: "A premium Tagaytay escape",
    description: "Our most spacious stay, featuring a king bedroom, separate lounge, premium bathroom, and elevated hotel experience.",
    baseRate: 4800,
    displayRate: 6300,
    capacity: 4,
    beds: "1 King Bed + Sofa",
    size: "58 m²",
    available: 2,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=85",
    amenities: ["Breakfast for 2", "Fast Wi-Fi", "Premium lounge", "Bathtub", "Late checkout priority"]
  }
];

export const promotions = [
  {
    id: "promo-weekend",
    title: "Tagaytay Weekend Escape",
    code: "WEEKEND10",
    value: "10% OFF",
    description: "Save on selected Friday-to-Sunday stays.",
    active: true
  },
  {
    id: "promo-rainy",
    title: "Rainy Season Retreat",
    code: "RAINY15",
    value: "15% OFF",
    description: "Selected September dates only.",
    active: true
  },
  {
    id: "promo-suite",
    title: "Suite Upgrade",
    code: "SUITEUP",
    value: "₱700 OFF",
    description: "Enjoy more space for less on selected Elara Suite dates.",
    active: true
  }
];

export const sampleReservation = {
  id: "ER-1042",
  guest: "Angela Reyes",
  roomType: "Premier Twin",
  room: "To be assigned",
  checkIn: "2026-09-25",
  checkOut: "2026-09-27",
  guests: 2,
  amount: 7800,
  payment: "Paid",
  status: "Confirmed",
  source: "Online Booking"
};
