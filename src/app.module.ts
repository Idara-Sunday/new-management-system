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
        host:process.env.MAIL_HOST ,
        auth:{
          user:process.env.MAIL_USER ,
          pass:process.env.MAIL_PASS
        }
      }
    })
  ],
})
export class AppModule {}
