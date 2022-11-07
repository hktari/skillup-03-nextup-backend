
import logger from '../logger'
import ConfigService from './config.service';

const sgMail = require("@sendgrid/mail");

export class EmailService {
  constructor(
    private configService: ConfigService,
  ) {
    sgMail.setApiKey(this.configService.getOrThrow("SENDGRID_API_KEY"));
  }

  sendEventReminder(email: string) {
    return new Promise((resolve, reject) => {
      const msg = {
        to: email, // Change to your recipient
        from: this.configService.getOrThrow("SENDGRID_FROM_EMAIL"), // Change to your verified sender
        subject: "Nextup: Upcoming Event Reminder",
        text: "The event you booked is happening tomorrow.",
        html: `<strong>...</strong>`,
      };
      sgMail
        .send(msg)
        .then(() => {
          logger.debug("Email sent");
          resolve(true);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }
}
