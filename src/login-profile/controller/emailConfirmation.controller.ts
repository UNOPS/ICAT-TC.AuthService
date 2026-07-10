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
import { Public } from 'src/auth/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { strictThrottle } from 'src/config/throttle.config';

@ApiTags('email-confirmation')
@Controller('email-confirmation')
@UseInterceptors(ClassSerializerInterceptor)
export class EmailConfirmationController  {
    
    constructor(
        private readonly emailConfirmationService: EmailConfirmationService
    ) { }

    
    @Public()
    @Throttle(strictThrottle)
    @Post('resend-confirmation-link')
  async resendConfirmationLink(@Req() request: LoginProfile) {
    await this.emailConfirmationService.resendConfirmationLink(request.id);
  }
  

    @Public()
    @Get('confirm')
    async confirm(@Query('token') token:string) {
        const email = await this.emailConfirmationService.decodeConfirmationToken(token);
        return await this.emailConfirmationService.confirmEmail(email);
    }
    

}