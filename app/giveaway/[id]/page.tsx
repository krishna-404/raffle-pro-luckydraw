"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { type EventWithPrizes, getEventById } from "../actions";

export default function EventPage({
	params,
}: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const [event, setEvent] = useState<EventWithPrizes | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchEvent = async () => {
			try {
				const data = await getEventById(id);
				setEvent(data);
			} catch (error) {
				console.error("Failed to fetch event:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchEvent();
	}, [id]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-pulse text-2xl text-muted-foreground">
					Loading...
				</div>
			</div>
		);
	}

	if (!event) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<h1 className="text-3xl font-bold">Event Not Found</h1>
					<p className="text-muted-foreground">
						The event you're looking for doesn't exist or has been removed.
					</p>
					<Link href="/giveaway">
						<Button variant="outline">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Giveaways
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<main className="min-h-screen py-20 px-4">
			<div className="container mx-auto max-w-6xl">
				{/* Back Button */}
				<Link href="/giveaway" className="inline-block mb-8">
					<Button variant="ghost" className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						Back to Giveaways
					</Button>
				</Link>

				{/* Hero Section */}
				<div className="text-center space-y-6 mb-16">
					<div className="flex justify-center mb-6">
						<img
							src="/kayaan-logo.jpeg"
							alt="Kayaan Logo"
							className="h-24 md:h-32 object-contain"
						/>
					</div>
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
							Event Period
						</p>
						<p className="text-lg">
							{format(new Date(event.start_date), "MMM dd, yyyy")} -{" "}
							{format(new Date(event.end_date), "MMM dd, yyyy")}
						</p>
					</div>
				</div>

				{/* Winners Section */}
				{event.winners.length > 0 && (
					<div className="mb-16">
						<h2 className="text-3xl font-serif text-center mb-8">Winners</h2>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{event.winners.map((winner) => {
								const prize = event.prizes.find(
									(p) => p.id === winner.prize_id,
								);
								return (
									<Card key={winner.entry_id} className="overflow-hidden">
										<CardContent className="p-6">
											<div className="space-y-4">
												{prize && (
													<div className="space-y-2">
														<p className="text-sm font-medium text-muted-foreground">
															Prize
														</p>
														<h3 className="text-xl font-semibold">
															{prize.name}
														</h3>
													</div>
												)}
												<div className="space-y-2">
													<p className="text-sm font-medium text-muted-foreground">
														Winner
													</p>
													<h3 className="text-xl font-semibold">
														{winner.name}
													</h3>
													<p className="text-muted-foreground">{winner.city}</p>
													<p className="text-sm text-muted-foreground">
														Entry ID: {winner.entry_id}
													</p>
												</div>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					</div>
				)}

				{/* Prizes Section */}
				<div className="space-y-8">
					<h2 className="text-3xl font-serif text-center">Prizes</h2>
					<div
						className={cn(
							"grid gap-6 mx-auto",
							"grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
							"max-w-[400px] md:max-w-none",
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
											<h3 className="text-xl font-semibold">{prize.name}</h3>
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
			</div>
		</main>
	);
}
