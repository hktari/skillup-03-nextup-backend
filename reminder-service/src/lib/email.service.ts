
import logger from '../logger'
import ConfigService from './config.service';
import { BookingPendingReminder, Event } from './database.interface';

const sgMail = require("@sendgrid/mail");

export interface SendEventReminderResult {
  error?: any,
  booking: BookingPendingReminder,
  event: Event
}
export class EmailService {
  constructor(
    private configService: ConfigService,
  ) {
    sgMail.setApiKey(this.configService.getOrThrow("SENDGRID_API_KEY"));
  }



  sendEventReminder(booking: BookingPendingReminder, event: Event): Promise<SendEventReminderResult> {
    return new Promise((resolve, reject) => {
      const email = booking.user[0].email

      const msg = {
        to: email, // Change to your recipient
        from: this.configService.getOrThrow("SENDGRID_FROM_EMAIL"), // Change to your verified sender
        subject: `Nextup: Upcoming Event Reminder for ${event.title}`,
        html: `Hi there ! We'd like to inform you that the event ${event.title} you booked is happening tomorrow at ${event.datetime}`,
      };

      sgMail
        .send(msg)
        .then(() => {
          logger.debug("Email sent");
          resolve({
            booking,
            event,
          });
        })
        .catch((error: any) => {
          reject({
            booking,
            event,
            error
          });
        });
    });
  }
}
