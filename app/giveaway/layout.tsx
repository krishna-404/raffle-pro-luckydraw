import { generateMetadata as baseGenerateMetadata } from "@/app/lib/metadata";
import type { Metadata } from "next";

export function generateMetadata(): Metadata {
	return baseGenerateMetadata({
		title: "Giveaway",
		description:
			"Participate in our exciting raffles and lucky draws to win amazing prizes.",
		keywords: [
			"raffle giveaway",
			"lucky draw contest",
			"win prizes",
			"online giveaway",
			"sweepstakes",
			"contest entry",
		],
		openGraph: {
			title: "Giveaway | Raffle & Lucky Draw",
			description:
				"Participate in our exciting raffles and lucky draws to win amazing prizes.",
			url: "https://raffle-luckydraw.vercel.app/giveaway",
			images: [
				{
					url: "/giveaway-og-image.png",
					width: 1200,
					height: 630,
					alt: "Raffle & Lucky Draw Giveaway",
				},
				// Fallback image if giveaway-specific image doesn't exist
				{
					url: "/opengraph-image.png",
					width: 1200,
					height: 630,
					alt: "Raffle & Lucky Draw",
				},
			],
		},
	});
}

export default function GiveawayLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
