import React, { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

export default () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const { doRequest, errors } = useRequest({
        url: '/api/users/signin',
        method: 'post',
        body: {
            email, password
        },
        onSuccess: () => Router.push('/')
    });

    const handleSubmit = async (event) => {
        event.preventDefault();

        doRequest();
    }

    return (
        <div className="container p-4">
            {errors}
            <form className="p-4 card" onSubmit={handleSubmit}>
                <h1>Sign In</h1>
                <div className="form-group mt-2">
                    <label>Email Address</label>
                    <input value={email} type="email" className="form-control" onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group mt-2">
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control" />
                </div>
                <button className="btn btn-primary mt-4">Sign In</button>
            </form>
        </div>
    );
}