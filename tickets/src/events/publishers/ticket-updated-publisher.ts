import { Publisher, Subjects, TicketUpdatedEvent } from "@vineet-tickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}