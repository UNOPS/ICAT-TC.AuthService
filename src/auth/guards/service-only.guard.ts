import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { isValidApiKey } from '../utils/api-key.util';

@Injectable()
export class ServiceOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (!isValidApiKey(context.switchToHttp().getRequest())) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
