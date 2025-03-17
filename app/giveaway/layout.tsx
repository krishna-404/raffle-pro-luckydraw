import { generateMetadata as baseGenerateMetadata } from "@/app/lib/metadata";
import type { Metadata } from "next";

export function generateMetadata(): Metadata {
	const title = "Giveaway | Raffle & Lucky Draw";
	const description =
		"Participate in our exciting raffles and lucky draws to win amazing prizes.";

	// Base URL for the site
	const baseUrl =
		process.env.NEXT_PUBLIC_SITE_URL || "https://raffle-luckydraw.vercel.app";
	const pageUrl = `${baseUrl}/giveaway`;

	// Dynamic OG image URL
	const ogImageUrl = new URL("/api/og", baseUrl);
	ogImageUrl.searchParams.set("title", "Win Amazing Prizes!");
	ogImageUrl.searchParams.set("description", description);
	ogImageUrl.searchParams.set("route", "/giveaway");

	return baseGenerateMetadata({
		title: "Giveaway",
		description,
		keywords: [
			"raffle giveaway",
			"lucky draw contest",
			"win prizes",
			"online giveaway",
			"sweepstakes",
			"contest entry",
			"free prizes",
			"giveaway entry",
			"raffle tickets",
			"prize draw",
		],
		openGraph: {
			title,
			description,
			url: pageUrl,
			type: "website",
			images: [
				{
					url: ogImageUrl.toString(),
					width: 1200,
					height: 630,
					alt: "Raffle & Lucky Draw Giveaway",
				},
				// Fallback images
				{
					url: "/giveaway-og-image.png",
					width: 1200,
					height: 630,
					alt: "Raffle & Lucky Draw Giveaway",
				},
				{
					url: "/opengraph-image.png",
					width: 1200,
					height: 630,
					alt: "Raffle & Lucky Draw",
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [ogImageUrl.toString(), "/giveaway-og-image.png"],
		},
		alternates: {
			canonical: pageUrl,
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
