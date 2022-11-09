import logger from './logger'
import ConfigService from './lib/config.service';
import { EmailService, SendEventReminderResult } from './lib/email.service';
import DatabaseService from './lib/database.service';
import { BookingPendingReminder, Event, MongoDbQuery } from './lib/database.interface';

let config: ConfigService
let emailService: EmailService
let dbService: DatabaseService

async function main() {
    logger.info('reminder service start');

    // initialize dependencies
    config = new ConfigService()
    emailService = new EmailService(config)
    dbService = new DatabaseService(config)

    logger.debug('retrieving events...')

    const getEventsQuery = await dbService.getEvents()

    logger.debug(`got ${getEventsQuery.documents.length} events`)

    const eventsHappeningTomorrow = filterEventsHappeningTomorrow(getEventsQuery.documents)
    logger.info(`found ${eventsHappeningTomorrow.length} to occur tomorrow.`)

    const sendEmailPromises = []

    for (const event of eventsHappeningTomorrow) {
        logger.info('pending event tomorrow')
        // logger.debug(JSON.stringify(event))
        
        const bookingsPendingReminder = await dbService.getBookingsForEventPendingReminder(event.eventId)
        logger.debug(`queueing ${bookingsPendingReminder.documents.length} emails to be sent`)
        for (const booking of bookingsPendingReminder.documents) {
            sendEmailPromises.push(emailService.sendEventReminder(booking, event))
        }
    }

    logger.info('sending emails...')

    const results = await Promise.allSettled(sendEmailPromises)

    logger.info('processing results...')
    processSendReminderResults(results)

    logger.info('reminder service end');
}


function filterEventsHappeningTomorrow(events: Event[]) {
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 2)
    tomorrow.setUTCHours(0)
    tomorrow.setUTCMinutes(0)

    return events.filter(event => {
        logger.debug(`considering event: id: ${event.eventId}\ttitle:${event.title}`);
        const eventDatetime = new Date(event.datetime);
        logger.debug('event datetime: ' + eventDatetime);
        return eventDatetime >= today && eventDatetime <= tomorrow;
    });
}


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


main();

export default main;