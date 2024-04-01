import { UserType } from "src/login-profile/entities/role.entity";

export class ValidatedProfileDto {
    id: string;
    username: string;
    roles: UserType;
    coutryId: number;
    insId: number;
}