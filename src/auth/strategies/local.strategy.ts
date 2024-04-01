import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { ValidatedProfileDto } from 'src/shared/dto/validatedProfile.credential.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string) {
    const loginProfile = await this.authService.validateLoginProfile(username, password);
    if (!loginProfile) {
      throw new UnauthorizedException();
    }
    return loginProfile;
  }
}