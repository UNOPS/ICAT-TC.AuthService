import { LoginRole, UserType } from "src/login-profile/entities/role.entity";

export class LoginRes{
    constructor() {}
    accessToken: string;
    refreshToken: string;
    loginProfileId: string;
    roles: UserType;
    isEmailConfirmed:boolean;
}