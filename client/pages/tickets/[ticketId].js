import useRequest from '../../hooks/use-request';
import Router from 'next/router';
import { useEffect } from 'react';
import router from 'next/router';

const TicketDetail = ({ ticket, currentUser }) => {

    const { doRequest, errors } = useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            ticketId: ticket.id,
        },
        onSuccess: (order) => Router.push('/orders/[orderId]', `/orders/${order.id}`)
    })

    useEffect(() => {
        if (!currentUser) {
            router.replace('/auth/signin')
        }
    }, []);

    return <div className="container">
        <h1>{ticket.title}</h1>
        <h4 className="mt-1">Price: ₹{ticket.price}</h4>
        {errors}
        <button className="btn btn-primary mt-3" onClick={() => doRequest()}>Purchase</button>
    </div>
}

TicketDetail.getInitialProps = async (context, client) => {
    const { ticketId } = context.query;
    const { data } = await client.get(`/api/tickets/${ticketId}`);

    return { ticket: data }
}

export default TicketDetail;