import { generateMetadata as baseGenerateMetadata } from "@/app/lib/metadata";
import type { Metadata } from "next";

export function generateMetadata(): Metadata {
	return baseGenerateMetadata({
		title: "About Us",
		description:
			"Learn more about Raffle & Lucky Draw - our mission, vision, and the team behind the platform.",
		keywords: [
			"about raffle lucky draw",
			"raffle platform",
			"lucky draw company",
			"raffle team",
			"giveaway platform history",
		],
		openGraph: {
			title: "About Raffle & Lucky Draw",
			description:
				"Learn more about Raffle & Lucky Draw - our mission, vision, and the team behind the platform.",
			url: "https://raffle-luckydraw.vercel.app/about",
			images: [
				{
					url: "/about-og-image.png",
					width: 1200,
					height: 630,
					alt: "About Raffle & Lucky Draw",
				},
			],
		},
	});
}

export default function AboutPage() {
	return (
		<div className="container mx-auto px-4 py-12">
			<h1 className="text-4xl font-bold mb-8">About Us</h1>
			<div className="prose max-w-none">
				<p className="text-lg mb-6">
					Welcome to Raffle & Lucky Draw, the premier platform for creating and
					managing digital raffles and giveaways.
				</p>
				<h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
				<p>
					Our mission is to provide a transparent, fair, and engaging platform
					for individuals and businesses to run successful raffles and lucky
					draws.
				</p>
				<h2 className="text-2xl font-semibold mt-8 mb-4">Our Vision</h2>
				<p>
					We envision a world where digital raffles are accessible to everyone,
					with complete transparency and trust in the selection process.
				</p>
				<h2 className="text-2xl font-semibold mt-8 mb-4">Our Team</h2>
				<p>
					Behind Raffle & Lucky Draw is a dedicated team of developers,
					designers, and marketing professionals who are passionate about
					creating the best raffle experience possible.
				</p>
			</div>
		</div>
	);
}
