
export interface BranchDTO {
    branchId: string;
    restaurantId: string;
    address: string;
    branchPhone?: string;
    openingTime?: string;
    closingTime?: string;
    isActive: boolean;
    mail?: string;
}

export interface CreateBranchDTO {
    restaurantId: string;
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
