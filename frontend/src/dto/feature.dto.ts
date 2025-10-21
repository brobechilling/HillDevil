import { UUID } from "crypto";

export interface FeatureDTO {
  id: UUID;
  name: string;
  description: string;
  hasValue: boolean;
}
