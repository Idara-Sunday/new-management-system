import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy ,VerifyCallback} from "passport-google-oauth20";

@Injectable()

export class GoogleStrategy extends PassportStrategy(Strategy,'google') {
    constructor(){
        super({
            clientID: '713595732177-32rf8op1c50ltdjalhdaaa92lemd3i18.apps.googleusercontent.com',
            clientSecret:'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',
            callbackURL:`http://localhost:9000/auth/google/callback`,
            scope:['profile','email']  
        })  
    }

    async validate( accessToken:string, refreshToken:string, profile:Profile, done:VerifyCallback) :Promise<any>{
        const {emails, photos, name} = profile;

        const user = {
            email:emails[0].value,
            name:name.givenName,
            familyName:name.familyName,
            photo:photos[0].value,
            accessToken,
            refreshToken
        };
        done(null,user)
    }
}