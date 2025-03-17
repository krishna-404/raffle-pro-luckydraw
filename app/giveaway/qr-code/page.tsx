"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { submitEntry, validateQrCode } from "./actions";
import { type EntryFormData, entryFormSchema } from "./types";

export const dynamic = "force-dynamic";

function RateLimitCountdown({
	nextTryTimestamp,
}: { nextTryTimestamp: number }) {
	const [timeLeft, setTimeLeft] = useState("");

	useEffect(() => {
		const timer = setInterval(() => {
			const now = Date.now();
			const diff = nextTryTimestamp - now;

			if (diff <= 0) {
				setTimeLeft("You can try again now");
				clearInterval(timer);
				return;
			}

			const minutes = Math.floor(diff / 1000 / 60);
			const seconds = Math.floor((diff / 1000) % 60);
			setTimeLeft(`Try again in ${minutes}m ${seconds}s`);
		}, 1000);

		return () => clearInterval(timer);
	}, [nextTryTimestamp]);

	return <p className="text-sm text-muted-foreground">{timeLeft}</p>;
}

function QrCodePageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const qrCode = searchParams.get("code");

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [eventId, setEventId] = useState<string | null>(null);
	const [eventName, setEventName] = useState<string | null>(null);

	const form = useForm<EntryFormData>({
		resolver: zodResolver(entryFormSchema),
		defaultValues: {
			name: "",
			email: "",
			whatsappNumber: "",
			address: "",
			city: "",
			pincode: "",
		},
	});

	useEffect(() => {
		const validateCode = async () => {
			try {
				if (!qrCode) {
					setError("Invalid QR code");
					return;
				}

				const result = await validateQrCode(qrCode);
				if (result.error) {
					if (result.nextTryTimestamp) {
						// Add nextTryTimestamp to URL when rate limited
						const url = new URL(window.location.href);
						url.searchParams.set(
							"nextTryTimestamp",
							result.nextTryTimestamp.toString(),
						);
						window.history.replaceState({}, "", url.toString());
					}
					setError(result.error);
				} else {
					setEventId(result.eventId);
					setEventName(result.eventName);
				}
			} catch (error) {
				setError("Failed to validate QR code");
			} finally {
				setLoading(false);
			}
		};

		validateCode();
	}, [qrCode]);

	const onSubmit = async (data: EntryFormData) => {
		if (!qrCode || !eventId) return;

		try {
			setError(null);
			const result = await submitEntry(qrCode, eventId, data);

			if (result.error) {
				setError(result.error);
				window.scrollTo({ top: 0, behavior: "smooth" });
			} else if (result.success && result.verified) {
				router.push("/giveaway/success");
			} else {
			}
		} catch (error) {
			console.error("Submit entry error:", error);
			setError(
				error instanceof Error
					? error.message
					: "Failed to submit entry. Please try again.",
			);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-pulse text-2xl text-muted-foreground">
					Loading...
				</div>
			</div>
		);
	}

	if (error) {
		const isQrUsedError = error.includes("already been used");
		const isInvalidQrError = error.includes("Invalid QR code");
		const isRateLimited = searchParams.get("nextTryTimestamp");
		const nextTryTimestamp = isRateLimited
			? Number.parseInt(isRateLimited)
			: null;

		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Card className="max-w-md w-full">
					<CardHeader className="space-y-1">
						<CardTitle className="text-red-600">Error</CardTitle>
						<CardDescription className="text-base">{error}</CardDescription>
						{nextTryTimestamp && (
							<RateLimitCountdown nextTryTimestamp={nextTryTimestamp} />
						)}
					</CardHeader>
					<CardContent>
						{isQrUsedError || isInvalidQrError ? (
							<Button asChild className="w-full">
								<Link href="/giveaway">Back to Giveaway</Link>
							</Button>
						) : (
							<Button
								onClick={() => window.location.reload()}
								className="w-full"
								disabled={!!nextTryTimestamp && nextTryTimestamp > Date.now()}
							>
								Try Again
							</Button>
						)}
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<main className="min-h-screen py-20 px-4">
			<div className="container max-w-lg mx-auto">
				<Card>
					<CardHeader>
						<CardTitle>{eventName}</CardTitle>
						<CardDescription>
							Please fill in your details to enter the giveaway
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6"
							>
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Full Name</FormLabel>
											<FormControl>
												<Input placeholder="John Doe" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email (Optional)</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="john@example.com"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="whatsappNumber"
									render={({ field }) => (
										<FormItem>
											<FormLabel>WhatsApp Number</FormLabel>
											<FormControl>
												<Input
													type="tel"
													placeholder="10-digit mobile number"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="address"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Address</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="city"
									render={({ field }) => (
										<FormItem>
											<FormLabel>City</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="pincode"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Pincode</FormLabel>
											<FormControl>
												<Input
													type="text"
													placeholder="6-digit pincode"
													maxLength={6}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button
									type="submit"
									className="w-full"
									disabled={form.formState.isSubmitting}
								>
									{form.formState.isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Submitting...
										</>
									) : (
										"Submit Entry"
									)}
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}

export default function QrCodePage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center">
					<div className="animate-pulse text-2xl text-muted-foreground">
						Loading...
					</div>
				</div>
			}
		>
			<QrCodePageContent />
		</Suspense>
	);
}
