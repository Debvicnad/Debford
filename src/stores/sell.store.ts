import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ListingType = "sale" | "rental" | "auction";
export type VehicleTypeSlug =
  | "car" | "motorcycle" | "truck" | "van" | "bus" | "rv" | "heavy" | "heavy-equipment" | "boat";

export interface SellFormData {
  // Step 1 — Vehicle Info
  listingType: ListingType;
  vehicleType: VehicleTypeSlug;
  make: string;
  model: string;
  year: string;
  variant: string;
  vin: string;
  condition: string;
  mileage: string;
  mileageUnit: "km" | "mi";
  color: string;
  location: string;
  registrationPlate: string;

  // Step 2 — Specs & Features
  fuelType: string;
  transmission: string;
  engineSize: string;
  engineCylinders: string;
  powerHp: string;
  torqueNm: string;
  driveType: string;
  doors: string;
  seats: string;
  bodyType: string;
  interiorColor: string;
  selectedFeatures: string[];
  description: string;

  // Step 3 — Photos (stored as File objects locally, then uploaded)
  photoFiles: File[];
  photoUrls: string[];     // preview URLs
  primaryPhotoIndex: number;

  // Step 4 — Pricing
  price: string;
  currency: string;
  isNegotiable: boolean;
  // Rental-specific
  pricePerDay: string;
  pricePerWeek: string;
  pricePerMonth: string;
  securityDeposit: string;
  // Auction-specific
  startingPrice: string;
  reservePrice: string;
  buyNowPrice: string;
  bidIncrement: string;
  auctionStartDate: string;
  auctionEndDate: string;
  highlights: string[];

  // Step 5 — Review (no extra data, just confirmation)
}

interface SellFormStore {
  currentStep: number;
  data: Partial<SellFormData>;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (patch: Partial<SellFormData>) => void;
  addHighlight: (text: string) => void;
  removeHighlight: (index: number) => void;
  toggleFeature: (feature: string) => void;
  setPhotoFiles: (files: File[]) => void;
  setPrimaryPhoto: (index: number) => void;
  removePhoto: (index: number) => void;
  reset: () => void;
}

const DEFAULTS: Partial<SellFormData> = {
  listingType: "sale",
  vehicleType: "car",
  mileageUnit: "km",
  currency: "USD",
  isNegotiable: true,
  selectedFeatures: [],
  highlights: [],
  photoFiles: [],
  photoUrls: [],
  primaryPhotoIndex: 0,
  bidIncrement: "100",
};

export const useSellStore = create<SellFormStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      data: { ...DEFAULTS },

      setStep: (step) => set({ currentStep: step }),

      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 5) })),

      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),

      updateData: (patch) =>
        set((s) => ({ data: { ...s.data, ...patch } })),

      addHighlight: (text) =>
        set((s) => ({
          data: {
            ...s.data,
            highlights: [...(s.data.highlights ?? []), text],
          },
        })),

      removeHighlight: (index) =>
        set((s) => ({
          data: {
            ...s.data,
            highlights: (s.data.highlights ?? []).filter((_, i) => i !== index),
          },
        })),

      toggleFeature: (feature) =>
        set((s) => {
          const existing = s.data.selectedFeatures ?? [];
          const next = existing.includes(feature)
            ? existing.filter((f) => f !== feature)
            : [...existing, feature];
          return { data: { ...s.data, selectedFeatures: next } };
        }),

      setPhotoFiles: (files) => {
        // Revoke old URLs to avoid memory leaks
        const old = get().data.photoUrls ?? [];
        old.forEach((url) => URL.revokeObjectURL(url));
        const urls = files.map((f) => URL.createObjectURL(f));
        set((s) => ({
          data: { ...s.data, photoFiles: files, photoUrls: urls, primaryPhotoIndex: 0 },
        }));
      },

      setPrimaryPhoto: (index) =>
        set((s) => ({ data: { ...s.data, primaryPhotoIndex: index } })),

      removePhoto: (index) =>
        set((s) => {
          const files = [...(s.data.photoFiles ?? [])];
          const urls = [...(s.data.photoUrls ?? [])];
          URL.revokeObjectURL(urls[index]);
          files.splice(index, 1);
          urls.splice(index, 1);
          return {
            data: {
              ...s.data,
              photoFiles: files,
              photoUrls: urls,
              primaryPhotoIndex: Math.min(
                s.data.primaryPhotoIndex ?? 0,
                Math.max(0, files.length - 1)
              ),
            },
          };
        }),

      reset: () => set({ currentStep: 1, data: { ...DEFAULTS } }),
    }),
    {
      name: "debford-sell-form",
      // Don't persist File objects (not serializable)
      partialize: (s) => ({
        currentStep: s.currentStep,
        data: {
          ...s.data,
          photoFiles: [],
          photoUrls: [],
        },
      }),
    }
  )
);
