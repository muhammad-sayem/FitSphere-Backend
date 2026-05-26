import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { IndexRouters } from "./app/routes";
import { notFound } from "./app/middleware/notFound";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { PaymentController } from "./app/modules/payment/payment.controller";
import cors from "cors";
import { envVars } from "./app/config/env";
const app: Application = express();

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent)

app.use(cors({
  origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))


// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', IndexRouters);

// Basic route
app.get('/', (req: Request, res: Response) => {
	res.send('Hello, TypeScript + Express!');
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;