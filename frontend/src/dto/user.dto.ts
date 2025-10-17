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

