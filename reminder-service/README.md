# Email Reminder Service

This is a service deployed seperately from the REST api. 
Its purpose is to scan the database for events occuring tomorrow and notify users who booked the event via email.

The node programme is executed on a set interval.

execute like `npm run build && npm run start`