import { UUID } from "crypto";

export interface PackageDTO {
  packageId: UUID;
  name: string;
  description: string;
  price: number;
  available: boolean;
  billingPeriod: number;
}
