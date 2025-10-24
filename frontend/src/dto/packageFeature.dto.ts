import { UUID } from "crypto";
import { FeatureValueDTO } from "./featureValue.dto";

export interface BasePackageDTO {
  name: string;
  description: string;
  price: number;
  available: boolean;
  billingPeriod: number | string;
  features: FeatureValueDTO[];
}

export interface PackageFeatureDTO extends BasePackageDTO {
  packageId: string;
}

export type CreatePackageDTO = Omit<PackageFeatureDTO, "packageId">;
export type UpdatePackageDTO = PackageFeatureDTO;
