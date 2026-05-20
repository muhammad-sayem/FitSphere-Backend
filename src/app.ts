import express, { Application, Request, Response } from "express";
import { IndexRouters } from "./app/routes";
const app: Application = express();

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

app.use('/api/v1', IndexRouters);

// Basic route
app.get('/', (req: Request, res: Response) => {
	res.send('Hello, TypeScript + Express!');
});
export default app;