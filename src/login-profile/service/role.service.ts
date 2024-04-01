import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { LoginRole, UserType } from '../entities/role.entity';

@Injectable()
export class RoleService extends TypeOrmCrudService<UserType> {

  constructor(@InjectRepository(UserType) repo, @InjectRepository(UserType) private readonly roleRepository: Repository<UserType>) {
    super(repo);
  }

  
  async seed() {
    const CA =  await this.repo.find({where:{code: LoginRole.Country_Admin}});    
    if(CA.length === 0){
      await this.addCountryAdmin();
    }

    const Verifier =  await this.repo.find({where:{code: LoginRole.Verifier}});
    if(Verifier.length === 0){
      await this.addVerifier();
    }

    const SA =  await this.repo.find({where:{code: LoginRole.Sector_Admin}});
    if(SA.length === 0){
      await this.addSecAdmin();
    }

    const MA =  await this.repo.find({where:{code: LoginRole.MRV_Admin}});
    if(MA.length === 0){
      await this.addMRVAdmin();
    } 

    const TT =  await this.repo.find({where:{code: LoginRole.Country_Admin}});
    if(TT.length === 0){
      await this.addTTeam();
    } 

    const DCT =  await this.repo.find({where:{code: LoginRole.Data_Collection_Team}});
    if(DCT.length === 0){
      await this.addDCT();
    } 

    const QT =  await this.repo.find({where:{code: LoginRole.QC_Team}});
    if(QT.length === 0){
      await this.addQCTeam();
    } 
    const IA =  await this.repo.find({where:{code: LoginRole.Institution_Admin}});
    if(IA.length === 0){
      await this.addInsAdmin();
    } 

    const DEO =  await this.repo.find({where:{code: LoginRole.Data_Entry_Operator}});
    if(DEO.length === 0){
      await this.addDEO();
    } 
    const MasterAdmin =  await this.repo.find({where:{code: LoginRole.MASTER_ADMIN}});
    if(MasterAdmin.length === 0){
      await this.addMasterAdmin();
    }
  }

  private async addMasterAdmin(){
    const ma = new UserType();
    ma.name = "Master Admin";
    ma.code =LoginRole.MASTER_ADMIN;
    await this.roleRepository.save(ma);
  }
  private async addCountryAdmin(){
    const ma = new UserType();
    ma.name = "Country Admin";
    ma.code =LoginRole.Country_Admin;
    await this.roleRepository.save(ma);
  }
  private async addVerifier(){
    const ma = new UserType();
    ma.name = "Verifier";
    ma.code =LoginRole.Verifier;
    await this.roleRepository.save(ma);
  }
  private async addSecAdmin(){
    const ma = new UserType();
    ma.name = "Sector Admin";
    ma.code =LoginRole.Sector_Admin;
    await this.roleRepository.save(ma);
  }

  private async addMRVAdmin(){
    const ma = new UserType();
    ma.name = "MRV Admin";
    ma.code =LoginRole.MRV_Admin;
    await this.roleRepository.save(ma);
  }

  private async addTTeam(){
    const ma = new UserType();
    ma.name = "Country User";
    ma.code =LoginRole.Country_User;
    await this.roleRepository.save(ma);
  }

  private async addQCTeam(){
    const ma = new UserType();
    ma.name = "QC Team";
    ma.code =LoginRole.QC_Team;
    await this.roleRepository.save(ma);
  }

  private async addInsAdmin(){
    const ma = new UserType();
    ma.name = "Institution Admin";
    ma.code =LoginRole.Institution_Admin;
    await this.roleRepository.save(ma);
  }
  private async addDEO(){
    const ma = new UserType();
    ma.name = "Data Entry Operator";
    ma.code =LoginRole.Data_Entry_Operator;
    await this.roleRepository.save(ma);
  }

  private async addDCT(){
    const ma = new UserType();
    ma.name = "Data Collection Team";
    ma.code =LoginRole.Data_Collection_Team;
    await this.roleRepository.save(ma);
  }

  private async addExternal(){
    const ma = new UserType();
    ma.name = "External";
    ma.code =LoginRole.External;
    await this.roleRepository.save(ma);
  }

}
