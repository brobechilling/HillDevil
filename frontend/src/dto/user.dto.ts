import { UUID } from "crypto";

export interface UserDTO {
    userId: UUID;
    email: string;
    username: string;
    phone: string;
    role: RoleDTO;
    status: boolean;
}

export interface RoleDTO {
    name: string;
    description: string;
}

export enum ROLE_NAME {
    ADMIN = "ADMIN",
    BRANCH_MANAGER = "BRANCH_MANAGER",
    RESTAURANT_OWNER = "RESTAURANT_OWNER",
    WAITER = "WAITER",
    RECEPTIONIST = "RECEPTIONIST"
}