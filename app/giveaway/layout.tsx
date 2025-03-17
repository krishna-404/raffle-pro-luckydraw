import { generateMetadata as baseGenerateMetadata } from "@/app/lib/metadata";
import type { Metadata } from "next";

export function generateMetadata(): Metadata {
	const title = "Saree Giveaway | Kayaan Prints";
	const description =
		"Participate in our exclusive saree giveaway and win exquisite handcrafted designer sarees from Kayaan Prints.";

	// Base URL for the site
	const baseUrl =
		process.env.NEXT_PUBLIC_SITE_URL || "https://raffle-luckydraw.vercel.app";
	const pageUrl = `${baseUrl}/giveaway`;

	return baseGenerateMetadata({
		title: "Saree Giveaway",
		description,
		keywords: [
			"saree giveaway",
			"designer saree contest",
			"win sarees",
			"Kayaan Prints giveaway",
			"luxury saree giveaway",
			"handcrafted sarees",
			"free saree",
			"saree contest",
			"Indian wear giveaway",
			"traditional saree prize",
		],
		openGraph: {
			title,
			description,
			url: pageUrl,
			type: "website",
			images: [
				{
					url: "/giveaway-og-image.png",
					width: 1200,
					height: 630,
					alt: "Kayaan Prints Saree Giveaway",
				},
				{
					url: "/opengraph-image.png",
					width: 1200,
					height: 630,
					alt: "Kayaan Prints",
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: ["/giveaway-twitter-image.png"],
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
