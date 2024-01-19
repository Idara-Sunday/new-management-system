import { BadRequestException, HttpException, Injectable, NotFoundException, Req, Res, UnauthorizedException, } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { SignupDto } from "./dto/signup.dto";
import { UserEntity } from "./entities/userEntity";
import { Repository } from "typeorm";  
import * as bcrypt from 'bcrypt';
import { LoginDto } from "./dto/login.dto";
import {Request, Response}  from 'express';

@Injectable()
export class AuthService {

  constructor ( 
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    private jwtService :JwtService){}


async signup(payload: SignupDto){
   payload.email= payload.email.toLowerCase();
    const {email, password, ...rest}=payload;
      const userEmail = await this. userRepo.findOne({where:{email:email}});
  if(userEmail){
   throw new HttpException('email already exsit', 400)
  };
  const saltOrRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltOrRounds);
     try{
        const user = await this.userRepo.create({email, password:hashedPassword, ...rest})
        await this.userRepo.save(user);
        delete user.password;
        return user;
     } catch (err){
        if(err.code === '22P02'){
        throw new BadRequestException('admin role should be lower case')
        }
        return err
     }
}



async signin(payload:LoginDto, @Req()req:Request, @Res()res:Response){
   const {email, password} = payload;

   const user = await this.userRepo.createQueryBuilder("user")
   .addSelect("user.password")
   .where("user.email = :email", {email:payload.email}).getOne()
   if(!user){
      throw new HttpException('NO EMAIL FOUND', 400)
   }
   if(!await bcrypt.compare(password, user.password)){
      throw new HttpException('SORRY PASSWORD NOT FOUND', 400)
   }
   const token = await this.jwtService.signAsync({
      email: user.email,
      id: user.id,
      role:user.role,
      blocked:user.blocked
   });
   res.cookie('isAuthenticated', token,{
      httpOnly: true,
      maxAge: 1 * 60 * 60 * 1000
   });
    return res.send({
      success:true,
      userToken:token
    })
}


async logout (@Req()req:Request, @Res()res:Response){
   const clearCookie = res.clearCookie('isAuthenticated');
   const response = res.send(`user sucessfully logout`)
   return{
      clearCookie,
      response
   }
}


async findEmail(email:string){
   const mail = await this.userRepo.findOneByOrFail({email})
   if(!mail){
      throw new UnauthorizedException('that email no dey oh')
   }
   return mail;
}


async findUsers(){
  const users = await this.userRepo.find()
  return users;
}

async user(headers:any) :Promise<any>{
   const authorizationHeader = headers.authorization;

   if(authorizationHeader){
      const token = authorizationHeader.replace('Bearer', '').trim();
      // console.log(token);
      const secretOrKey = process.env.JWT_SECRET;
      try{
         const decoded = this.jwtService.verify(token);
         let id = decoded["id"];
         let user = await this.userRepo.findOneBy({id});
         return{
            id,
            name:user.firstname, 
            email: user.email, 
            role:user.role
         };
      } 
      catch(error){
         throw new UnauthorizedException('invalid TOKEN');
      }
   }
   else{
         throw new UnauthorizedException('invalid or missing bearer token')
      }
}


async blockUser(id:string) {
   const user = await this.userRepo.findOne({where:{id}});
console.log(user);

   if (!user) {
     throw new NotFoundException('user not found');
   }

   user.blocked = true;

   return await this.userRepo.save(user);
 }

 async unblockUser(id: string) {
   const user = await this.userRepo.findOneBy({ id });

   if (!user) {
     throw new NotFoundException('user not found');
   }

   user.blocked = false;

   return await this.userRepo.save(user)
 }

 async userbyId(id:string){
   return await this.userRepo.findOneBy({id})
}
}