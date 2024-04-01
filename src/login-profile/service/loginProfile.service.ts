import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { LoginProfile, ProfileStatus } from '../entities/loginProfile.entity';
import * as bcript from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatedProfileDto } from 'src/shared/dto/validatedProfile.credential.dto';
import { RoleService } from './role.service';
import { LoginRole, UserType } from '../entities/role.entity';
import { RecordStatus } from 'src/shared/entities/base.tracking.entity';
import { UserService } from 'src/management/service/user.service';
import { CreateUserDto } from 'src/shared/dto/create-user.dto';

@Injectable()
export class LoginProfileService extends TypeOrmCrudService<LoginProfile>{

    constructor(
      private roleService: RoleService,
      @InjectRepository(LoginProfile) repo,

      @InjectRepository(LoginProfile)
      private readonly loginProfileRepository: Repository<LoginProfile>,
      private userService: UserService,
    ) {
      super(repo);
    }


  async seed() {


    const MA_EMAIL = "admin@gmail.com";

    const MA =  await this.find({where:{userName: MA_EMAIL}});
    const MA_R =  await this.roleService.find({where:{code: LoginRole.MASTER_ADMIN}});

    if(MA.length === 0 && MA_R.length > 0){
      const ma = new LoginProfile();
      ma.userName = MA_EMAIL;
      ma.password = "abcd1234";
      ma.userType = MA_R[0];
      const lp = await this.addLoginProfile(ma);

      return {
        id: lp.id, 
        userName: lp.userName
      };
    }

    if(MA.length > 0){
      return {
        id: MA[0].id, 
        userName: MA[0].userName
      };
    }
  }
  async getByEmail(email:string){
    const profile = await this.repo.findOne({ where:{userName: email}});
    return profile;

  }
  async getById(userId:string){
    const user = await this.repo.findOne({where:{id: userId}});
    return user
  }

  async validateLoginProfile(username: string, pass: string): Promise<ValidatedProfileDto> {
    const profile = await this.repo.findOne({where:{userName: username}});
    if(profile && profile.status === RecordStatus.Active && profile.profileState === ProfileStatus.Active){
      const encriptedPass = await bcript.hash(pass, profile.salt);
      if(encriptedPass === profile.password){
        const validatedProfileDto  = new ValidatedProfileDto();
        validatedProfileDto.roles = profile.userType
        validatedProfileDto.username = profile.userName;
        validatedProfileDto.id = profile.id;
        return validatedProfileDto;
      }
      
    }
    return null;
  }

  async updateLoginProfile(dto: LoginProfile): Promise<LoginProfile>{
    if(dto.password){
      const lp = await this.repo.findOne({where:{id:dto.id}});
      dto.password = await this.hashPassword(dto.password, lp.salt);
    }
    return (await this.repo.save( dto));
  }
  async addLoginProfile(createLoginProfileDto: LoginProfile): Promise<LoginProfile>{
    try{
      if(!createLoginProfileDto.userType.id){
        createLoginProfileDto.userType
        let newUserType= new UserType()
        newUserType.id=12;
        createLoginProfileDto.userType =newUserType;
      }
      
      const lp =  await this.loginProfileRepository.save(createLoginProfileDto);
      return lp;
    }catch(err){
      throw new InternalServerErrorException(err.message);
    }
  }

  async markEmailAsConfirmed(email: string,salt:string,password:string) {
    return this.repo.update({ userName:email }, {
      isEmailConfirmed: true,
      salt:salt,
      password:password
    });
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

  public async hashPassword(password: string, salt: string): Promise<string> {
    return await bcript.hash(password, salt);
  }
  private async dhashPassword(password: string): Promise<string> {
    return await bcript.co(password, );
  }

  async isEmailTaken(email: string): Promise<boolean>{
    const userWithEmail = await this.repo.find({where:{userName: email}})    
    return userWithEmail.length > 0;
  }

  async update(id: string, lp: LoginProfile): Promise<void>{
    lp.id = id;
    await this.repo.save(lp);
  }

  async getByUserName(userName: string){
    const profile = await this.repo.findOne({where:{userName: userName}});
    return profile;
  }

  async getByRole(role: UserType){
    let roles = [role.code]
    let data = await this.repo
    .createQueryBuilder("loginProfile")
    .leftJoinAndSelect("loginProfile.roles", "role")
    .where('role.code in (:...roles)',{roles})
    .getMany()

    return data.map(d => {return d.id})
  }

  async isUserAvailable(userName: string): Promise<any> {
    let user = await this.repo.findOne({where:{ userName: userName }});
    if (user) {
      return user;
    } else {
      return user;
    }
  }

}
