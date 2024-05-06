import { Controller, Request, Post, UseGuards, Body, Query } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthCredentialDto } from '../dto/auth.credential.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { ValidatedProfileDto } from 'src/shared/dto/validatedProfile.credential.dto';
import { LoginRes } from 'src/shared/dto/loginRes.dto';
import { RefreshReqRes } from '../dto/refreshReqRes.dto';
import { ResetRes } from '../dto/resetRes.dto';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { LoginProfileService } from 'src/login-profile/service/loginProfile.service';
import { HttpService } from '@nestjs/axios';

@Controller('auth')
export class AuthController {

    public auditlogURL = process.env.AUDIT_URL + '/audit/log'

    username: string;
    audit2 :any
    constructor(public authService: AuthService,
        private loginProfileService: LoginProfileService,
        private httpService: HttpService
    ) { }


    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ApiCreatedResponse({type: LoginRes})
    async login(@Body() body: AuthCredentialDto, @Request() req: {user: ValidatedProfileDto}): Promise<LoginRes> {
      
        this.username = body.username;
        let user = await this.loginProfileService.findOne({ where: { userName: req.user.username } })
        let userType: string

        let type = UserTypes.find(o => o.name === user.userType.name)
        if (type) {
            userType = type.code
        } else {
            userType = user.userType.name
        }
     
        let _body = {
            description: "User login",
            userName: body.username,
            actionStatus: body.username + " is logged",
            userType: userType,
            uuId: user.userType.id,
            institutionId: user.insId,
            countryId: user.coutryId
        }
        this.log(_body)

        return this.authService.login(req.user);
    }

    
    @UseGuards(JwtAuthGuard)
    @Post('refresh')
    async refresh(@Body() body: RefreshReqRes, @Request() req: {user: ValidatedProfileDto}){
        return this.authService.refresh(body, req.user);
    }

    
    @Post('forgot-password')
    @ApiCreatedResponse({ type: LoginRes })
    async forgotPassword(
        @Query('userName') userName: string,
        @Query('firstName') firstName: string
    ): Promise<ResetRes> {
        try {
            const isSentOTP = await this.authService.forgotPasswordRequest(userName, firstName);
            if (isSentOTP) {
                const res = new ResetRes();
                res.status = true;
                res.message = "Plese check your email";
                return res;
            } else {
                const res = new ResetRes();
                res.status = false;
                res.message = "Invalid email or account is blocked";
                return res;
            }
        } catch (err) {
            const res = new ResetRes();
            res.status = false;
            res.message = "Invalid email or account is blocked";
            return res;
        }
    }

    @Post('check-otp')
    @ApiCreatedResponse({type: LoginRes})
    async submitOTP(@Query('userName') userName: string, @Query('otp') otp: number): Promise<ResetRes>{
        try{        
            const isValid = await this.authService.checkOTP(userName, parseInt(otp.toString()))
            const res = new ResetRes();            
            if(!isValid.status){
                res.status = false;
                res.message = isValid.message
            }else{
                res.status = true;
                res.message = "OTP validated"
            }
            return res;
        }catch(err){
            const res = new ResetRes();
            res.status = false;
            res.message = "Failed to validate OTP";
            return res;
        }
    }
    @Post('reset-password')
    @ApiCreatedResponse({type: LoginRes})
    async resetPassword(@Body() body: AuthCredentialDto): Promise<ResetRes>{
        try{
            const isReset = await this.authService.reset(body.username, body.password);
            const res = new ResetRes();            
            if(!isReset){
                res.status = false;
                res.message = "Please check the OTP"
            }else{
                res.status = true;
                res.message = "Reset succesfully"
            }
            return res;
        }catch(err){
            const res = new ResetRes();
            res.status = false;
            res.message = "Failed to reset password";
            return res;
        }
    }


    @Post('reset-own-password')
    @ApiCreatedResponse({type: ResetRes})
    async resetOWnPassword(@Body() body: AuthCredentialDto): Promise<ResetRes>{
        try{
            const isReset = await this.authService.resetOwn(body.username, body.password,body.code);
            const res = new ResetRes();            
            if(!isReset){
                res.status = false;
                res.message = "Please check the OTP"
            }else{
                res.status = true;
                res.message = "Reset succesfully"
                res.data = isReset;
            }
            return res;
        }catch(err){
            const res = new ResetRes();
            res.status = false;
            res.message = "Failed to reset password";
            return res;
        }
    }

    log(body: any) {
        try {
            this.httpService.post(this.auditlogURL, body).subscribe(rr => { })
        } catch (err) {
            console.log("audit arror",err)
        }
    }

}

export enum UserTypesEnum {
    COUNTRY_ADMIN = "COUNTRY_ADMIN",
    COUNTRY_USER = "COUNTRY_USER",
    MASTER_ADMIN = "MASTER_ADMIN",
    EXTERNAL = "EXTERNAL"
}

export const UserTypes =  [
    {name: "Country Admin", code: UserTypesEnum.COUNTRY_ADMIN},
    {name: "Country User", code: UserTypesEnum.COUNTRY_USER},
    {name: "Master Admin", code: UserTypesEnum.MASTER_ADMIN},
    {name: "External", code: UserTypesEnum.EXTERNAL}
]