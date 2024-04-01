import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum LoginRole {
    MASTER_ADMIN ="Master_Admin",
    Country_Admin = "Country Admin",
    Verifier = "Verifier",
    Sector_Admin = "Sector Admin",
    MRV_Admin = "MRV Admin",
    Country_User = "Country_User",
    Data_Collection_Team = "Data Collection Team",
    QC_Team = "QC Team",
    Institution_Admin ="Institution Admin",
    Data_Entry_Operator ="Data Entry Operator",
    External ="External"
}
@Entity()
export class UserType  extends BaseTrackingEntity{


    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: LoginRole,
      })
    code: string;

}


