import { Inject, Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { AuthService } from "src/Auth/auth.service";
import { GoogleUsers } from "src/Auth/entities/googleUserEntity";
@Injectable()
export class SessionSerializer extends PassportSerializer{
        
        constructor(@Inject(AuthService) private readonly authService:AuthService){
            super()
    }
    serializeUser(user: GoogleUsers, done: Function) {
        console.log('Serialize User')
        console.log(user);
        
        done(null,user);
    }
    async deserializeUser(payload: any, done: Function) {
       const user = await this.authService.googleUserbyId(payload.id)
       console.log('Deserialize User')
       console.log(user);
       return user ? done(null,user) : done(null,null)
    }
} 