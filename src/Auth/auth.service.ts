import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupDto } from './dto/signup.dto';
import { UserEntity } from './entities/userEntity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { forgotPasswordDTO } from './dto/forgotpassword.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async signup(payload: SignupDto) {
    payload.email = payload.email.toLowerCase();
    const { email, password, ...rest } = payload;
    const userEmail = await this.userRepo.findOne({ where: { email: email } });
    if (userEmail) {
      throw new HttpException('email already exsit', 400);
    }
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);
    try {
      const user = await this.userRepo.create({
        email,
        password: hashedPassword,
        ...rest,
      });
      await this.userRepo.save(user);
      delete user.password;
      return user;
    } catch (err) {
      if (err.code === '22P02') {
        throw new BadRequestException('admin role should be lower case');
      }
      return err;
    }
  }

  async signin(payload: LoginDto, @Req() req: Request, @Res() res: Response) {
    const { email, password } = payload;

    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: payload.email })
      .getOne();
    if (!user) {
      throw new HttpException('NO EMAIL FOUND', 400);
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new HttpException('SORRY PASSWORD NOT FOUND', 400);
    }
    const token = await this.jwtService.signAsync({
      email: user.email,
      id: user.id,
      role: user.role,
      blocked: user.blocked,
    });
    res.cookie('isAuthenticated', token, {
      httpOnly: true,
      maxAge: 1 * 60 * 60 * 1000,
    });
    return res.send({
      success: true,
      userToken: token,
    });
  }

  async logout(@Req() req: Request, @Res() res: Response) {
    const clearCookie = res.clearCookie('isAuthenticated');
    const response = res.send(`user sucessfully logout`);
    return {
      clearCookie,
      response,
    };
  }

  async findEmail(email: string) {
    const mail = await this.userRepo.findOneByOrFail({ email });
    if (!mail) {
      throw new UnauthorizedException('email not found');
    }
    return mail;
  }

  async findUsers() {
    const users = await this.userRepo.find();
    return users;
  }

  async user(headers: any): Promise<any> {
    const authorizationHeader = headers.authorization;

    if (authorizationHeader) {
      const token = authorizationHeader.replace('Bearer', '').trim();
      // console.log(token);
      const secretOrKey = process.env.JWT_SECRET;
      try {
        const decoded = this.jwtService.verify(token);
        let id = decoded['id'];
        let user = await this.userRepo.findOneBy({ id });
        return {
          id,
          name: user.firstname,
          email: user.email,
          role: user.role,
        };
      } catch (error) {
        throw new UnauthorizedException('invalid TOKEN');
      }
    } else {
      throw new UnauthorizedException('invalid or missing bearer token');
    }
  }

  async blockUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
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

    return await this.userRepo.save(user);
  }

  async userbyId(id: string) {
    return await this.userRepo.findOneBy({ id });
  }

  async forgotPassword(
    @Req() req: Request,
    @Res() res: Response,
    forgotPasswordPayload: forgotPasswordDTO,
  ) {
    const { email } = forgotPasswordPayload;
    // const requestUser= req.user;

    // // const mail = requestUser;
    // const email = requestUser['email']

    const findUser = await this.userRepo.findOne({ where: { email } });

    if (!findUser) {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }
    // const response = res.send('user found');
    // return {
    //    response
    // }
    const signOptions = {
      expiresIn: '1.5m',
    };
    // const secret = process.env.JWT_SECRET + findUser.password;
    const payload = {
      email: findUser.email,
      id: findUser.id,
    };

    const token = await this.jwtService.signAsync(payload, signOptions);
    const link = `http://localhost:7000/reset-password/${findUser.id}/${token}`;
    console.log(link);

    try {
      await this.mailerService.sendMail({
        to: `${findUser.email}`,
        from: 'System😊😊😊<menace03032001@gmail.com>',
        subject: 'Reset Password link',
        text: `This is your reset password link`,
        html: `<b><a href="${link}">Reset Password link</a></b>`,
      });

      return res.send({
        message: 'a reset password link has been sent to your email',
      });
    } catch (error) {
      res.send(error);
    }
  }

  async resetPassword(
    @Req() req: Request,
    @Res() res: Response,
    payload: ResetPasswordDTO,
  ) {
    const { id, token } = req.params;
    const user = await this.userRepo.findOne({ where: { id: id } });

    if (!user) {
      throw new NotFoundException('invalid id');
    }

    try {
      const verify = this.jwtService.verify(token);

      let verifiedId = verify['id'];
      if (id !== verifiedId) {
        throw new NotFoundException('user id is invalid');
      }

      const { newPassword, confirmPassword } = payload;

      if (newPassword !== confirmPassword) {
        throw new HttpException(
          'Passwords does not match',
          HttpStatus.BAD_REQUEST,
        );
      }

      //   const userNewPassword = user.password = newPassword;
      const hashPassword = await bcrypt.hash(newPassword, 10);
      //   console.log(user);
      user.password = hashPassword;

      //   return await this.userRepo.save(user)
      const resave = await this.userRepo.save(user);

      res.send({
        message: 'password succesfully changed',
      });
    } catch (error) {
      // console.log(error)
      res.send(error);
    }
  }

  googleLogin(req) {
    if (!req.user) {
      return 'No User from google';
    }
    return {
      message: 'User Info from google',
      user: req.user,
    };
  }
}
