import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './Auth/entities/userEntity';
import { AuthModule } from './Auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    AuthModule,
    DatabaseModule,
    MailerModule.forRoot({
      transport:{
        host:'sandbox.smtp.mailtrap.io',
        auth:{
          user:'71df426ad004e2',
          pass:'22cfd87cf31ce0'
        }
      }
    })
  ],
})
export class AppModule {}
