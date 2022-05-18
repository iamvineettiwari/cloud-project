import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

function getId() {
    return new mongoose.Types.ObjectId().toHexString();
}

it('returns a 404, if provided id does not exists', async () => {
    await request(app)
        .put(`/api/tickets/${getId()}`)
        .set('Cookie', global.signin())
        .send({
            title: 'Test',
            price: 200
        })
        .expect(404)
})

it('returns a 401, if user is not authenticated', async () => {
    await request(app)
        .put(`/api/tickets/${getId()}`)
        .send({
            title: 'Test',
            price: 200
        })
        .expect(401)
})

it('returns a 401, user does not own the ticket', async () => {
    const createTicket = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'Test',
            price: 200
        })
        .expect(201);

    const response = await request(app)
        .put(`/api/tickets/${createTicket.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'Test Updated',
            price: 300
        })
        .expect(401)
})

it('returns a 400, if user provides an invalid title or price', async () => {
    const cookie = global.signin();

    const createTicket = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Test',
            price: 200
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${createTicket.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 200
        })
        .expect(400)

    await request(app)
        .put(`/api/tickets/${createTicket.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Test',
            price: -200
        })
        .expect(400)
})

it('updates the ticket, if valid inputs are provided', async () => {
    const cookie = global.signin();

    const createTicket = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Test',
            price: 200
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${createTicket.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Test Updated',
            price: 400
        })
        .expect(200)

    const ticketResponse = await request(app)
        .get(`/api/tickets/${createTicket.body.id}`)
        .send();

    expect(ticketResponse.body.title).toEqual('Test Updated')
    expect(ticketResponse.body.price).toEqual(400)

})

it('publishes an event', async () => {
    const cookie = global.signin();

    const createTicket = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Test',
            price: 200
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${createTicket.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Test Updated',
            price: 400
        })
        .expect(200)

    const ticketResponse = await request(app)
        .get(`/api/tickets/${createTicket.body.id}`)
        .send();

    expect(natsWrapper.client.publish).toHaveBeenCalled();
})

it('rejects updates if the ticket is reserved', async () => {
    const cookie = global.signin();

    const createTicket = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Test',
            price: 200
        })
        .expect(201);

    const ticket = await Ticket.findById(createTicket.body.id);

    ticket!.set({
        orderId: new mongoose.Types.ObjectId().toHexString()
    })

    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${createTicket.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Test Updated',
            price: 400
        })
        .expect(400)

})