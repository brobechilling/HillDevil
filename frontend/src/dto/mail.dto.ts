
export interface OTPMailRequest {
    mail: string;
    name: string;
};

export interface OTPValidateMailRequest {
    email: string;
    otp: string;
};