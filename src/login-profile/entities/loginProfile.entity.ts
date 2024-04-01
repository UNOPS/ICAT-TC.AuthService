import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserType } from "./role.entity";
import { Exclude } from 'class-transformer';


export enum ProfileStatus {    
    InActive = -10,
    Active = 0,
    Resetting = 1,
    BlockedByWrongAttemps = 2,
    OTPValidated = 3,
    OTPFailed = 4
}
@Entity()
export class LoginProfile  extends BaseTrackingEntity{


    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @Column({unique: true})
    userName: string; 

    @Column({default: null, nullable: true })
    password: string;

    @Exclude()
    @Column({default: null, nullable: true })
    salt: string;

    @ManyToOne((type) => UserType, { eager: true })
    @JoinColumn()
    userType: UserType;

    @Column({ default: ProfileStatus.Active })
    profileState: ProfileStatus;

    @Column({default: 0})
    otp: number;

    @Column({default: null, nullable: true })
    otpExpireAt: Date;
    @Column({default: null, nullable: true })
    coutryId: number;
    @Column({default: null, nullable: true })
    insId: number;
    
    @Column({ default: false })
    isEmailConfirmed: boolean;

}


