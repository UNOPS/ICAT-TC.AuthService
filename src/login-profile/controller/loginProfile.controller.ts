import { Controller, Request, Post, Get, Body, Patch, InternalServerErrorException, Delete, Query, HttpException, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Crud, CrudController, CrudRequest, Override, ParsedBody, ParsedRequest } from '@nestjsx/crud';
import { LoginProfile } from '../entities/loginProfile.entity';
import { LoginProfileService } from '../service/loginProfile.service';
import { RecordStatus } from 'src/shared/entities/base.tracking.entity';
import { RoleService } from '../service/role.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailConfirmationService } from '../service/emailConfirmation.service';
import axios from 'axios';
import { UserType } from '../entities/role.entity';
import { Public } from 'src/auth/decorators/public.decorator';
import { getServiceAuthHeaders } from 'src/auth/utils/api-key.util';
import { ProductionDisabledGuard } from 'src/auth/guards/production-disabled.guard';
import { ServiceAuth } from 'src/auth/decorators/service-auth.decorator';
import { ServiceOnlyGuard } from 'src/auth/guards/service-only.guard';
import {
  authThrottle,
  strictThrottle,
} from 'src/config/throttle.config';



@Crud({
  model: {
    type: LoginProfile,
  },
  query: {
    join: {
      roles: {
        eager: true
      }
    },
  },
})

@Controller('login-profile')
export class LoginProfileController implements CrudController<LoginProfile> {

  constructor(
    public service: LoginProfileService,
    public roleService: RoleService,
    private readonly emailConfirmationService: EmailConfirmationService,
    @InjectRepository(LoginProfile)
    private readonly userRepository: Repository<LoginProfile>,
  ) { }

  get base(): CrudController<LoginProfile> {
    return this;
  }

  @UseGuards(ProductionDisabledGuard)
  @Post('seed')
  async seed() {
    return await this.service.seed();
  }

  @Get('by-id')
  async getById(@Query('id') id: string) {
    try {
      const lp = await this.service.findOne({ where: { id: id } });
      return lp;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  @Get('get-by-role')
  async getByRole(@Query('role') role: string) {
    try {
      const roles = await this.roleService.findOne({ where: { code: role } })
      const lp = await this.service.getByRole(roles)
      return lp;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  @Get('updateStatus')
  async updateStatus(@Query('role') id: string) {
    try {
      const lp = await this.service.findOne({ where: { id: id } })

      if (lp.status == 0) {
        lp.status = -10;
        this.service.update(lp.id, lp);
        return lp;
      }
      if (lp.status == -10) {
        lp.status = 0;
        this.service.update(lp.id, lp);
        return lp;
      }



    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }


  @Public()
  @Throttle(strictThrottle)
  @Post('createuser')
  async create(
    @Body() createLoginProfileDto: LoginProfile): Promise<LoginProfile> {
    try {
      const isEmailTaken = await this.service.isEmailTaken(createLoginProfileDto.userName);
      if (isEmailTaken) {
        throw new HttpException("Email is already taken!!", HttpStatus.BAD_REQUEST);
      }
      const lp = await this.service.addLoginProfile(createLoginProfileDto);
      let t = await this.emailConfirmationService.sendVerificationLink(createLoginProfileDto.userName);
      return lp;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException("Could not create the login for this email");
    }
  }

  @ServiceAuth()
  @UseGuards(ServiceOnlyGuard)
  @Post('syncuser')
  async syncCountry(
    @Body() dto: any,
  ): Promise<any> {
    const MainMethURL = process.env.MAIN_SERVICE_URL;
    try {
      const isEmailTaken = await this.service.isEmailTaken(dto.username);
      if (isEmailTaken) {
        let oldUser = await this.userRepository.findOne({ where: { userName: dto.username } })
        oldUser.status = dto.status;
        if (oldUser.coutryId == dto.country.id && oldUser.userType.id == 1) {
          await this.userRepository.save(oldUser);
          await axios.post(MainMethURL + '/users/syncuser', dto, {
            headers: getServiceAuthHeaders(),
          });
        }
        return { status: 'updated' };
      }
      if (dto.status !== RecordStatus.Active) {
        return { status: 'skipped' };
      }

      let ut = new UserType();
      ut.id = 1
      const response = await axios.post(MainMethURL + '/institution/syncins', dto, {
        headers: getServiceAuthHeaders(),
      });
      let data = new LoginProfile();
      data.id = dto.uniqueIdentification;
      data.userName = dto.username;
      data.coutryId = dto.country.id;
      data.status = dto.status;
      data.userType = ut;
      data.isEmailConfirmed = false;
      data.insId = await response.data.id;

      const lp = await this.service.addLoginProfile(data);
      await this.emailConfirmationService.sendVerificationLink(data.userName);

      dto.id = lp.id;
      dto.ins = response.data;
      dto.userType = ut;
      await axios.post(MainMethURL + '/users/syncuser', dto, {
        headers: getServiceAuthHeaders(),
      });
      return { status: 'created' };
    } catch (err) {
      throw new InternalServerErrorException('Failed to sync user ' + dto?.username + ': ' + (err?.message ?? err));
    }
  }

  @Patch('update')
  async updateOneLoginProfile(@Body() dto: LoginProfile): Promise<LoginProfile> {
    try {
      const lp = await this.service.findOne({ where: { id: dto.id } });
      if (lp.userName !== dto.userName) {
        const isEmailTaken = await this.service.isEmailTaken(dto.userName);
        if (isEmailTaken) {
          throw new InternalServerErrorException("Email is already taken!!");
        }
      }
      return await this.service.updateLoginProfile(dto);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  @Delete('remove')
  async remove(@Query('id') id: string): Promise<LoginProfile> {
    try {
      const lp = await this.service.findOne({ where: { id: id } });
      lp.status = RecordStatus.Deleted;
      delete lp.password;
      return await this.service.updateLoginProfile(lp);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  @ServiceAuth()
  @UseGuards(ServiceOnlyGuard)
  @Post('admin-reset')
  async adminReset(@Body() body: { userName: string }) {
    const lp = await this.service.getByUserName(body.userName);
    if (!lp || lp.status !== RecordStatus.Active) {
      throw new HttpException('No active login found for this user', HttpStatus.NOT_FOUND);
    }
    await this.emailConfirmationService.sendTemporaryCode(lp.userName, 'Reset your TC toolkit password');
    return { status: true };
  }

  @ServiceAuth()
  @UseGuards(ServiceOnlyGuard)
  @Delete('admin-delete')
  async adminDelete(@Query('id') id: string) {
    await this.service.hardDelete(id);
    return { status: true };
  }

  @Patch('chage-state')
  async changeState(
    @Query('id') id: string,
    @Query('profileState') profileState: string
  ) {
    try {
      const lp = await this.service.findOne({ where: { id: id } });

    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  @Public()
  @Throttle(authThrottle)
  @Get('isUserAvailable/:userName')
  async isUserAvailable(@Param('userName') userName: string): Promise<boolean> {
    return await this.service.isUserAvailable(userName);
  }
}