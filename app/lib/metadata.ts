import type { JsonLd, PageMetadata, SiteMetadata } from "@/types/metadata";
import type { Metadata } from "next";

/**
 * Default site metadata configuration
 */
export const defaultMetadata: SiteMetadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_SITE_URL || "https://houseofkayaan.com",
	),
	title: {
		default: "Kayaan Prints - Elegant Saree Collection",
		template: "%s | Kayaan Prints",
	},
	description:
		"Discover our exquisite collection of handcrafted sarees, where tradition meets contemporary design.",
	keywords: [
		"elegant sarees",
		"handcrafted sarees",
		"traditional sarees",
		"designer sarees",
		"luxury sarees",
		"Indian wear",
		"Kayaan Prints",
		"saree collection",
		"premium sarees",
		"wedding sarees",
	],
	authors: [
		{
			name: "Kayaan Prints",
			url: "https://houseofkayaan.com",
		},
	],
	creator: "Kayaan Prints",
	publisher: "Kayaan Prints Pvt. Ltd.",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	openGraph: {
		type: "website",
		locale: "en_IN",
		url: "https://houseofkayaan.com",
		siteName: "Kayaan Prints",
		title: {
			default: "Kayaan Prints - Elegant Saree Collection",
			template: "%s | Kayaan Prints",
		},
		description:
			"Discover our exquisite collection of handcrafted sarees, where tradition meets contemporary design.",
		images: [
			{
				url: "/opengraph-image.png",
				width: 1200,
				height: 630,
				alt: "Kayaan Prints - Elegant Saree Collection",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: {
			default: "Kayaan Prints - Elegant Saree Collection",
			template: "%s | Kayaan Prints",
		},
		description:
			"Discover our exquisite collection of handcrafted sarees, where tradition meets contemporary design.",
		creator: "@KayaanLtd",
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
		canonical: "https://houseofkayaan.com",
		languages: {
			"en-IN": "https://houseofkayaan.com",
		},
	},
	category: "shopping",
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
		name: "Kayaan Prints",
		url: "https://houseofkayaan.com",
		potentialAction: {
			"@type": "SearchAction",
			target: "https://houseofkayaan.com/search?q={search_term_string}",
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
		name: "Kayaan Prints",
		url: "https://houseofkayaan.com",
		logo: "https://houseofkayaan.com/kayaan-logo.jpeg",
		sameAs: [
			"https://twitter.com/KayaanLtd",
			"https://facebook.com/kayaan.prints",
			"https://instagram.com/kayaanprintspvtltd",
		],
	};
}
