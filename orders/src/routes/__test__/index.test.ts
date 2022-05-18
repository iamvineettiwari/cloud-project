import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';

const buildTicket = async (title: string) => {
    const ticket = Ticket.build({
        title,
        price: 20
    });

    await ticket.save();

    return ticket;
}

it('fetches orders for a paticular user', async () => {
    //  Create three tickets
    const ticketOne = await buildTicket("Ticket One");
    const ticketTwo = await buildTicket("Ticket Two");
    const ticketThree = await buildTicket("Ticket Three");

    const userOne = global.signin();
    const userTwo = global.signin();

    // Create one order as user #1
    await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticketOne.id })
        .expect(201)


    // Create two orders as user #2
    const { body: orderOne } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketTwo.id })
        .expect(201)

    const { body: orderTwo } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketThree.id })
        .expect(201)

    // make request to get orders for user #2
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .expect(200)

    // make sure we only got the orders for user #2
    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id)
    expect(response.body[1].id).toEqual(orderTwo.id)
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id)
    expect(response.body[1].ticket.id).toEqual(ticketThree.id)
})