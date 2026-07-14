import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) { }

  async send(to: string, sbj: string, body: string, from: string = process.env.EMAIL) {
    try {
      await this.mailerService
        .sendMail({
          to: to, // list of receivers
          from: from, // sender address
          subject: sbj, // Subject line
          html: body, // HTML body content
        });

    } catch (err) {
      this.logger.error(
        `Failed to send email to ${to} ("${sbj}"): ${err?.message ?? err}`,
      );
    }
  }
}
