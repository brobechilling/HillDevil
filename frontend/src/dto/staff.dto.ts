import { UUID } from "crypto";
import { RoleDTO } from "./user.dto";


export interface StaffAccountDTO {

    staffAccountId: UUID;
    role: RoleDTO;
    username: string;
    status: boolean;

}