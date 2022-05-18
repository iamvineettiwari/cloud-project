import express from "express";
import 'express-async-errors';
import { json } from 'body-parser';
import { currentUserRouter } from "./routes/current-user";
import { singInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/singout";
import { signUpRouter } from "./routes/singup";
import { errorHandler, NotFoundError } from "@vineet-tickets/common";
import cookieSession from "cookie-session";

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test'
    })
)

app.use(currentUserRouter);
app.use(singInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

app.all('*', async () => {
    throw new NotFoundError();
})

app.use(errorHandler);

export { app }