"use client";

import type { JsonLd as JsonLdType } from "@/types/metadata";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { JsonLd } from "./json-ld";

/**
 * Component that injects route-specific structured data
 * Currently supports homepage and /giveaway route
 */
export function StructuredData() {
	const pathname = usePathname();
	const [mounted, setMounted] = useState(false);

	// Only run on client to avoid hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	// Only render structured data for homepage and /giveaway route
	// And only after client-side hydration is complete
	if (!mounted || (pathname !== "/" && pathname !== "/giveaway")) {
		return null;
	}

	return (
		<>
			{/* Common structured data for all supported routes */}
			<JsonLd data={generateOrganizationData()} />

			{/* Route-specific structured data */}
			{pathname === "/" && <JsonLd data={generateHomePageData()} />}
			{pathname === "/giveaway" && <JsonLd data={generateGiveawayData()} />}
		</>
	);
}

/**
 * Generate Organization structured data
 */
function generateOrganizationData(): JsonLdType {
	const baseUrl = "https://raffle-luckydraw.vercel.app";

	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "Raffle & Lucky Draw",
		url: baseUrl,
		logo: `${baseUrl}/logo.png`,
		description:
			"Create and manage raffles and lucky draws for your events and giveaways.",
		sameAs: [
			"https://twitter.com/raffleluckydraw",
			"https://facebook.com/raffleluckydraw",
			"https://instagram.com/raffleluckydraw",
		],
		contactPoint: [
			{
				"@type": "ContactPoint",
				telephone: "+1-800-123-4567",
				contactType: "customer service",
				email: "support@raffle-luckydraw.vercel.app",
				availableLanguage: ["English"],
			},
		],
		address: {
			"@type": "PostalAddress",
			streetAddress: "123 Raffle Street",
			addressLocality: "San Francisco",
			addressRegion: "CA",
			postalCode: "94103",
			addressCountry: "US",
		},
	};
}

/**
 * Generate HomePage specific structured data
 */
function generateHomePageData(): JsonLdType[] {
	const baseUrl = "https://raffle-luckydraw.vercel.app";

	return [
		// WebPage structured data
		{
			"@context": "https://schema.org",
			"@type": "WebPage",
			name: "Raffle & Lucky Draw - Create and manage digital raffles",
			description:
				"Create and manage raffles and lucky draws for your events and giveaways.",
			url: baseUrl,
			mainEntity: {
				"@type": "Service",
				name: "Digital Raffle Platform",
				description:
					"A platform for creating and managing digital raffles and giveaways",
				provider: {
					"@type": "Organization",
					name: "Raffle & Lucky Draw",
				},
				serviceType: "Digital Raffle Service",
			},
		},
		// WebSite structured data
		{
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: "Raffle & Lucky Draw",
			url: baseUrl,
			potentialAction: {
				"@type": "SearchAction",
				target: `${baseUrl}/search?q={search_term_string}`,
				"query-input": "required name=search_term_string",
			},
		},
		// FAQPage structured data
		{
			"@context": "https://schema.org",
			"@type": "FAQPage",
			mainEntity: [
				{
					"@type": "Question",
					name: "How do I create a raffle?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "You can create a raffle by signing up for an account and using our simple raffle creation tool. Just set the details, add prizes, and share the link with participants.",
					},
				},
				{
					"@type": "Question",
					name: "Is it free to use?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "We offer both free and premium plans. The free plan allows you to create basic raffles with limited participants, while premium plans offer more features and capacity.",
					},
				},
				{
					"@type": "Question",
					name: "How are winners selected?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "Winners are selected using a cryptographically secure random number generator to ensure fair and unbiased results for all participants.",
					},
				},
			],
		},
	];
}

/**
 * Generate Giveaway page specific structured data
 */
function generateGiveawayData(): JsonLdType[] {
	// Use static dates to avoid hydration mismatch
	const startDate = "2025-03-01T00:00:00Z";
	const endDate = "2025-12-30T23:59:59Z";
	const baseUrl = "https://raffle-luckydraw.vercel.app";

	// Create an array of structured data objects
	return [
		// Event structured data
		{
			"@context": "https://schema.org",
			"@type": "Event",
			name: "Raffle & Lucky Draw Giveaway",
			description:
				"Participate in our exciting raffles and lucky draws to win amazing prizes.",
			startDate: startDate,
			endDate: endDate,
			eventStatus: "https://schema.org/EventScheduled",
			eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
			location: {
				"@type": "VirtualLocation",
				url: `${baseUrl}/giveaway`,
			},
			image: `${baseUrl}/giveaway-og-image.png`,
			organizer: {
				"@type": "Organization",
				name: "Raffle & Lucky Draw",
				url: baseUrl,
			},
			offers: {
				"@type": "Offer",
				price: "0",
				priceCurrency: "USD",
				availability: "https://schema.org/InStock",
				validFrom: startDate,
				url: `${baseUrl}/giveaway`,
			},
		},
		// BreadcrumbList structured data
		{
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: [
				{
					"@type": "ListItem",
					position: 1,
					name: "Home",
					item: baseUrl,
				},
				{
					"@type": "ListItem",
					position: 2,
					name: "Giveaway",
					item: `${baseUrl}/giveaway`,
				},
			],
		},
	];
}
