import logger from './logger'
import ConfigService from './lib/config.service';
import { EmailService } from './lib/email.service';

function main() {
    logger.info('reminder service start');

    const config = new ConfigService()
    const emailService = new EmailService(config)
    emailService.sendEventReminder('bkamnik1995@gmail.com')
    // todo:
    // 1. connect to the database and get all events which are to occur tomorrow
    // 2. for each event, get all the bookings
    // 3. for each booking, check if an email hasn't been sent yet, send email reminding the user about the event


    logger.debug('debugging')

    logger.info('reminder service end');
}

main();

export default main;
