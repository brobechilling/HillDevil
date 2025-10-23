import { create } from "zustand";
import { PackageFeatureDTO } from "@/dto/packageFeature.dto";

interface PackageUIState {
  packages: PackageFeatureDTO[];
  selectedPackage?: PackageFeatureDTO;
  isModalOpen: boolean;
  setSelectedPackage: (pkg?: PackageFeatureDTO) => void;
  setModalOpen: (open: boolean) => void;
  deletePackage: (packageId: string) => void;
  toggleAvailability: (packageId: string) => void;
}

export const usePackageStore = create<PackageUIState>((set, get) => ({
  packages: [],
  selectedPackage: undefined,
  isModalOpen: false,
  setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),
  setModalOpen: (open) => set({ isModalOpen: open }),
  deletePackage: (packageId) =>
    set({ packages: get().packages.filter((p) => p.packageId !== packageId) }),
  toggleAvailability: (packageId) =>
    set({
      packages: get().packages.map((p) =>
        p.packageId === packageId ? { ...p, available: !p.available } : p
      ),
    }),
}));
