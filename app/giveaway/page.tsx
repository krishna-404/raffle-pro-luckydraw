"use client";

import { QrCodeScanner } from "@/app/components/QrCodeScanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { differenceInSeconds, format } from "date-fns";
import { QrCode } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
	type ActiveEvent,
	type PastEvent,
	getActiveEvent,
	getPastEvents,
} from "./actions";

function CountdownTimer({ endDate }: { endDate: string }) {
	const [timeLeft, setTimeLeft] = useState("");

	useEffect(() => {
		const timer = setInterval(() => {
			// Create date object and adjust for timezone offset
			const end = new Date(endDate);
			// Set to end of the same day
			end.setHours(23, 59, 59, 999);

			const now = new Date();

			const secondsLeft = differenceInSeconds(end, now);

			if (secondsLeft <= 0) {
				setTimeLeft("Ended");
				clearInterval(timer);
				return;
			}

			const days = Math.floor(secondsLeft / (24 * 60 * 60));
			const hours = Math.floor((secondsLeft % (24 * 60 * 60)) / (60 * 60));
			const minutes = Math.floor((secondsLeft % (60 * 60)) / 60);
			const seconds = Math.floor(secondsLeft % 60);

			setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
		}, 1000);

		return () => clearInterval(timer);
	}, [endDate]);

	return (
		<div className="font-mono text-2xl md:text-4xl font-bold text-primary">
			{timeLeft}
		</div>
	);
}

export default function GiveawayPage() {
	const [event, setEvent] = useState<ActiveEvent | null>(null);
	const [pastEvents, setPastEvents] = useState<PastEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [activeEvent, pastEventsData] = await Promise.all([
					getActiveEvent(),
					getPastEvents(),
				]);
				setEvent(activeEvent);
				setPastEvents(pastEventsData);
			} catch (error) {
				console.error("Failed to fetch data:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-pulse text-2xl text-muted-foreground">
					Loading...
				</div>
			</div>
		);
	}

	return (
		<main className="min-h-screen py-20 px-4">
			<div className="container mx-auto max-w-6xl">
				<div className="flex justify-center mb-6">
					<img
						src="/kayaan-logo.jpeg"
						alt="Kayaan Logo"
						className="h-24 md:h-32 object-contain"
					/>
				</div>
				{/* Hero Section */}
				{event ? (
					<>
						<div className="text-center space-y-6 mb-16">
							<h1 className="text-4xl md:text-6xl font-serif font-bold">
								{event.name}
							</h1>
							{event.description && (
								<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
									{event.description}
								</p>
							)}
							<div className="space-y-2">
								<p className="text-sm uppercase tracking-wider text-muted-foreground">
									Giveaway Ends In
								</p>
								<CountdownTimer endDate={event.end_date} />
							</div>
							<Button
								size="lg"
								className="mt-8"
								onClick={() => setIsQrScannerOpen(true)}
							>
								<QrCode className="mr-2 h-5 w-5" />
								Scan QR Code to Enter
							</Button>
						</div>

						{/* QR Code Scanner Dialog */}
						<QrCodeScanner
							isOpen={isQrScannerOpen}
							onClose={() => setIsQrScannerOpen(false)}
						/>

						{/* Prizes Section */}
						<div className="space-y-8">
							<h2 className="text-3xl font-serif text-center">Prizes</h2>
							<div
								className={cn(
									"grid gap-6 mx-auto",
									"grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
									"max-w-[400px] md:max-w-none", // Constrain single column width
									{
										"md:grid-cols-1 lg:grid-cols-1 md:max-w-[400px]":
											event.prizes.length === 1,
										"md:grid-cols-2 lg:grid-cols-2 md:max-w-[850px]":
											event.prizes.length === 2,
										"md:max-w-none": event.prizes.length >= 3,
									},
								)}
							>
								{event.prizes
									.sort((a, b) => a.seniority_index - b.seniority_index)
									.map((prize, index) => (
										<Card
											key={prize.id}
											className="overflow-hidden transition-transform hover:scale-105"
										>
											{prize.image_url ? (
												<div className="aspect-[4/3] relative">
													<img
														src={prize.image_url}
														alt={prize.name}
														className="absolute inset-0 w-full h-full object-contain"
													/>
												</div>
											) : (
												<div className="aspect-[4/3] bg-muted flex items-center justify-center">
													<div className="text-4xl font-bold text-muted-foreground">
														{index + 1}
													</div>
												</div>
											)}
											<CardContent className="p-6">
												<div className="space-y-2">
													<h3 className="text-xl font-semibold">
														{prize.name}
													</h3>
													{prize.description && (
														<p className="text-muted-foreground">
															{prize.description}
														</p>
													)}
												</div>
											</CardContent>
										</Card>
									))}
							</div>
						</div>
					</>
				) : (
					<div className="my-20 flex items-center justify-center">
						<div className="text-center space-y-4">
							<h1 className="text-3xl font-bold">No Active Giveaway</h1>
							<p className="text-muted-foreground">
								Check back later for new giveaways!
							</p>
						</div>
					</div>
				)}

				{/* Past Events Section */}
				{pastEvents.length > 0 && (
					<div className="mt-20 space-y-8">
						<h2 className="text-3xl font-serif text-center">Past Events</h2>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{pastEvents.map((pastEvent) => (
								<Link
									key={pastEvent.id}
									href={`/giveaway/${pastEvent.id}`}
									className="block"
								>
									<Card className="h-full transition-transform hover:scale-105">
										<CardContent className="p-6">
											<div className="space-y-4">
												<div>
													<h3 className="text-xl font-semibold">
														{pastEvent.name}
													</h3>
													<p className="text-sm text-muted-foreground">
														Ended on{" "}
														{format(
															new Date(pastEvent.end_date),
															"MMM dd, yyyy",
														)}
													</p>
													{pastEvent.description && (
														<p className="mt-2 text-muted-foreground">
															{pastEvent.description}
														</p>
													)}
												</div>
												<div className="space-y-2">
													<p className="text-sm font-medium text-muted-foreground">
														{pastEvent.winners.length > 0
															? "Winners"
															: "Status"}
													</p>
													{pastEvent.winners.length > 0 ? (
														<div className="space-y-1">
															{pastEvent.winners.map((winner) => (
																<div key={winner.entry_id} className="text-sm">
																	<p className="font-medium">{winner.name}</p>
																	<p className="text-muted-foreground">
																		{winner.city} • {winner.prize_name}
																	</p>
																</div>
															))}
														</div>
													) : (
														<div className="text-sm text-muted-foreground">
															{pastEvent.prizes.length > 0
																? "Winners not yet announced"
																: "No prizes were offered"}
														</div>
													)}
												</div>
											</div>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
