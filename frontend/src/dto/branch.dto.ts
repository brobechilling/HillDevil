import { UUID } from "crypto";

export interface BranchDTO {
    branchId: UUID;
    restaurantId: UUID;
    address: string;
    branchPhone?: string;
    openingTime?: string;
    closingTime?: string;
    isActive: boolean;
    mail?: string;
}

export interface CreateBranchDTO {
    restaurantId: UUID;
    address: string;
    branchPhone?: string;
    openingTime?: string;
    closingTime?: string;
    isActive?: boolean;
    mail?: string;
}

export interface UpdateBranchDTO {
    address?: string;
    branchPhone?: string;
    openingTime?: string;
    closingTime?: string;
    isActive?: boolean;
    mail?: string;
}
