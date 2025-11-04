import { RoleDTO } from "./user.dto";


export interface StaffAccountDTO {
    staffAccountId: string;
    role: RoleDTO;
    username: string;
    password?: string;
    status: boolean;
    branchId: string;
}

export interface CreateStaffAccountRequest {
    username: string;
    password: string;
    branchId: string;
    role: RoleDTO;
}