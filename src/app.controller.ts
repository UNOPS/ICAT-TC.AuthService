import { Controller, Get, InternalServerErrorException, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/service/auth.service';
import { LoginProfileService } from './login-profile/service/loginProfile.service';
import { RoleService } from './login-profile/service/role.service';
import { ManagementSeedService } from './management/service/managementSeed.service';
import { UserService } from './management/service/user.service';
import { CreateUserDto } from './shared/dto/create-user.dto';
import { ValidatedProfileDto } from './shared/dto/validatedProfile.credential.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private loginProfileService: LoginProfileService,
    private roleService: RoleService,
    private managementSeedService: ManagementSeedService,
    private userService: UserService,
    private authService: AuthService
    ) {}


  @Post('seed-all')
  async seedAll() {
    try{
      const MA_EMAIL = "admin@gmail.com";

      await this.roleService.seed();
      await this.loginProfileService.seed();



      const lp = await this.loginProfileService.getByUserName(MA_EMAIL);

      const vu = new ValidatedProfileDto();
      vu.id = lp.id;
      vu.roles = lp.userType;
      vu.username = lp.userName;

      const loginRes = await this.authService.login(vu);
      
      const token = `Bearer ${loginRes.accessToken}`
      await this.addMasterAdmin(lp.id, MA_EMAIL, token);
      await this.managementSeedService.seed(token);

      return "Done";
    }catch(err){
      throw new InternalServerErrorException(err);
    }
  }


  async addMasterAdmin(lpId: string, email: string, token:string){  

    const u = new CreateUserDto();
    u.email = email;
    u.firstName = "Master";
    u.lastName = "Admin";
    u.loginProfile = lpId;
    u.telephone="";
    await this.userService.initMasterAdmin(u, token);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
