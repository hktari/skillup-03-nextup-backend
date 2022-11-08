export interface MongoDbQuery<TDocument> {
    documents: TDocument[];
}

export interface BookingPendingReminder {
    _id:     string;
    eventId: string;
    userId:  string;
    reminderSentDatetime: Date;
    user:    User[];
}

export interface User {
    email: string;
}
