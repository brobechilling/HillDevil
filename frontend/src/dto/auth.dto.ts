import { StaffAccountDTO } from "./staff.dto";
import { UserDTO } from "./user.dto";

export interface AuthenticationRequest {
    email?: string;
    password: string;
    username?: string;
    branchId?: string;
}

export interface AuthenticationResponse {
    accessToken: string;
    refreshToken?: string;
    user?: UserDTO;
    staff?: StaffAccountDTO;
}

export interface RefreshRequest {
    refreshToken?: string;
}

export interface RefreshResponse {
    accessToken: string;
    refreshToken?: string;
}
