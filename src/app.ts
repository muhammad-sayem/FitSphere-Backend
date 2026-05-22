import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { IndexRouters } from "./app/routes";
import { notFound } from "./app/middleware/notFound";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
const app: Application = express();

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1', IndexRouters);

// Basic route
app.get('/', (req: Request, res: Response) => {
	res.send('Hello, TypeScript + Express!');
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;