import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/shared/dto/create-user.dto';
import { getServiceAuthHeaders } from 'src/auth/utils/api-key.util';

const MANAGEMENT_URL = process.env.MAIN_SERVICE_URL;

@Injectable()
export class UserService {
  constructor(private httpService: HttpService) {}

  initMasterAdmin(dto: CreateUserDto, _token: string) {
    const url = `${MANAGEMENT_URL}/users/add-master-admin`;
    this.httpService
      .post(url, dto, { headers: getServiceAuthHeaders() })
      .subscribe();
  }
}
