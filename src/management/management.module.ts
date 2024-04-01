import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ManagementSeedService } from './service/managementSeed.service';
import { UserService } from './service/user.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  
    }), 
    HttpModule],
  providers: [UserService, ManagementSeedService],
  exports: [UserService, ManagementSeedService]
})
export class ManagementModule {}
