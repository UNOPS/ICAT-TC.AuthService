import {
    Controller,
    ClassSerializerInterceptor,
    UseInterceptors,
    Post,
    Req,
    Get,
    Query,
} from '@nestjs/common';
import { EmailConfirmationService } from '../service/emailConfirmation.service';
import { LoginProfile } from '../entities/loginProfile.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('email-confirmation')
@Controller('email-confirmation')
@UseInterceptors(ClassSerializerInterceptor)
export class EmailConfirmationController  {
    
    constructor(
        private readonly emailConfirmationService: EmailConfirmationService
    ) { }

    
    @Post('resend-confirmation-link')
  async resendConfirmationLink(@Req() request: LoginProfile) {
    await this.emailConfirmationService.resendConfirmationLink(request.id);
  }
  

    @Get('confirm')
    async confirm(@Query('token') token:string) {
        const email = await this.emailConfirmationService.decodeConfirmationToken(token);
        return await this.emailConfirmationService.confirmEmail(email);
    }
    

}