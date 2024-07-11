import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ManagementModule } from 'src/management/management.module';
import { LoginProfileController } from './controller/loginProfile.controller';
import { RoleController } from './controller/role.controller';
import { LoginProfile } from './entities/loginProfile.entity';
import { UserType } from './entities/role.entity';
import { LoginProfileService } from './service/loginProfile.service';
import { RoleService } from './service/role.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/shared/email.service';
import { EmailConfirmationService } from './service/emailConfirmation.service';
import { EmailConfirmationController } from './controller/emailConfirmation.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  
    }),  
    TypeOrmModule.forFeature([
      LoginProfile,
      UserType
    ]),    
    HttpModule,
    forwardRef(() => AuthModule),
    ManagementModule
  ],
  providers: [LoginProfileService, RoleService,JwtService,ConfigService,EmailService,EmailConfirmationService,HttpModule],
  exports: [LoginProfileService, RoleService],
  controllers: [RoleController, LoginProfileController,EmailConfirmationController]
})
export class LoginProfileModule {}
