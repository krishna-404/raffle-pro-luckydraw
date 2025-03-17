import type { JsonLd, PageMetadata, SiteMetadata } from "@/types/metadata";
import type { Metadata } from "next";

/**
 * Default site metadata configuration
 */
export const defaultMetadata: SiteMetadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_SITE_URL || "https://raffle-luckydraw.vercel.app",
	),
	title: {
		default: "Raffle & Lucky Draw",
		template: "%s | Raffle & Lucky Draw",
	},
	description:
		"Create and manage raffles and lucky draws for your events and giveaways.",
	keywords: [
		"raffle",
		"lucky draw",
		"giveaway",
		"contest",
		"sweepstakes",
		"prize",
		"winner selection",
		"random winner",
		"online raffle",
		"digital raffle",
	],
	authors: [
		{
			name: "Raffle & Lucky Draw Team",
			url: "https://raffle-luckydraw.vercel.app",
		},
	],
	creator: "Raffle & Lucky Draw Team",
	publisher: "Raffle & Lucky Draw",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://raffle-luckydraw.vercel.app",
		siteName: "Raffle & Lucky Draw",
		title: {
			default: "Raffle & Lucky Draw",
			template: "%s | Raffle & Lucky Draw",
		},
		description:
			"Create and manage raffles and lucky draws for your events and giveaways.",
		images: [
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
		title: {
			default: "Raffle & Lucky Draw",
			template: "%s | Raffle & Lucky Draw",
		},
		description:
			"Create and manage raffles and lucky draws for your events and giveaways.",
		creator: "@raffleluckydraw",
		images: ["/twitter-image.png"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
		apple: "/apple-icon.png",
	},
	verification: {
		// Add your verification tokens here
		// google: 'your-google-verification-token',
		// bing: 'your-bing-verification-token',
	},
	alternates: {
		canonical: "https://raffle-luckydraw.vercel.app",
		languages: {
			"en-US": "https://raffle-luckydraw.vercel.app",
		},
	},
	category: "technology",
};

/**
 * Generate metadata for a specific page
 * @param pageMetadata - Page-specific metadata
 * @returns Merged metadata for the page
 */
export function generateMetadata(pageMetadata: PageMetadata): Metadata {
	const { useTitleTemplate = true, ...metadata } = pageMetadata;

	// If useTitleTemplate is false, use the title as is without the template
	if (!useTitleTemplate && typeof metadata.title === "string") {
		return {
			...defaultMetadata,
			...metadata,
			title: metadata.title,
			openGraph: {
				...defaultMetadata.openGraph,
				...metadata.openGraph,
				title: metadata.title,
			},
			twitter: {
				...defaultMetadata.twitter,
				...metadata.twitter,
				title: metadata.title,
			},
		};
	}

	return {
		...defaultMetadata,
		...metadata,
	};
}

/**
 * Generate website JSON-LD structured data
 * @returns Website JSON-LD data
 */
export function generateWebsiteJsonLd(): JsonLd {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: "Raffle & Lucky Draw",
		url: "https://raffle-luckydraw.vercel.app",
		potentialAction: {
			"@type": "SearchAction",
			target:
				"https://raffle-luckydraw.vercel.app/search?q={search_term_string}",
			"query-input": "required name=search_term_string",
		},
	};
}

/**
 * Generate organization JSON-LD structured data
 * @returns Organization JSON-LD data
 */
export function generateOrganizationJsonLd(): JsonLd {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "Raffle & Lucky Draw",
		url: "https://raffle-luckydraw.vercel.app",
		logo: "https://raffle-luckydraw.vercel.app/logo.png",
		sameAs: [
			"https://twitter.com/raffleluckydraw",
			"https://facebook.com/raffleluckydraw",
			"https://instagram.com/raffleluckydraw",
		],
	};
}
