import { UUID } from "crypto";

export interface FeatureValueDTO {
  featureId: UUID;
  featureName: string;
  description: string;
  value: number;
}
