import logger from './logger'
import ConfigService from './lib/config.service';
import { EmailService, SendEventReminderResult } from './lib/email.service';
import DatabaseService from './lib/database.service';
import { BookingPendingReminder } from './lib/database.interface';

let config: ConfigService
let emailService: EmailService
let dbService: DatabaseService

async function processSendReminderResults(results: PromiseSettledResult<SendEventReminderResult>[]) {
    const failedResults = results.filter(res => res.status === 'rejected')
        .map(res => (res as PromiseRejectedResult).reason)

    for (const failed of failedResults) {
        logger.debug(JSON.stringify(failed.booking))
        logger.error(`failed to send event reminder`, failed.error)
    }

    const succeededBookings = results.filter(res => res.status === 'fulfilled')
        .map(res => (res as PromiseFulfilledResult<SendEventReminderResult>).value.booking)


    logger.debug(`${succeededBookings.length} out of ${results.length} succeeded`)
    logger.debug(`${failedResults.length} out of ${results.length} failed`)

    try {
        logger.info('marking bookings as reminder sent...')
        const updateResult = await dbService.markBookingsReminderSent(succeededBookings)
        logger.debug(`updated ${updateResult.modifiedCount} out of ${succeededBookings.length} bookings`)
    } catch (error) {
        logger.error('failed to mark bookings as reminder sent', error)
    }
}

async function main() {
    logger.info('reminder service start');

    // initialize dependencies
    config = new ConfigService()
    emailService = new EmailService(config)
    dbService = new DatabaseService(config)

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
    processSendReminderResults(results)

    logger.info('reminder service end');
}

main();

export default main;
