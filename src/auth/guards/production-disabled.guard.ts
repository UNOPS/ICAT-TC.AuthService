import {
  CanActivate,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ProductionDisabledGuard implements CanActivate {
  canActivate(): boolean {
    if (process.env.NODE_ENV === 'production') {
      throw new NotFoundException();
    }

    return true;
  }
}
