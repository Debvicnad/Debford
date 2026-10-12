import { createClient } from "@/lib/supabase/server";

/** Returns false when Supabase env vars aren't set (e.g. local dev without .env.local) */
export const isSupabaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


// ── Shared types ──────────────────────────────────────────────
export type VehicleListingRow = {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  is_negotiable: boolean;
  status: string;
  views_count: number;
  saves_count: number;
  published_at: string | null;
  vehicle: {
    id: string;
    year: number;
    make_name: string | null;
    model_name: string | null;
    variant_name: string | null;
    condition: string;
    mileage: number | null;
    mileage_unit: string | null;
    fuel_type: string | null;
    transmission: string | null;
    body_type: string | null;
    color: string | null;
    city: string | null;
    country: string | null;
    images: { url: string; is_primary: boolean }[];
  };
  seller: {
    id: string;
    full_name: string | null;
    average_rating: number | null;
    verification_status: string;
  } | null;
};

export type AuctionRow = {
  id: string;
  title: string;
  status: string;
  starting_price: number;
  current_bid: number | null;
  reserve_price: number | null;
  buy_now_price: number | null;
  bid_increment: number;
  bids_count: number;
  starts_at: string;
  ends_at: string;
  currency: string;
  vehicle: {
    id: string;
    year: number;
    make_name: string | null;
    model_name: string | null;
    city: string | null;
    images: { url: string; is_primary: boolean }[];
  };
};

export type RentalRow = {
  id: string;
  title: string;
  status: string;
  price_per_day: number;
  price_per_week: number | null;
  price_per_month: number | null;
  currency: string;
  average_rating: number | null;
  total_bookings: number;
  pickup_location: string | null;
  delivery_available: boolean;
  vehicle: {
    id: string;
    year: number;
    make_name: string | null;
    model_name: string | null;
    fuel_type: string | null;
    transmission: string | null;
    seats: number | null;
    images: { url: string; is_primary: boolean }[];
  };
  owner: { id: string; full_name: string | null; average_rating: number | null } | null;
};

// ── Vehicle listing queries ───────────────────────────────────

export interface ListingFilters {
  make?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuelType?: string;
  transmission?: string;
  condition?: string;
  bodyType?: string;
  vehicleType?: string;
  search?: string;
  sortBy?: "price_asc" | "price_desc" | "newest" | "oldest" | "mileage_asc";
  page?: number;
  limit?: number;
}

// ── Demo listings (shown when Supabase is offline / not yet configured) ──────
const DEMO_LISTINGS = [
  {
    id: "demo-1",
    title: "2022 BMW 5 Series 530i Sport Line",
    slug: "demo-bmw-530i-2022",
    price: 52000,
    currency: "USD",
    is_negotiable: true,
    status: "published",
    views_count: 342,
    saves_count: 18,
    inquiries_count: 7,
    published_at: new Date().toISOString(),
    highlights: [
      "Certified 1-Owner Clean CarFax",
      "Factory M-Sport Aero Package",
      "Live Cockpit Professional & HUD",
      "Full Debford 150-Point Inspection Passed",
      "Active Warranty until Nov 2027",
    ],
    description:
      "Stunning 2022 BMW 530i Sport Line finished in Alpine White over Canberra Beige Vernasca leather. Powered by a responsive 2.0L TwinPower Turbo inline-4 paired with an 8-speed sport automatic transmission. Equipped with Driving Assistance Professional Package, Harman Kardon surround audio, wireless Apple CarPlay, heated/ventilated front seats, and ceramic controls. Meticulously maintained with full BMW authorized service history.",
    vehicle: {
      id: "v1",
      year: 2022,
      make_name: "BMW",
      model_name: "5 Series",
      variant_name: "530i Sport Line",
      condition: "used",
      mileage: 24500,
      mileage_unit: "km",
      fuel_type: "Petrol",
      transmission: "Automatic (8-Speed Steptronic)",
      body_type: "Sedan",
      color: "Alpine White",
      city: "New York",
      country: "US",
      engine_size: "2.0",
      power_hp: 248,
      torque_nm: 350,
      acceleration_0_100: "6.0s",
      top_speed_kmh: 250,
      drive_type: "RWD",
      vin: "WBA530I7NC9B84102",
      doors: 4,
      seats: 5,
      curb_weight_kg: 1690,
      fuel_consumption: "6.5L / 100km",
      inspection_score: 98,
      inspection_grade: "Grade A+ Certified",
      obd_status: "Pass (0 Diagnostic Faults)",
      brake_pad_life: "88% Front / 85% Rear",
      tire_tread_depth: "6.8mm (Pirelli P-Zero)",
      images: [
        { url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=80", is_primary: true, sort_order: 0 },
        { url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=80", is_primary: false, sort_order: 1 },
        { url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80", is_primary: false, sort_order: 2 },
        { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80", is_primary: false, sort_order: 3 },
      ],
      features: [
        { feature: "M Sport Suspension", category: "Performance & Handling" },
        { feature: "Variable Sport Steering", category: "Performance & Handling" },
        { feature: "Driving Dynamics Control with ECO PRO", category: "Performance & Handling" },
        { feature: "12.3\" Digital Instrument Cluster", category: "Cockpit & Technology" },
        { feature: "Harman Kardon 16-Speaker Surround Sound", category: "Cockpit & Technology" },
        { feature: "Wireless Smartphone Charging & Hotspot", category: "Cockpit & Technology" },
        { feature: "Active Blind Spot Detection", category: "Safety & Driver Assist" },
        { feature: "Lane Departure Warning with Steering Intervention", category: "Safety & Driver Assist" },
        { feature: "Frontal Collision Warning with City Collision Mitigation", category: "Safety & Driver Assist" },
        { feature: "Vernasca Perforated Leather Seats", category: "Comfort & Interior" },
        { feature: "Multi-Zone Automatic Climate Control", category: "Comfort & Interior" },
        { feature: "Ambient Cabin Lighting with 11 Colors", category: "Comfort & Interior" },
      ],
    },
    seller: {
      id: "s1",
      full_name: "Prestige Auto Manhattan",
      average_rating: 4.9,
      reviews_count: 142,
      sales_count: 88,
      verification_status: "verified",
      response_time: "< 15 mins",
      city: "New York, NY",
    },
  },
  {
    id: "demo-2",
    title: "2023 Mercedes-Benz GLE 450 AMG Line",
    slug: "demo-gle450-2023",
    price: 78500,
    currency: "USD",
    is_negotiable: false,
    status: "published",
    views_count: 510,
    saves_count: 37,
    inquiries_count: 12,
    published_at: new Date().toISOString(),
    highlights: [
      "AMG Dynamic Performance Line",
      "AIRMATIC Adaptive Air Suspension",
      "Panoramic Sliding Sunroof",
      "Burmester 3D Surround Audio",
      "Zero Accidents · Showroom Condition",
    ],
    description:
      "Commanding 2023 Mercedes-Benz GLE 450 4MATIC SUV finished in Obsidian Black Metallic over Espresso Brown Nappa leather. Featuring the 3.0L inline-6 turbo engine with 48V EQ Boost mild hybrid system delivering 362 hp and 500 Nm of torque through a 9G-TRONIC transmission. Loaded with MBUX Augmented Video Navigation, 21-inch AMG multi-spoke wheels, and 360-degree surround cameras.",
    vehicle: {
      id: "v2",
      year: 2023,
      make_name: "Mercedes-Benz",
      model_name: "GLE",
      variant_name: "450 AMG Line",
      condition: "new",
      mileage: 800,
      mileage_unit: "km",
      fuel_type: "Petrol / Mild Hybrid",
      transmission: "Automatic (9G-TRONIC)",
      body_type: "SUV",
      color: "Obsidian Black Metallic",
      city: "Los Angeles",
      country: "US",
      engine_size: "3.0",
      power_hp: 362,
      torque_nm: 500,
      acceleration_0_100: "5.5s",
      top_speed_kmh: 250,
      drive_type: "AWD (4MATIC)",
      vin: "WDC1671591A928341",
      doors: 5,
      seats: 7,
      curb_weight_kg: 2220,
      fuel_consumption: "8.8L / 100km",
      inspection_score: 99,
      inspection_grade: "Grade A+ Certified",
      obd_status: "Pass (0 Diagnostic Faults)",
      brake_pad_life: "99% Front / 99% Rear",
      tire_tread_depth: "7.8mm (Michelin Pilot Sport)",
      images: [
        { url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=80", is_primary: true, sort_order: 0 },
        { url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=80", is_primary: false, sort_order: 1 },
        { url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=80", is_primary: false, sort_order: 2 },
        { url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=80", is_primary: false, sort_order: 3 },
      ],
      features: [
        { feature: "AIRMATIC Air Suspension with ADS+", category: "Performance & Handling" },
        { feature: "4MATIC Variable All-Wheel Drive", category: "Performance & Handling" },
        { feature: "Dual 12.3\" MBUX Curved Glass Displays", category: "Cockpit & Technology" },
        { feature: "Burmester High-End 3D Surround Audio", category: "Cockpit & Technology" },
        { feature: "Active Distance Assist DISTRONIC", category: "Safety & Driver Assist" },
        { feature: "Active Steering Assist & Speed Limit Assist", category: "Safety & Driver Assist" },
        { feature: "Nappa Leather Upholstery with Heated Armrests", category: "Comfort & Interior" },
        { feature: "ENERGIZING Comfort Air Balance Package", category: "Comfort & Interior" },
      ],
    },
    seller: {
      id: "s2",
      full_name: "Beverly Hills Motorcars",
      average_rating: 4.9,
      reviews_count: 215,
      sales_count: 154,
      verification_status: "verified",
      response_time: "< 10 mins",
      city: "Los Angeles, CA",
    },
  },
  {
    id: "demo-3",
    title: "2021 Tesla Model 3 Long Range AWD",
    slug: "demo-tesla-m3-2021",
    price: 38900,
    currency: "USD",
    is_negotiable: true,
    status: "published",
    views_count: 891,
    saves_count: 64,
    inquiries_count: 19,
    published_at: new Date().toISOString(),
    highlights: [
      "Dual Motor All-Wheel Drive",
      "Full Self-Driving Computer Included",
      "576 km EPA Estimated Battery Range",
      "Battery & Drive Unit Warranty to 2029",
      "Premium Connectivity & Glass Roof",
    ],
    description:
      "Crisp and ultra-efficient 2021 Tesla Model 3 Long Range AWD in Midnight Silver Metallic with Premium Black interior. Accelerates 0-100 km/h in an astonishing 4.2 seconds with dual permanent magnet motors. Battery health diagnostics show 97.4% capacity retention. Equipped with heat pump thermal management, heated steering wheel, power trunk, and acoustic glass.",
    vehicle: {
      id: "v3",
      year: 2021,
      make_name: "Tesla",
      model_name: "Model 3",
      variant_name: "Long Range AWD",
      condition: "used",
      mileage: 41200,
      mileage_unit: "km",
      fuel_type: "Electric",
      transmission: "Single-Speed Fixed Gear",
      body_type: "Sedan",
      color: "Midnight Silver Metallic",
      city: "San Francisco",
      country: "US",
      engine_size: "Dual Motor EV",
      power_hp: 425,
      torque_nm: 660,
      acceleration_0_100: "4.2s",
      top_speed_kmh: 233,
      drive_type: "AWD",
      vin: "5YJ3E1EB8MF981442",
      doors: 4,
      seats: 5,
      curb_weight_kg: 1844,
      fuel_consumption: "14.7 kWh / 100km",
      inspection_score: 97,
      inspection_grade: "Grade A+ Certified",
      obd_status: "Pass (EV System 100% Health)",
      brake_pad_life: "92% (Regen Braking Preservation)",
      tire_tread_depth: "6.2mm (Continental ProContact)",
      images: [
        { url: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1600&q=80", is_primary: true, sort_order: 0 },
        { url: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=1600&q=80", is_primary: false, sort_order: 1 },
        { url: "https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?auto=format&fit=crop&w=1600&q=80", is_primary: false, sort_order: 2 },
      ],
      features: [
        { feature: "Dual Motor Electric AWD", category: "Performance & Handling" },
        { feature: "Track Mode & Regenerative Braking Control", category: "Performance & Handling" },
        { feature: "15-inch Center Touchscreen with Gaming", category: "Cockpit & Technology" },
        { feature: "Autopilot Full Self-Driving Hardware 3.0", category: "Safety & Driver Assist" },
        { feature: "360-Degree Sentry Cameras & Dashcam", category: "Safety & Driver Assist" },
        { feature: "Full Tinted Panoramic Glass Roof", category: "Comfort & Interior" },
      ],
    },
    seller: {
      id: "s3",
      full_name: "Silicon Valley EV Direct",
      average_rating: 4.8,
      reviews_count: 98,
      sales_count: 62,
      verification_status: "verified",
      response_time: "< 20 mins",
      city: "San Francisco, CA",
    },
  },
  {
    id: "demo-4",
    title: "2020 Porsche Cayenne GTS Coupe",
    slug: "demo-cayenne-gts-2020",
    price: 89000,
    currency: "USD",
    is_negotiable: true,
    status: "published",
    views_count: 278,
    saves_count: 22,
    inquiries_count: 8,
    published_at: new Date().toISOString(),
    highlights: [
      "4.0L Twin-Turbo V8 Engine (453 HP)",
      "Porsche Dynamic Chassis Control (PDCC)",
      "Sport Chrono Package with Mode Switch",
      "Adaptive Sport Seats Plus 18-Way",
      "Full Porsche Dealer Maintenance Record",
    ],
    description:
      "Exquisite 2020 Porsche Cayenne GTS Coupe presented in Carrara White Metallic with GTS interior package in Carmine Red and Alcantara. Powered by the legendary 4.0L bi-turbo V8 engine producing 453 horsepower and 620 Nm of torque through an 8-speed Tiptronic S transmission. Equipped with Sport Exhaust with central tailpipes, PASM adaptive air suspension, rear-axle steering, and Burmester high-end 3D audio.",
    vehicle: {
      id: "v4",
      year: 2020,
      make_name: "Porsche",
      model_name: "Cayenne",
      variant_name: "GTS Coupe",
      condition: "used",
      mileage: 33700,
      mileage_unit: "km",
      fuel_type: "Petrol",
      transmission: "Automatic (8-Speed Tiptronic S)",
      body_type: "Coupe SUV",
      color: "Carrara White Metallic",
      city: "Miami",
      country: "US",
      engine_size: "4.0",
      power_hp: 453,
      torque_nm: 620,
      acceleration_0_100: "4.5s (4.2s with Sport Chrono)",
      top_speed_kmh: 270,
      drive_type: "AWD (PTM)",
      vin: "WP1AB2AY5LDA91042",
      doors: 5,
      seats: 5,
      curb_weight_kg: 2145,
      fuel_consumption: "11.2L / 100km",
      inspection_score: 99,
      inspection_grade: "Grade A+ Certified",
      obd_status: "Pass (Porsche PIWIS Diagnostics Clean)",
      brake_pad_life: "86% Front / 84% Rear",
      tire_tread_depth: "6.5mm (Michelin Pilot Sport 4 SUV)",
      images: [
        { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80", is_primary: true, sort_order: 0 },
        { url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=80", is_primary: false, sort_order: 1 },
        { url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=80", is_primary: false, sort_order: 2 },
      ],
      features: [
        { feature: "Sport Chrono Package with Mode Switch", category: "Performance & Handling" },
        { feature: "Porsche Active Suspension Management (PASM)", category: "Performance & Handling" },
        { feature: "Rear-Axle Steering with Power Steering Plus", category: "Performance & Handling" },
        { feature: "PCM 12.3-inch Full HD Navigation", category: "Cockpit & Technology" },
        { feature: "Burmester 3D High-End Surround Sound", category: "Cockpit & Technology" },
        { feature: "Night Vision Assist with Thermal Camera", category: "Safety & Driver Assist" },
        { feature: "Adaptive 18-Way Sport Seats with Memory", category: "Comfort & Interior" },
        { feature: "Panoramic Fixed Glass Roof", category: "Comfort & Interior" },
      ],
    },
    seller: {
      id: "s4",
      full_name: "South Beach Exotics",
      average_rating: 4.9,
      reviews_count: 175,
      sales_count: 110,
      verification_status: "verified",
      response_time: "< 12 mins",
      city: "Miami, FL",
    },
  },
  {
    id: "demo-5",
    title: "2022 Ford Mustang GT Premium Fastback",
    slug: "demo-mustang-gt-2022",
    price: 41500,
    currency: "USD",
    is_negotiable: true,
    status: "published",
    views_count: 624,
    saves_count: 45,
    inquiries_count: 14,
    published_at: new Date().toISOString(),
    highlights: [
      "5.0L Ti-VCT Coyote V8 (450 HP)",
      "6-Speed Manual with Rev-Matching",
      "Active Valve Performance Quad Exhaust",
      "MagneRide Damping System",
      "Brembo 6-Piston Front Brake System",
    ],
    description:
      "Pure American muscle engineering: 2022 Ford Mustang GT Premium Fastback in vibrant Race Red with Ebony leather interior. Houses the naturally aspirated 5.0L Coyote V8 engine mated to an authentic 6-speed manual transmission with aggressive rev-matching. Equipped with GT Performance Package, MagneRide suspension, Torsen limited-slip differential, and B&O 12-speaker sound system.",
    vehicle: {
      id: "v5",
      year: 2022,
      make_name: "Ford",
      model_name: "Mustang",
      variant_name: "GT Premium Fastback",
      condition: "used",
      mileage: 18900,
      mileage_unit: "km",
      fuel_type: "Petrol",
      transmission: "Manual (6-Speed with Rev-Match)",
      body_type: "Coupe",
      color: "Race Red",
      city: "Dallas",
      country: "US",
      engine_size: "5.0",
      power_hp: 450,
      torque_nm: 556,
      acceleration_0_100: "4.3s",
      top_speed_kmh: 250,
      drive_type: "RWD",
      vin: "1FA6P8CF3N5184912",
      doors: 2,
      seats: 4,
      curb_weight_kg: 1735,
      fuel_consumption: "11.8L / 100km",
      inspection_score: 98,
      inspection_grade: "Grade A+ Certified",
      obd_status: "Pass (0 Diagnostic Faults)",
      brake_pad_life: "87% Front / 89% Rear",
      tire_tread_depth: "6.6mm (Michelin Pilot Sport 4S)",
      images: [
        { url: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1600&q=80", is_primary: true, sort_order: 0 },
        { url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1600&q=80", is_primary: false, sort_order: 1 },
        { url: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=80", is_primary: false, sort_order: 2 },
      ],
      features: [
        { feature: "Active Valve Quad Exhaust with Quiet/Track Modes", category: "Performance & Handling" },
        { feature: "MagneRide Adaptive Damping System", category: "Performance & Handling" },
        { feature: "Torsen 3.73 Limited-Slip Rear Axle", category: "Performance & Handling" },
        { feature: "12-inch All-Digital Instrument Cluster", category: "Cockpit & Technology" },
        { feature: "B&O 12-Speaker Sound System with Subwoofer", category: "Cockpit & Technology" },
        { feature: "Pre-Collision Assist with Automatic Emergency Braking", category: "Safety & Driver Assist" },
        { feature: "Heated & Cooled Leather Front Sport Seats", category: "Comfort & Interior" },
      ],
    },
    seller: {
      id: "s5",
      full_name: "Lone Star Performance Auto",
      average_rating: 4.8,
      reviews_count: 112,
      sales_count: 79,
      verification_status: "verified",
      response_time: "< 15 mins",
      city: "Dallas, TX",
    },
  },
  {
    id: "demo-6",
    title: "2023 Toyota Land Cruiser 300 VX",
    slug: "demo-lc300-2023",
    price: 92000,
    currency: "USD",
    is_negotiable: false,
    status: "published",
    views_count: 415,
    saves_count: 29,
    inquiries_count: 11,
    published_at: new Date().toISOString(),
    highlights: [
      "3.3L Twin-Turbo V6 Diesel (304 HP / 700 Nm)",
      "Electronic Kinetic Dynamic Suspension (E-KDSS)",
      "Multi-Terrain Select with Crawl Control",
      "Cooler Box & 14-Speaker JBL Premium Sound",
      "Full Factory Warranty to 2028",
    ],
    description:
      "The pinnacle of overland engineering: 2023 Toyota Land Cruiser 300 VX in Graphite Black with Neutral Beige leather. Powered by Toyota's flagship 3.3L Twin-Turbo Diesel V6 generating 700 Nm of pulling torque through a robust 10-speed Direct Shift automatic transmission. Features full-time 4WD, center differential lock, 360 multi-terrain monitor, and adaptive high beam system.",
    vehicle: {
      id: "v6",
      year: 2023,
      make_name: "Toyota",
      model_name: "Land Cruiser",
      variant_name: "300 VX",
      condition: "new",
      mileage: 1200,
      mileage_unit: "km",
      fuel_type: "Diesel",
      transmission: "Automatic (10-Speed Direct Shift)",
      body_type: "SUV",
      color: "Graphite Black",
      city: "Houston",
      country: "US",
      engine_size: "3.3",
      power_hp: 304,
      torque_nm: 700,
      acceleration_0_100: "6.7s",
      top_speed_kmh: 210,
      drive_type: "Full-Time 4WD",
      vin: "JTMHN09J4N4018241",
      doors: 5,
      seats: 7,
      curb_weight_kg: 2580,
      fuel_consumption: "8.9L / 100km",
      inspection_score: 99,
      inspection_grade: "Grade A+ Certified",
      obd_status: "Pass (0 Diagnostic Faults)",
      brake_pad_life: "99% Front / 99% Rear",
      tire_tread_depth: "8.5mm (Bridgestone Dueler A/T)",
      images: [
        { url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=80", is_primary: true, sort_order: 0 },
        { url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80", is_primary: false, sort_order: 1 },
        { url: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80", is_primary: false, sort_order: 2 },
      ],
      features: [
        { feature: "Electronic Kinetic Dynamic Suspension System (E-KDSS)", category: "Performance & Handling" },
        { feature: "Multi-Terrain Select with Auto Mode", category: "Performance & Handling" },
        { feature: "Full-Time 4WD with Torsen LSD Center Diff", category: "Performance & Handling" },
        { feature: "12.3-inch Touchscreen with JBL 14-Speaker Audio", category: "Cockpit & Technology" },
        { feature: "Toyota Safety Sense 2.0 with Lane Tracing Assist", category: "Safety & Driver Assist" },
        { feature: "Multi-Terrain Panoramic 3D Monitor", category: "Safety & Driver Assist" },
        { feature: "Ventilated First & Second Row Leather Seating", category: "Comfort & Interior" },
        { feature: "Front Console Refrigerated Cooler Box", category: "Comfort & Interior" },
      ],
    },
    seller: {
      id: "s6",
      full_name: "Gulf Coast Toyota Elite",
      average_rating: 4.9,
      reviews_count: 240,
      sales_count: 180,
      verification_status: "verified",
      response_time: "< 8 mins",
      city: "Houston, TX",
    },
  },
];

export async function getSaleListings(filters: ListingFilters = {}) {
  if (!isSupabaseConfigured()) {
    return { listings: DEMO_LISTINGS as unknown as VehicleListingRow[], total: DEMO_LISTINGS.length, error: null };
  }
  try {
    const supabase = await createClient();
    const limit = filters.limit ?? 12;
    const offset = ((filters.page ?? 1) - 1) * limit;

    let query = supabase
      .from("sale_listings")
      .select(
        `
        id, title, slug, price, currency, is_negotiable,
        status, views_count, saves_count, published_at,
        vehicle:vehicles (
          id, year, make_name, model_name, variant_name,
          condition, mileage, mileage_unit, fuel_type,
          transmission, body_type, color, city, country,
          images:vehicle_images (url, is_primary)
        ),
        seller:profiles (
          id, full_name, average_rating, verification_status
        )
      `,
        { count: "exact" }
      )
      .eq("status", "published");

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%`);
    }
    if (filters.minPrice) query = query.gte("price", filters.minPrice);
    if (filters.maxPrice) query = query.lte("price", filters.maxPrice);

    // Sort
    switch (filters.sortBy) {
      case "price_asc":  query = query.order("price", { ascending: true }); break;
      case "price_desc": query = query.order("price", { ascending: false }); break;
      case "oldest":     query = query.order("published_at", { ascending: true }); break;
      default:           query = query.order("published_at", { ascending: false }); break;
    }

    query = query.range(offset, offset + (filters.limit ?? 12) - 1);

    const { data, error, count } = await query;
    // On network error, fall back to demo listings
    if (error && (error.message?.toLowerCase().includes("fetch") || error.message?.toLowerCase().includes("network"))) {
      return { listings: DEMO_LISTINGS as unknown as VehicleListingRow[], total: DEMO_LISTINGS.length, error: null };
    }
    return { listings: (data ?? []) as unknown as VehicleListingRow[], total: count ?? 0, error };
  } catch {
    // Supabase host unreachable — serve demo listings so the page stays functional
    return { listings: DEMO_LISTINGS as unknown as VehicleListingRow[], total: DEMO_LISTINGS.length, error: null };
  }
}

export async function getSaleListingBySlug(slug: string) {
  const demoFound = DEMO_LISTINGS.find((d) => d.slug === slug || d.id === slug);
  if (!isSupabaseConfigured() || (slug.startsWith("demo-") && demoFound)) {
    return { listing: (demoFound ?? DEMO_LISTINGS[0]) as any, error: null };
  }
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("sale_listings")
      .select(
        `
        *,
        vehicle:vehicles (
          *,
          images:vehicle_images (*, url, is_primary, sort_order),
          features:vehicle_features (feature, category)
        ),
        seller:profiles (
          id, full_name, avatar_url, average_rating,
          reviews_count, sales_count, verification_status, city, created_at
        )
      `
      )
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .eq("status", "published")
      .maybeSingle();

    if (data) {
      return { listing: data, error: null };
    }
    return { listing: (demoFound ?? DEMO_LISTINGS[0]) as any, error: null };
  } catch {
    return { listing: (demoFound ?? DEMO_LISTINGS[0]) as any, error: null };
  }
}

// ── Demo Auctions Fallback ─────────────────────────────────────
const DEMO_ALL_AUCTIONS: AuctionRow[] = [
  {
    id: "demo",
    title: "2023 Porsche 911 GT3 RS — Weissach Package",
    status: "live",
    starting_price: 180000,
    current_bid: 215000,
    reserve_price: 210000,
    buy_now_price: 265000,
    bid_increment: 1000,
    bids_count: 14,
    starts_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    ends_at: new Date(Date.now() + 4 * 3600000 + 35 * 60000).toISOString(),
    currency: "USD",
    vehicle: {
      id: "v-gt3",
      year: 2023,
      make_name: "Porsche",
      model_name: "911 GT3 RS",
      city: "Miami, FL",
      images: [
        { url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1400&q=80", is_primary: true }
      ]
    }
  },
  {
    id: "demo-mclaren",
    title: "2022 McLaren 765LT Spider — Carbon Black MSO",
    status: "live",
    starting_price: 360000,
    current_bid: 410000,
    reserve_price: 395000,
    buy_now_price: 460000,
    bid_increment: 2500,
    bids_count: 19,
    starts_at: new Date(Date.now() - 36 * 3600000).toISOString(),
    ends_at: new Date(Date.now() + 18 * 3600000).toISOString(),
    currency: "USD",
    vehicle: {
      id: "v-765lt",
      year: 2022,
      make_name: "McLaren",
      model_name: "765LT Spider",
      city: "Beverly Hills, CA",
      images: [
        { url: "https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=1400&q=80", is_primary: true }
      ]
    }
  },
  {
    id: "demo-huracan",
    title: "2020 Lamborghini Huracán EVO RWD — Verde Mantis",
    status: "live",
    starting_price: 210000,
    current_bid: 242000,
    reserve_price: 235000,
    buy_now_price: 270000,
    bid_increment: 1500,
    bids_count: 8,
    starts_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    ends_at: new Date(Date.now() + 2 * 3600000 + 15 * 60000).toISOString(),
    currency: "USD",
    vehicle: {
      id: "v-huracan",
      year: 2020,
      make_name: "Lamborghini",
      model_name: "Huracán EVO",
      city: "Scottsdale, AZ",
      images: [
        { url: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1400&q=80", is_primary: true }
      ]
    }
  },
  {
    id: "demo-auc-sf90",
    title: "2021 Ferrari SF90 Stradale Assetto Fiorano",
    status: "upcoming",
    starting_price: 450000,
    current_bid: null,
    reserve_price: 520000,
    buy_now_price: 590000,
    bid_increment: 2500,
    bids_count: 0,
    starts_at: new Date(Date.now() + 48 * 3600000).toISOString(),
    ends_at: new Date(Date.now() + 96 * 3600000).toISOString(),
    currency: "USD",
    vehicle: {
      id: "v-sf90",
      year: 2021,
      make_name: "Ferrari",
      model_name: "SF90 Stradale",
      city: "Monaco",
      images: [
        { url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1400&q=80", is_primary: true }
      ]
    }
  },
  {
    id: "demo-auc-cobra",
    title: "1967 Shelby Cobra 427 S/C CSX Continuation",
    status: "upcoming",
    starting_price: 195000,
    current_bid: null,
    reserve_price: 225000,
    buy_now_price: null,
    bid_increment: 1000,
    bids_count: 0,
    starts_at: new Date(Date.now() + 120 * 3600000).toISOString(),
    ends_at: new Date(Date.now() + 168 * 3600000).toISOString(),
    currency: "USD",
    vehicle: {
      id: "v-cobra",
      year: 1967,
      make_name: "Shelby",
      model_name: "Cobra 427 S/C",
      city: "Dallas, TX",
      images: [
        { url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80", is_primary: true }
      ]
    }
  },
  {
    id: "demo-auc-g63",
    title: "2024 Mercedes-AMG G63 4x4 Squared Edition",
    status: "ended",
    starting_price: 290000,
    current_bid: 345000,
    reserve_price: 330000,
    buy_now_price: 380000,
    bid_increment: 2000,
    bids_count: 22,
    starts_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    ends_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    currency: "USD",
    vehicle: {
      id: "v-g63",
      year: 2024,
      make_name: "Mercedes-AMG",
      model_name: "G63 4x4²",
      city: "Dubai, UAE",
      images: [
        { url: "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1400&q=80", is_primary: true }
      ]
    }
  },
  {
    id: "demo-dbs",
    title: "2019 Aston Martin DBS Superleggera Coupe",
    status: "ended",
    starting_price: 185000,
    current_bid: 218000,
    reserve_price: 215000,
    buy_now_price: 240000,
    bid_increment: 1000,
    bids_count: 16,
    starts_at: new Date(Date.now() - 96 * 3600000).toISOString(),
    ends_at: new Date(Date.now() - 14 * 3600000).toISOString(),
    currency: "USD",
    vehicle: {
      id: "v-dbs",
      year: 2019,
      make_name: "Aston Martin",
      model_name: "DBS Superleggera",
      city: "London, UK",
      images: [
        { url: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1400&q=80", is_primary: true }
      ]
    }
  }
];

// ── Auction queries ───────────────────────────────────────────
export async function getAuctions(status?: "live" | "upcoming" | "ended") {
  if (!isSupabaseConfigured()) {
    const list = status ? DEMO_ALL_AUCTIONS.filter((a) => a.status === status) : DEMO_ALL_AUCTIONS;
    return { auctions: list, error: null };
  }
  try {
    const supabase = await createClient();
    let query = supabase
      .from("auctions")
      .select(
        `
        id, title, status, starting_price, current_bid,
        reserve_price, buy_now_price, bid_increment,
        bids_count, starts_at, ends_at, currency,
        vehicle:vehicles (
          id, year, make_name, model_name, city,
          images:vehicle_images (url, is_primary)
        )
      `
      )
      .order("ends_at", { ascending: true });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      const list = status ? DEMO_ALL_AUCTIONS.filter((a) => a.status === status) : DEMO_ALL_AUCTIONS;
      return { auctions: list, error: null };
    }
    return { auctions: data as unknown as AuctionRow[], error: null };
  } catch {
    const list = status ? DEMO_ALL_AUCTIONS.filter((a) => a.status === status) : DEMO_ALL_AUCTIONS;
    return { auctions: list, error: null };
  }
}

export async function getAuctionById(id: string) {
  const supabase = await createClient();
  const { data: auction, error } = await supabase
    .from("auctions")
    .select(
      `
      *,
      vehicle:vehicles (
        *,
        images:vehicle_images (*, url, is_primary, sort_order),
        features:vehicle_features (feature, category)
      ),
      seller:profiles (
        id, full_name, avatar_url, average_rating,
        reviews_count, sales_count, verification_status
      )
    `
    )
    .eq("id", id)
    .single();

  const { data: bids } = await supabase
    .from("auction_bids")
    .select("id, amount, bidder_id, created_at, status")
    .eq("auction_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  return { auction, bids: bids ?? [], error };
}

// ── Rental queries ────────────────────────────────────────────
export async function getRentalListings() {
  if (!isSupabaseConfigured()) {
    return { rentals: [], error: null };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rental_listings")
    .select(
      `
      id, title, status, price_per_day, price_per_week,
      price_per_month, currency, average_rating, total_bookings,
      pickup_location, delivery_available,
      vehicle:vehicles (
        id, year, make_name, model_name,
        fuel_type, transmission, seats,
        images:vehicle_images (url, is_primary)
      ),
      owner:profiles (id, full_name, average_rating)
    `
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return { rentals: (data ?? []) as unknown as RentalRow[], error };
}

export async function getRentalListingById(id: string) {
  const supabase = await createClient();
  const { data: rental, error } = await supabase
    .from("rental_listings")
    .select(
      `
      *,
      vehicle:vehicles (
        *,
        images:vehicle_images (*, url, is_primary, sort_order),
        features:vehicle_features (feature, category)
      ),
      owner:profiles (
        id, full_name, avatar_url, average_rating, verification_status, created_at
      ),
      bookings:rental_bookings (
        id, start_date, end_date, status
      )
    `
    )
    .eq("id", id)
    .single();

  return { rental, error };
}

export async function getVehicleDetails(vehicleId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { vehicle: null, error: "Not authenticated" };

    const { data: vehicle, error } = await supabase
      .from("vehicles")
      .select(
        `
        *,
        images:vehicle_images (*, url, is_primary, sort_order),
        features:vehicle_features (feature, category),
        documents:vehicle_documents (*),
        sale_listing:sale_listings (id, title, price, currency, status, slug),
        rental_listing:rental_listings (id, title, price_per_day, currency, status)
      `
      )
      .eq("id", vehicleId)
      .single();

    return { vehicle, error };
  } catch {
    return { vehicle: null, error: "Database offline or record unavailable" };
  }
}

// ── User-specific queries ─────────────────────────────────────
export async function getMyVehicles() {
  if (!isSupabaseConfigured()) return { vehicles: [], error: null };
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { vehicles: [], error: "Not authenticated" };

    const { data, error } = await supabase
      .from("vehicles")
      .select(
        `
        id, year, make_name, model_name, variant_name,
        mileage, mileage_unit, color, status, condition,
        registration_plate, created_at,
        images:vehicle_images (url, is_primary)
      `
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    return { vehicles: data ?? [], error };
  } catch {
    return { vehicles: [], error: null };
  }
}

export async function getMyListings() {
  if (!isSupabaseConfigured()) return { listings: [], error: null };
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { listings: [], error: "Not authenticated" };

    const { data, error } = await supabase
      .from("sale_listings")
      .select(
        `
        id, title, price, currency, status,
        views_count, saves_count, inquiries_count,
        published_at, expires_at,
        vehicle:vehicles (year, make_name, model_name)
      `
      )
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    return { listings: data ?? [], error };
  } catch {
    return { listings: [], error: null };
  }
}

export async function getDashboardStats() {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const [vehiclesRes, listingsRes, messagesRes] = await Promise.all([
      supabase.from("vehicles").select("id", { count: "exact" }).eq("owner_id", user.id),
      supabase.from("sale_listings").select("id", { count: "exact" }).eq("seller_id", user.id).eq("status", "published"),
      supabase.from("conversation_participants").select("unread_count").eq("user_id", user.id),
    ]);

    const totalUnread = (messagesRes.data ?? []).reduce(
      (sum, p) => sum + (p.unread_count ?? 0), 0
    );

    return {
      vehiclesCount: vehiclesRes.count ?? 0,
      activeListings: listingsRes.count ?? 0,
      unreadMessages: totalUnread,
    };
  } catch {
    return {
      vehiclesCount: 0,
      activeListings: 0,
      unreadMessages: 0,
    };
  }
}

export async function getNotifications(limit = 20) {
  if (!isSupabaseConfigured()) return { notifications: [] };
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { notifications: [] };

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    return { notifications: data ?? [] };
  } catch {
    return { notifications: [] };
  }
}

// ── Increment listing view count ──────────────────────────────
export async function incrementListingViews(listingId: string) {
  const supabase = await createClient();
  await supabase.rpc("increment_listing_views", { listing_id: listingId });
}
