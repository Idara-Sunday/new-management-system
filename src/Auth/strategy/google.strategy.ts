import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy ,VerifyCallback} from "passport-google-oauth20";
import { AuthService } from "../auth.service";

@Injectable()

export class GoogleStrategy extends PassportStrategy(Strategy,'google') {
    constructor(@Inject(AuthService) private readonly authService:AuthService){
        super({
            clientID: '713595732177-32rf8op1c50ltdjalhdaaa92lemd3i18.apps.googleusercontent.com',
            clientSecret:'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',
            callbackURL:`http://localhost:9000/auth/google/callback`,
            scope:['profile','email']  
        })  
    }

    async validate( accessToken:string, refreshToken:string, profile:Profile, done:VerifyCallback) :Promise<any>{
        // const {emails, photos, name} = profile;

        // const user = {
        //     email:emails[0].value,
        //     name:name.givenName,
        //     familyName:name.familyName,
        //     photo:photos[0].value,
        //     accessToken,
        //     refreshToken
        // };
        // done(null,user)
       const user = await this.authService.validateGoogleUser({
            email:profile.emails[0].value,
            displayName:profile.displayName,
        })
    }
}