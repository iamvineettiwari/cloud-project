import router from 'next/router';
import Router from 'next/router';
import { useEffect, useRef, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';

const OrderDetail = ({ currentUser, order }) => {
    const interval = useRef(null);
    const [timeLeft, setTimeLeft] = useState(0);

    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: (payment) => {
            Router.replace('/orders');
        }
    })

    const handlePayment = (data) => {
        clearInterval(interval.current);
        doRequest({ token: data.id })
    }

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        }

        findTimeLeft();

        interval.current = setInterval(() => {
            findTimeLeft()
        }, 1000);

        return () => {
            interval.current ? clearInterval(interval.current) : null;
        }
    }, []);



    useEffect(() => {
        if (!currentUser) {
            router.replace('/auth/signin')
        }
    }, []);

    if (timeLeft < 1) {
        return <div className="container">Order expired !</div>
    }

    return (
        <div className='container'>
            <h1>{order.ticket.title}</h1>
            <p className='mt-2'>Time left to pay : {timeLeft} seconds</p>
            <div className='mt-2'>
                <StripeCheckout
                    token={handlePayment}
                    stripeKey="pk_test_51KxBUESDPS2TOJApTxX96lDW8V8FCghPiYXjuBmEfwgv4WSfcX1BsDpoBLsCZe1NZtqjUT7otuylfKJWEZ9ccWNn00sNYpWQck"
                    amount={order.ticket.price * 100}
                    email={currentUser.email}
                    currency="INR"
                />
            </div>
            {errors}
        </div>
    )
}

OrderDetail.getInitialProps = async (context, client) => {
    const { orderId } = context.query;

    const { data } = await client.get(`/api/orders/${orderId}`);

    return { order: data };
}

export default OrderDetail;