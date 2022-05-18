import { Publisher, Subjects, TicketCreatedEvent } from "@vineet-tickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}