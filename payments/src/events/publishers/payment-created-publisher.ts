import { Subjects, Publisher, PaymentCreatedEvent } from '@vineet-tickets/common';
export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}