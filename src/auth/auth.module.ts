import { forwardRef, Module } from '@nestjs/common';
import { LoginProfileModule } from 'src/login-profile/login-profile.module';
import { AuthService } from './service/auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './controller/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailService } from 'src/shared/email.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';


@Module({
  controllers:[AuthController],
  imports:[  
    ConfigModule.forRoot({
      isGlobal: true,  
    }),      
    forwardRef(() => LoginProfileModule),
    PassportModule,
    HttpModule,
    JwtModule.register({
      secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
      signOptions: { expiresIn: process.env.JWT_VERIFICATION_TOKEN_EXPIRATION_TIME },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, EmailService,ConfigService],
  exports: [AuthService]
})
export class AuthModule {}
