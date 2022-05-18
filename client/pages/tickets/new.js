import { useState } from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const NewTicket = () => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');

    const { doRequest, errors } = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: {
            title, price
        },
        onSuccess: () => Router.push('/')
    });

    const onBlur = (e) => {
        const value = parseFloat(price);

        if (isNaN(value)) {
            setPrice('');
            return;
        }

        setPrice(value.toFixed(2));
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        doRequest();
    }

    return <div className="container p-4">
        <h1>Create a ticket</h1>
        <form onSubmit={handleSubmit}>
            <div className="form-group mt-5">
                <label>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-control" />
            </div>
            <div className="form-group mt-3">
                <label>Price</label>
                <input value={price} onChange={(e) => setPrice(e.target.value)}
                    onBlur={onBlur} className="form-control" />
            </div>
            {errors}
            <button type="submit" className="btn btn-primary mt-3">Submit</button>
        </form>
    </div>
}

export default NewTicket;