import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class EmailService{
  constructor(private readonly mailerService: MailerService){}

  async send(to: string, sbj: string, body: string, from: string =  process.env.EMAIL){
    try{
      await this.mailerService
            .sendMail({
                to: to, // list of receivers
                from: from, // sender address
                subject: sbj, // Subject line
                html: body, // HTML body content
            });

    }catch(err){
      throw new InternalServerErrorException(err);
    }
  }
}
