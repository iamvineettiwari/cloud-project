import { currentUser, NotFoundError, OrderStatus, requireAuth } from '@vineet-tickets/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import mongoose from 'mongoose';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete('/api/orders/:orderId',
    currentUser, requireAuth, async (req: Request, res: Response) => {
        const { orderId } = req.params;

        const order = await Order.find({
            id: new mongoose.Types.ObjectId(orderId),
            userId: req.currentUser?.id,
        }).populate('ticket');

        if (!order.length) {
            throw new NotFoundError();
        }

        const currOrder = order[0];

        currOrder.status = OrderStatus.Cancelled;
        await currOrder.save();

        // publishing an event saying this was cancelled !
        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: currOrder.id,
            version: currOrder.version,
            ticket: {
                id: currOrder.ticket.id
            }
        })

        res.status(204).send(currOrder);
    })

export { router as deleteOrderRouter }