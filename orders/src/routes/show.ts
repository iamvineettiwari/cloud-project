import { currentUser, NotAuthorizedError, NotFoundError, requireAuth } from '@vineet-tickets/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders/:orderId', currentUser, requireAuth, async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');

    if (!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser?.id) {
        throw new NotAuthorizedError('You are not authorized to view this order');
    }

    res.send(order);
})

export { router as showOrderRouter }