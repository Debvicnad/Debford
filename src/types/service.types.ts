export type ServiceUrgency = "flexible" | "this_week" | "urgent" | "low" | "medium" | "high";

export type ServiceRequestStatus =
  | "open"
  | "quoted"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ServiceQuoteStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "expired";

export type ServiceBookingStatus =
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export interface ServicePackageItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  duration: string;
  category?: string;
  includes?: string[];
}

export interface ServiceProviderItem {
  id: string;
  name: string;
  type: string;
  tagline?: string;
  location: string;
  serviceRadius: string;
  rating: number;
  reviews: number;
  completedJobs: number;
  responseTime: string;
  memberSince: string;
  verified: boolean;
  badges: string[];
  initials: string;
  avatarUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  isMobileService?: boolean;
  hourlyRate?: number;
  specialties: string[];
  availability: string[];
  services: ServicePackageItem[];
  reviews_data: {
    author: string;
    rating: number;
    date: string;
    text: string;
  }[];
}

export interface ServiceQuoteItem {
  id: string;
  requestId: string;
  providerId: string;
  customerId: string;
  price: number;
  partsCost?: number;
  laborCost?: number;
  currency: string;
  description: string;
  estimatedDays: number;
  validUntil?: string;
  status: ServiceQuoteStatus;
  acceptedAt?: string;
  createdAt: string;
  provider: {
    id: string;
    name: string;
    type: string;
    rating: number;
    reviews: number;
    location: string;
    badges: string[];
    initials: string;
    avatarUrl?: string;
  };
}

export interface ServiceRequestItem {
  id: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  vehicleId?: string;
  vehicle?: string;
  serviceType: string;
  title: string;
  description: string;
  vehicleDescription: string;
  location: string;
  urgency: ServiceUrgency;
  preferredDate?: string;
  preferredTime?: string;
  preferredTiming?: string;
  budget?: number;
  budgetMin?: number;
  budgetMax?: number;
  currency: string;
  status: ServiceRequestStatus;
  createdAt: string;
  updatedAt: string;
  quotesCount: number;
  quotes?: ServiceQuoteItem[];
  acceptedQuoteId?: string;
  mobileService?: boolean;
  mileage?: number;
  garageVehicleId?: string;
}

export interface ServiceBookingItem {
  id: string;
  quoteId?: string;
  requestId?: string;
  providerId: string;
  customerId: string;
  vehicleId?: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime?: string;
  serviceAddress?: string;
  isMobileService: boolean;
  totalAmount: number;
  currency: string;
  status: ServiceBookingStatus;
  completionNotes?: string;
  completedAt?: string;
  createdAt: string;
  provider: {
    id: string;
    name: string;
    location: string;
    initials: string;
    rating: number;
    phone?: string;
  };
  vehicleSummary?: string;
}
