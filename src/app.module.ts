import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';


import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import { AuthModule } from './auth/auth.module';
import { LoginProfileModule } from './login-profile/login-profile.module';
import { ManagementModule } from './management/management.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AppThrottlerGuard } from './auth/guards/app-throttler.guard';
import { defaultThrottle } from './config/throttle.config';

@Module({
  
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  
    }),
    ThrottlerModule.forRoot([defaultThrottle]),
    TypeOrmModule.forRoot({
      type: 'mysql',
      // host: process.env.DATABASE_HOST,
      socketPath: process.env.SOCKET_PATH,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),

    TypeOrmModule.forFeature([
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '../static-files'),
      renderPath: 'icatcountryportal',
      exclude: ['/api*'],
      serveStaticOptions: { index: false },
    }),

    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        name: 'unops.org',
        pool: true,
        port: 587,
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: process.env.EMAIL,
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    AuthModule,
    LoginProfileModule,
    ManagementModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    AppService,
  ],
})
export class AppModule { }
