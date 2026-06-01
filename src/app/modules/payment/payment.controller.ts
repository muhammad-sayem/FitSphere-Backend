import { Request, Response } from "express";
import Stripe from "stripe";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { handlerStripeWebhookEvent, PaymentService } from "./payment.service";

const handleStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {
	const rawBody = req.body;

	const event: Stripe.Event = typeof rawBody === "string"
		? JSON.parse(rawBody)
		: Buffer.isBuffer(rawBody)
			? JSON.parse(rawBody.toString("utf8"))
			: rawBody;

	const result = await handlerStripeWebhookEvent(event);
	const data = "data" in result ? result.data : undefined;

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: result.message,
		data
	});
});


//* Get Payment by user ID (Logged in user) *//
const getPaymentByUserId = catchAsync(
	async (req: Request, res: Response) => {
		const user = req.user;

		const result = await PaymentService.getPaymentByUserId(user);
		sendResponse(res, {
			httpStatusCode: status.OK,
			success: true,
			message: "Payments retrieved successfully",
			data: result
		})
	}
);

export const PaymentController = {
	handleStripeWebhookEvent,
	getPaymentByUserId
};
