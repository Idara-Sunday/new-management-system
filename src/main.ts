import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import  * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe(
    { transform: true,
      whitelist : true
    }
  )); 
  app.use(session({
    secret:'gogo',
    saveUninitialized:false,
    resave:false,
    cookie:{
      maxAge:1200000000
    } 
  }));
  app.use(passport.initialize());
  app.use(passport.session())
  app.enableCors({
    origin: 'http://localhost:3000'
  })
  app.setGlobalPrefix('api/v1',{exclude:['auth/google/login','auth/google/callback']})
  const Port = process.env.LISTENING_PORT || 9000
  await app.listen(Port, ()=> console.log(`listening on port:${Port}`));
}
bootstrap();
  