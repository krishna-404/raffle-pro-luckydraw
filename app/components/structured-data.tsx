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
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "Raffle & Lucky Draw",
		url: "https://raffle-luckydraw.vercel.app",
		logo: "https://raffle-luckydraw.vercel.app/logo.png",
		description:
			"Create and manage raffles and lucky draws for your events and giveaways.",
		sameAs: [
			"https://twitter.com/raffleluckydraw",
			"https://facebook.com/raffleluckydraw",
			"https://instagram.com/raffleluckydraw",
		],
	};
}

/**
 * Generate HomePage specific structured data
 */
function generateHomePageData(): JsonLdType {
	return {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Raffle & Lucky Draw - Create and manage digital raffles",
		description:
			"Create and manage raffles and lucky draws for your events and giveaways.",
		url: "https://raffle-luckydraw.vercel.app",
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
	};
}

/**
 * Generate Giveaway page specific structured data
 */
function generateGiveawayData(): JsonLdType {
	// Use static dates to avoid hydration mismatch
	const startDate = "2025-03-01T00:00:00Z";
	const endDate = "2025-12-30T23:59:59Z";

	return {
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
			url: "https://raffle-luckydraw.vercel.app/giveaway",
		},
		image: "https://raffle-luckydraw.vercel.app/giveaway-og-image.png",
		organizer: {
			"@type": "Organization",
			name: "Raffle & Lucky Draw",
			url: "https://raffle-luckydraw.vercel.app",
		},
	};
}
