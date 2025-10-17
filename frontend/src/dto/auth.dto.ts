import { UserDTO } from "./user.dto";

export interface AuthenticationRequest {
    email: string;
    password: string;
}

export interface AuthenticationResponse {
    accessToken: string;
    refreshToken?: string;
    user: UserDTO;
}

export interface RefreshRequest {
    refreshToken?: string;
}

export interface RefreshResponse {
    accessToken: string;
    refreshToken?: string;
}
