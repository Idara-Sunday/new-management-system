import { Body, Controller, Get, HttpCode, Param, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import {Request, Response}  from 'express';
import { AuthGuard } from "@nestjs/passport"; 
import { RoleGuard } from "./guard/role.guard";
import { Roles } from "./guard/role";
import { BlockGuard } from "./guard/block.guard";
import { ResetPasswordDTO } from "./dto/reset-password.dto";
import { forgotPasswordDTO } from "./dto/forgotpassword.dto";

@Controller('project')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
    async signupUser (@Body() payload: SignupDto){
      const user = await this.authService.signup(payload);
      return  user;
    }
    
    @Post('login')
    async login (@Body() payload:LoginDto, @Req()req:Request, @Res()res:Response){
      const token = await this.authService.signin(payload, req, res);
    }

    @HttpCode(200)
    @Post('logout')
    async logout (@Req()req:Request, @Res()res:Response){
      return await this.authService.logout(req, res)
    }

    @Get()
    @UseGuards(AuthGuard(), RoleGuard)
    @Roles('admin', 'vendor')
    async findUser(){
      return await this.authService.findUsers()
    }

    @UseGuards(AuthGuard())
    @Get('profile')
    profile(@Req() req:Request){
      return req.user
    }
    

  @UseGuards(AuthGuard(),RoleGuard)
  @Roles('admin')
  @Patch(':id/block')
  async blockUser(@Param('id') id:string){

    return await this.authService.blockUser(id);

  }


@UseGuards(AuthGuard(),RoleGuard)
@Roles('admin')
  @Patch(':id/unblock')
  async unblockUser(@Param('id') id:string){

    return await this.authService.unblockUser(id)
  }

  @UseGuards(AuthGuard(), BlockGuard)
  @Get('hello')
  helloworld(){
    return `hello world`
    
  }


  @UseGuards()
  @Post('forgot-password')
  async forgotPassword(@Req() req:Request,@Res() res:Response,@Body() payload:forgotPasswordDTO){
    return await this.authService.forgotPassword(req,res,payload)
  }

  // @UseGuards(AuthGuard())
  // @Get('reset-password/:id/:token')
  // async resetPassword(@Req() req:Request,@Res() res:Response, @Body() payload:ResetPasswordDTO){

  // }


  @UseGuards()
  @Post('reset-password/:id/:token')
  async resetPassword(@Param() params:['id','token'], @Req() req:Request,@Res() res:Response, @Body() payload:ResetPasswordDTO){
    return await this.authService.resetPassword(req,res,payload)
  }


}