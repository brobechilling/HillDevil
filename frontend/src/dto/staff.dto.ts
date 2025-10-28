import { UUID } from "crypto";
import { RoleDTO } from "./user.dto";


export interface StaffAccountDTO {
    staffAccountId: UUID;
    role: RoleDTO;
    username: string;
    status: boolean;
    branchId: string;
}

export interface CreateStaffAccountRequest {
    username: string;
    password: string;
    branchId: string;
    role: RoleDTO;
}