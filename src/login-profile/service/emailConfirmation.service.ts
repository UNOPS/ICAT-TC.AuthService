import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import VerificationTokenPayload from '../dto/verificationTokenPayload.interface';
import { EmailService } from 'src/shared/email.service';
import { LoginProfileService } from './loginProfile.service';
const { v4: uuidv4 } = require('uuid');
import * as bcript from 'bcrypt';
@Injectable()
export class EmailConfirmationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly loginProfileService: LoginProfileService,
  ) { }

  public sendVerificationLink(email: string) {
    const payload: VerificationTokenPayload = { email };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
      expiresIn: process.env.JWT_VERIFICATION_TOKEN_EXPIRATION_TIME,
    });

    const url = process.env.EMAIL_CONFIRMATION_URL + `?token=${token}`; 
    const text = `Welcome to the application. To confirm the email address please, <a href="${url}">click here</a>`;
    return this.emailService.send(
      email,
      'Email confirmation ',
      text,
    )
  }
  public async decodeConfirmationToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token, {
        secret:  process.env.JWT_VERIFICATION_TOKEN_SECRET,
      });

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad confirmation token');
    }
  }
  public async confirmEmail(email: string) {
   
    const user = await this.loginProfileService.getByEmail(email);
    if (user.isEmailConfirmed) {
      let url =process.env.WEB_SERVER_LOGIN; 
      return  ` 
      <!DOCTYPE html>
        <html>
        <head>
        <style>
        body{
          background-color:#e9ecef;
        }
        div {
          margin: 120px;
        }
        </style>
        </head>
        <body>
        <div><h2>Email is already confirmed, <a style="margin top:50px" href="${url}">Please click here to login</a></h2></div>
        </body>
        </html>`

    }
    else {
      let url = process.env.WEB_SERVER_RESET_PASSWORD; 
      const salt = await bcript.genSalt(10);
      let newUUID = uuidv4();
      let newPassword = ('' + newUUID).substr(0, 6);
      let sal = salt.toString();
      let password =newPassword;
      password = await this.loginProfileService.hashPassword(password, salt);
      await this.loginProfileService.markEmailAsConfirmed(email,sal, password);

      var template =
      'Dear ' +
      ' <br/>Your username is ' +
      email +
      ' <br/> your code is : ' +
      newPassword +
      ' <br/>System Reset password url is' + ' <a href="' + url + '">' + url + '</a>' +
      '<br/>' +
      '<br/>Best regards' +
      '<br/>Software support team';

      this.emailService.send(
        email,
        'Your credentials for TC-TOOL system',
        template,
      );
      return `<!DOCTYPE html>
      <html>
      <head>
      <style>
      body{
        background-color:#e9ecef;
      }
      div {
        margin: 120px;
      }
      </style>
      </head>
      <body>
      <div><h2>Successfully verified email, <a style="margin top:50px" href="${url}">Please click here to login</a></h2></div>
      <div></div>
      <div><h3>We have sent an email with information to reset your password. Please check your email. </h3></div>
      </body>
      </html>` 
    }

  }
  public async resendConfirmationLink(userId: any) {

    const MainMethURL =  process.env.MAIN_SERVICE_URL ;
    const user = await this.loginProfileService.getById(userId);
    if (user.isEmailConfirmed) {
      return ` 
      <!DOCTYPE html>
        <html>
        <head>
        <style>
        body{
          background-color:#e9ecef;
        }
        div {
          margin: 120px;
        }
        </style>
        </head>
        <body>
        <div><h2>Email is already confirmed, <a style="margin top:50px" href="${MainMethURL} /country/auth/login">Please click here to login</a></h2></div>
        </body>
        </html>`
    }
    await this.sendVerificationLink(user.userName);
  }

}