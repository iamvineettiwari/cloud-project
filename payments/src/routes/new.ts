import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
    currentUser,
    requireAuth,
    validateRequest,
    BadRequestError,
    NotFoundError,
    OrderStatus
} from '@vineet-tickets/common';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/payments',
    currentUser,
    requireAuth,
    [
        body('token')
            .not()
            .isEmpty(),
        body('orderId')
            .not()
            .isEmpty()
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const { token, orderId } = req.body;

            const order = await Order.findOne({ _id: orderId, userId: req.currentUser!.id });

            if (!order) {
                throw new NotFoundError();
            }

            if (order.status === OrderStatus.Cancelled) {
                throw new BadRequestError('Can not pay for a cancelled order');
            }
            const stripeChargeRes = await stripe.charges.create({
                currency: 'INR',
                amount: order.price * 100,
                source: token,
                description: 'Purchase ' + order.id,
            });

            const payment = Payment.build({
                orderId,
                stripeId: stripeChargeRes.id
            });
            await payment.save();

            console.log(stripeChargeRes)

            new PaymentCreatedPublisher(natsWrapper.client).publish({
                id: payment.id,
                stripeId: payment.stripeId,
                orderId: payment.orderId
            })


            res.status(201).send({ id: payment.id })
        } catch (err) {
            console.log(err)
        }
    })

export { router as createChargeRouter }