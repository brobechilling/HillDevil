import { StaffAccountDTO } from "@/dto/staff.dto";
import { UserDTO } from "@/dto/user.dto";

export const isUserDTO = (user: any): user is UserDTO => {
    return user && typeof(user.userId) === 'string';
}

export const isStaffAccountDTO = (user: any): user is StaffAccountDTO => {
    return user && typeof(user.staffAccountId) === 'string';
}