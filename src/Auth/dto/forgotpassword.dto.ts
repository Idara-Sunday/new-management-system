import { IsEmail, IsString } from "class-validator";

 export class  forgotPasswordDTO{
    @IsEmail()
    @IsString()
    email:string;
 }