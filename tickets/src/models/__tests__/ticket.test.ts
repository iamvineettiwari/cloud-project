import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 5,
        userId: 'aasdf1'
    })
    await ticket.save();

    const first = await Ticket.findById(ticket.id);
    const second = await Ticket.findById(ticket.id);

    first!.set({ price: 10 });
    second!.set({ price: 50 });

    await first!.save()

    try {
        await second!.save();
    } catch (err) {
        return;
    }

    throw new Error("Should not reach this point");
})