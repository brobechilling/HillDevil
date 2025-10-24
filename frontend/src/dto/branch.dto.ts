import { UUID } from "crypto";


export interface BranchDTO {
  branchId: UUID;          
  address: string;
  branchPhone: string;
  openingTime: string;
  closingTime: string;
  mail: string;
  isActive: boolean;
}