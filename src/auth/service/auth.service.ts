import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ProfileStatus } from 'src/login-profile/entities/loginProfile.entity';
import { LoginProfileService } from 'src/login-profile/service/loginProfile.service';
import { LoginRes } from 'src/shared/dto/loginRes.dto';
import { ValidatedProfileDto } from 'src/shared/dto/validatedProfile.credential.dto';
import { EmailService } from 'src/shared/email.service';
import { RecordStatus } from 'src/shared/entities/base.tracking.entity';
import { jwtConstants } from '../constants';
import { RefreshReqRes } from '../dto/refreshReqRes.dto';
import * as bcript from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

  constructor(
    private loginProfileService: LoginProfileService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
  }

  async validateLoginProfile(username: string, pass: string): Promise<ValidatedProfileDto> {
    return await this.loginProfileService.validateLoginProfile(username, pass);
  }

  private getAcceesToken(payload: any): string {
    return this.jwtService.sign(payload);
  }

  private getRefreshToken(payload: any) {
    return this.jwtService.sign({ ...payload, refresh: true }, { expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME, secret: process.env.JWT_REFRESH_KEY });
  }

  private async validate(token: string) {
    const res = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_REFRESH_KEY });
    return true;
  }

  async refresh(refreshReq: RefreshReqRes, loginProfile: ValidatedProfileDto): Promise<RefreshReqRes> {
    const isValid = await this.validate(refreshReq.token);
    if (isValid) {
      const payload = {
        username: loginProfile.username,
        sub: loginProfile.id,
        roles: loginProfile.roles
      };
      refreshReq.token = this.getAcceesToken(payload)
      return refreshReq;
    } else {
      throw new UnauthorizedException();
    }
  }

  async login(loginProfile: ValidatedProfileDto): Promise<LoginRes> {


    try {
      const user = await this.loginProfileService.findOne({ where: { userName: loginProfile.username } });
      let conID = 0;
      if (!user.coutryId) {
        user.coutryId = 1;
        user.insId = 1;
        conID = 0;
      }
      else {
        conID = user.coutryId
      }



      let fullUrl =process.env.MAIN_HOST+ '/country/country1?countryId=' + user.coutryId;
      let sec = new Array();
      const country = await (await this.httpService.get(fullUrl).toPromise()).data;

      if (country.countrysector.length > 0) {
        for await (let s of country.countrysector) {
          sec.push(s.id)
        }
      }


      const payload = {
        username: loginProfile.username,
        sub: loginProfile.id,
        role: loginProfile.roles,
        countryId: conID,
        insId: user.insId,
        sectorId: sec,
      };


      if (user.isEmailConfirmed) {
        return {
          accessToken: this.getAcceesToken(payload),
          refreshToken: this.getRefreshToken(payload),
          loginProfileId: loginProfile.id,
          roles: loginProfile.roles,
          isEmailConfirmed: user.isEmailConfirmed
        };
      }
      else {
        return {
          accessToken: '',
          refreshToken: '',
          loginProfileId: '',
          roles: loginProfile.roles,
          isEmailConfirmed: user.isEmailConfirmed
        };
      }
    }
    catch (error) {
      throw new InternalServerErrorException(error);
    }



  }

  async forgotPasswordRequest(userName: string, firstName: string): Promise<boolean> {
    try {

      const profile = await this.loginProfileService.getByUserName(userName);
      if ((profile.profileState === ProfileStatus.Active || profile.profileState === ProfileStatus.Resetting) && profile.status === RecordStatus.Active) {
        profile.profileState = ProfileStatus.Resetting;
        profile.otp = this.getOTP(1000, 9999);
        profile.otpExpireAt = new Date(new Date().getTime() + 5 * 60000);
        this.loginProfileService.update(profile.id,profile)

        let emailTemplate = ' <p>Dear ' + firstName + ',</p>' +
          '<p>' +
          'You recently requested to reset the password for your account in TC toolkit. Here is your OTP : ' + profile.otp + '.' +
          '<br/><br/>If you did not request a password reset, please ignore this email. ' +
          '</p>' +
          '<p> Best regards,<br/>' +
          '<p>Software support team</p>';

        this.emailService.send(userName, 'OTP for password reset', emailTemplate);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async checkOTP(userName: string, otp: number): Promise<{ status: boolean, message: string }> {
    const profile = await this.loginProfileService.getByUserName(userName);
    let now = new Date();
    let exp = profile.otpExpireAt;
    let diff = exp.getTime() - now.getTime();
    if (profile.profileState === ProfileStatus.Resetting && profile.otp === otp && diff > 0) {
      profile.otp = 0;
      profile.profileState = ProfileStatus.OTPValidated;
      await this.loginProfileService.update(profile.id, profile);
      return { status: true, message: '' };
    } else {
      let m = "";
      if (profile.otp !== otp) {
        m = "OTP is not matching"
      } else if (diff < 0) {
        m = "OTP is expired"
      }
      return { status: false, message: m };
    }
  }

  async reset(username: string, pass: string) {
    const profile = await this.loginProfileService.getByUserName(username);
    if (profile.profileState === ProfileStatus.OTPValidated) {
      profile.password = pass;
      profile.profileState = ProfileStatus.Active;
      await this.loginProfileService.updateLoginProfile(profile);
      return true;
    }

    return false;
  }


  async resetOwn(username: string, pass: string, code: string) {
    const profile = await this.loginProfileService.getByUserName(username);
    const hashPassword = await bcript.hash(code, profile.salt);
    let fullUrl =process.env.MAIN_HOST+ '/users/findUserByEmail/' + username;

    const user = await (await this.httpService.get(fullUrl).toPromise()).data;
    console.log(user)

    if (hashPassword == profile.password) {
      profile.password = pass;
      profile.profileState = ProfileStatus.Active;
      await this.loginProfileService.updateLoginProfile(profile);
      let url = `${this.configService.get('WEB_SERVER_LOGIN')}`;
      var template =
        'Dear ' + user.firstName + " " + user.lastName + ","+
        ' <br/><br/>Your username  : ' + username +
        '<br/> Your login password : ' + pass +

        ' <br/><br/>To log in to the system, please visit the following link : ' + ' <a href="' + url + '">' + 'System login.' + '</a>'+
        '<br/><br/>Best regards, <br/>Software support team';

      this.emailService.send(
        username,
        'Your credentials for TC toolkit',
        template,
      );
      return true;
    }

    return false;
  }

  getOTP(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
}