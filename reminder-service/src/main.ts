import logger from './logger'
import ConfigService from './lib/config.service';
import { EmailService } from './lib/email.service';
import DatabaseService from './lib/database.service';



async function main() {
    logger.info('reminder service start');

    const config = new ConfigService()
    const emailService = new EmailService(config)
    const dbService = new DatabaseService(config)
    // emailService.sendEventReminder('bkamnik1995@gmail.com')
    // todo:
    // 1. connect to the database and get all events which are to occur tomorrow
    // 2. for each event, get all the bookings

    logger.debug('retrieving events...')
    const events = await dbService.getEvents()
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 2)
    tomorrow.setUTCHours(0)
    tomorrow.setUTCMinutes(0)

    const sendEmailPromises = []
    for (const event of events.documents) {
        logger.debug(`considering event: id: ${event.eventId}\ttitle:${event.title}`)
        const eventDatetime = new Date(event.datetime)
        logger.debug('event datetime: ' + eventDatetime)
        if (eventDatetime >= today && eventDatetime <= tomorrow) {
            logger.info('pending event tomorrow')

            const bookingsPendingReminder = await dbService.getBookingsForEventPendingReminder(event.eventId)
            logger.debug(`queueing ${bookingsPendingReminder.documents.length} emails to be sent`)
            for (const booking of bookingsPendingReminder.documents) {
                sendEmailPromises.push(emailService.sendEventReminder(booking, event))
            }
        }
    }

    logger.info('sending emails...')

    const results = await Promise.allSettled(sendEmailPromises)

    logger.info('processing results...')
    for (const result of results) {
        if(result.status === 'fulfilled'){
            logger.info(`ok: ${result.value.booking._id}\t${result.value.booking?.user[0]?.email}`)
            // todo: set booking.reminderSentDatetime
        }else{
            logger.error('failed', result.reason.error)
        }
    }
    logger.info('reminder service end');
}

main();

export default main;
