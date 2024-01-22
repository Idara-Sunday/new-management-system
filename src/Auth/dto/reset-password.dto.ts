import { IsString } from "class-validator";

export class ResetPasswordDTO {

    @IsString()
    newPassword:string;

    @IsString()
    confirmPassword:string;
}