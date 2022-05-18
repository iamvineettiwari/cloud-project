import React from 'react';
import axios from 'axios';

export default ({ url, method, body, onSuccess }) => {
    const [errors, setErrors] = React.useState(null);

    const doRequest = async (props = {}) => {
        try {
            setErrors(null);
            const response = await axios[method](url, { ...body, ...props });

            if (onSuccess) {
                onSuccess(response.data);
            }

            return response.data;
        } catch (err) {
            console.log(err)
            setErrors(
                <div className="alert alert-danger mt-3">
                    <h4>Ooops...</h4>
                    <ul className="my-0">
                        {err.response.data.errors.map((er) => <li key={er.message}>{er.message}</li>)}
                    </ul>
                </div>
            );
        }
    };

    return { doRequest, errors };
}