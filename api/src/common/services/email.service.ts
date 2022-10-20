import { ConsoleLogger, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ILoggerServiceToken } from "../../logger/winston-logger.service";

const sgMail = require("@sendgrid/mail");

@Injectable()
export class EmailService {
  constructor(
    private configService: ConfigService,
    @Inject(ILoggerServiceToken) private logger: ConsoleLogger
  ) {
    sgMail.setApiKey(this.configService.getOrThrow("SENDGRID_API_KEY"));
  }

  sendPasswordReset(email: string, token: string) {
    return new Promise((resolve, reject) => {
      const resetUrl = "http://localhost:3000/password-reset/" + token;
      const msg = {
        to: email, // Change to your recipient
        from: this.configService.getOrThrow("SENDGRID_FROM_EMAIL"), // Change to your verified sender
        subject: "Nextup: Password Reset Requested",
        text: "Password reset has been requested for your Nextup account registered with this email.",
        html: `<strong>click here to reset your password <href src="${resetUrl}">${resetUrl}/></strong>`,
      };
      sgMail
        .send(msg)
        .then(() => {
          this.logger.debug("Email sent");
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
