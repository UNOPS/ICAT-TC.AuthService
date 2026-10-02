import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import VerificationTokenPayload from '../dto/verificationTokenPayload.interface';
import { EmailService } from 'src/shared/email.service';
import { LoginProfileService } from './loginProfile.service';
const { v4: uuidv4 } = require('uuid');
import * as bcript from 'bcrypt';
import { HttpService } from '@nestjs/axios';
import { getServiceAuthHeaders } from 'src/auth/utils/api-key.util';
@Injectable()
export class EmailConfirmationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private httpService: HttpService,
    private readonly loginProfileService: LoginProfileService,
  ) { }

  public async sendVerificationLink(email: string) {
    const payload: VerificationTokenPayload = { email };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
      expiresIn: process.env.INVITE_TOKEN_EXPIRATION_TIME || '7d',
    });

    const url = process.env.EMAIL_CONFIRMATION_URL + `?token=${token}`;
    const text =
      'Dear user,' +
      '<br><br>An account has been created for you in the TC toolkit.' +
      `<br/>To confirm your email address and receive your login code, <a href="${url}">click here</a>.` +
      '<br/>This link is valid for 7 days. If it has expired, please ask your TC toolkit administrator to send you a new invite.' +
      '<br/><br/>If you were not expecting this email, please ignore it.'
      +
      '<br/><br/>Best regards,' +
      '<br/>Software support team';
    return this.emailService.send(
      email,
      'Your TC toolkit invitation',
      text,
    )
  }

  public async sendTemporaryCode(email: string, subject: string) {
    const salt = await bcript.genSalt(10);
    const code = ('' + uuidv4()).substr(0, 6);
    const password = await this.loginProfileService.hashPassword(code, salt);
    await this.loginProfileService.markEmailAsConfirmed(email, salt.toString(), password);

    const fullUrl = process.env.MAIN_HOST + '/users/findUserByEmail/' + email;
    const user = await (await this.httpService.get(fullUrl, { headers: getServiceAuthHeaders() }).toPromise()).data;
    const name = user ? user.firstName + ' ' + user.lastName : 'user';
    const url = process.env.WEB_SERVER_RESET_PASSWORD + '?email=' + encodeURIComponent(email);

    const template =
      'Dear ' + name + ',' +
      ' <br/><br/>Your username : ' + email +
      ' <br/> Your code : ' + code +
      ' <br/><br/>To set your password, please visit the following link and enter the code above : ' + ' <a href="' + url + '">' + 'Set password.' + '</a>' +
      '<br/>' +
      '<br/>Best regards,' +
      '<br/>Software support team';

    await this.emailService.send(email, subject, template);
  }

  public async decodeConfirmationToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
      });

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('This invitation link has expired. Please ask your TC toolkit administrator to send you a new invite.');
      }
      throw new BadRequestException('This invitation link is not valid. Please ask your TC toolkit administrator to send you a new invite.');
    }
  }
  public async confirmEmail(email: string) {

    const user = await this.loginProfileService.getByEmail(email);
    if (!user) {
      return this.messagePage('This account no longer exists. Please contact your TC toolkit administrator.');
    }
    if (user.isEmailConfirmed) {
      let url = process.env.WEB_SERVER_LOGIN;
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
        <div><h2>Email is already confirmed, <a style="margin top:50px" href="${url}">Please click here to login</a></h2></div>
        </body>
        </html>`

    }
    else {
      let url = process.env.WEB_SERVER_RESET_PASSWORD + '?email=' + encodeURIComponent(email);
      await this.sendTemporaryCode(email, 'Your credentials for TC toolkit');
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
      <div><h2>Successfully verified email, <a style="margin top:50px" href="${url}">please click here to set your password</a></h2></div>
      <div></div>
      <div><h3>We have sent you an email with your login code. Please check your email.</h3></div>
      </body>
      </html>`
    }

  }
  public messagePage(message: string) {
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
      <div><h2>${message}</h2></div>
      </body>
      </html>`;
  }

  public async resendConfirmationLink(userId: any) {

    const MainMethURL = process.env.MAIN_SERVICE_URL;
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