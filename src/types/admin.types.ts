export type AdminTab = "overview" | "listings" | "kyc" | "providers" | "users" | "audit";

export interface KycApplicationItem {
  id: string;
  userId: string;
  applicationType: "individual_id" | "dealer_license";
  fullName: string;
  email?: string;
  idType?: "passport" | "driver_license" | "national_id";
  idNumber?: string;
  issuingCountry?: string;
  businessName?: string;
  licenseNumber?: string;
  businessType?: string;
  city?: string;
  country?: string;
  status: "pending" | "verified" | "rejected";
  rejectionReason?: string;
  adminNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  userRole?: string;
}

export interface ServiceProviderModerationItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  address?: string;
  phone: string;
  email?: string;
  rating: number;
  reviewsCount: number;
  verificationStatus: "verified" | "pending" | "rejected" | "suspended";
  isMobileService: boolean;
  createdAt: string;
}

export interface AdminAuditLogItem {
  id: string;
  adminName: string;
  actionType:
    | "approve_listing"
    | "reject_listing"
    | "verify_kyc"
    | "reject_kyc"
    | "verify_provider"
    | "reject_provider"
    | "change_user_role"
    | "bulk_approve_listings";
  targetType: "listing" | "user_kyc" | "service_provider" | "user_account";
  targetId: string;
  targetTitle: string;
  notes?: string;
  timestamp: string;
}

export interface AdminStatsOverview {
  totalUsers: number;
  totalVehicles: number;
  pendingReviews: number;
  activeListings: number;
  pendingKyc: number;
  verifiedUsers: number;
  pendingProviders: number;
  totalProviders: number;
}
