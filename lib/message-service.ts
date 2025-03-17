import { createClient as createServerClient } from "@/utils/supabase/server";

// Define types for the message service
export type MessageRecipient = {
	mobiles: string;
	[key: string]: string | number; // Dynamic variables for the template
};

export type MessageResponse = {
	success: boolean;
	messageId?: string;
	error?: string;
	status?: string;
	responseData?: Record<string, unknown>;
};

export type MessageLogEntry = {
	templateId: string;
	recipientMobile: string;
	eventId?: string;
	eventEntryId?: string;
	messageVariables: Record<string, string | number>;
	status: string;
	responseData?: Record<string, unknown>;
	errorMessage?: string;
};

/**
 * Message Service for sending SMS/WhatsApp messages using MSG91
 */
export class MessageService {
	private readonly apiUrl: string;
	private readonly authKey: string;
	private readonly defaultTemplateId: string;

	constructor() {
		this.apiUrl =
			process.env.MSG91_URL || "https://control.msg91.com/api/v5/flow";
		this.authKey = process.env.MSG91_AUTHKEY || "";
		this.defaultTemplateId = process.env.MSG91_TEMPLATE_ID || "";
	}

	/**
	 * Send a message to a single recipient
	 * @param recipient The recipient details including mobile number and template variables
	 * @param templateId Optional template ID (uses default if not provided)
	 * @returns Promise with the message response
	 */
	async sendMessage(
		recipient: MessageRecipient,
		templateId?: string,
	): Promise<MessageResponse> {
		const template = templateId || this.defaultTemplateId;

		if (!template) {
			throw new Error("Template ID is required but not provided");
		}

		if (!recipient.mobiles) {
			throw new Error("Recipient mobile number is required");
		}

		// Ensure mobile number has country code (default to India 91)
		const mobile = recipient.mobiles.startsWith("91")
			? recipient.mobiles
			: `91${recipient.mobiles}`;

		// Prepare the request body
		const requestBody = {
			template_id: template,
			recipients: [{ ...recipient, mobiles: mobile }],
		};

		// Skip actual message sending in non-production environments
		if (process.env.NODE_ENV !== "production") {
			console.log("Skipping message sending in non-production environment");
			console.log("Would have sent:", JSON.stringify(requestBody, null, 2));

			// Still log the message to database for tracking
			await this.logMessage({
				templateId: template,
				recipientMobile: mobile,
				eventId: recipient.event_id as string,
				eventEntryId: recipient.part_id as string,
				messageVariables: { ...recipient },
				status: "skipped",
				responseData: { skipped: true, environment: process.env.NODE_ENV },
				errorMessage: "Skipped in non-production environment",
			});

			return {
				success: true,
				status: "skipped",
				messageId: `dev-${Date.now()}`,
				responseData: { skipped: true, environment: process.env.NODE_ENV },
			};
		}

		try {
			// Send the message
			const response = await fetch(
				`${this.apiUrl}?authkey=${this.authKey}&accept=application/json&content-type=application/json`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(requestBody),
				},
			);

			const responseData = (await response.json()) as Record<string, unknown>;

			// Determine if the request was successful
			const success = response.ok && responseData.type === "success";

			// Prepare the response
			const messageResponse: MessageResponse = {
				success,
				status: (responseData.type as string) || "error",
				responseData,
			};

			if (!success) {
				messageResponse.error =
					(responseData.message as string) || "Failed to send message";
			} else {
				messageResponse.messageId =
					(responseData.request_id as string) || (responseData.id as string);
			}

			// Log the message
			await this.logMessage({
				templateId: template,
				recipientMobile: mobile,
				eventId: recipient.event_id as string,
				eventEntryId: recipient.part_id as string,
				messageVariables: { ...recipient },
				status: messageResponse.status || "unknown",
				responseData: responseData,
				errorMessage: messageResponse.error,
			});

			return messageResponse;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";

			// Log the failed message
			await this.logMessage({
				templateId: template,
				recipientMobile: mobile,
				eventId: recipient.event_id as string,
				eventEntryId: recipient.part_id as string,
				messageVariables: { ...recipient },
				status: "error",
				errorMessage,
			});

			return {
				success: false,
				error: errorMessage,
				status: "error",
			};
		}
	}

	/**
	 * Log a message to the database
	 * @param logEntry The message log entry
	 */
	private async logMessage(logEntry: MessageLogEntry): Promise<void> {
		try {
			const supabase = await createServerClient();

			const { error } = await supabase.from("message_logs").insert({
				template_id: logEntry.templateId,
				recipient_mobile: logEntry.recipientMobile,
				event_id: logEntry.eventId,
				event_entry_id: logEntry.eventEntryId,
				message_variables: logEntry.messageVariables,
				status: logEntry.status,
				response_data: logEntry.responseData,
				error_message: logEntry.errorMessage,
			});

			if (error) {
				console.error("Failed to log message:", error);
			}
		} catch (error) {
			console.error("Failed to log message:", error);
		}
	}
}

// Export a singleton instance of the message service
export const messageService = new MessageService();
