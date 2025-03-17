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
		name: "Kayaan Prints",
		url: baseUrl,
		logo: `${baseUrl}/kayaan-logo.jpeg`,
		description:
			"Discover our exquisite collection of handcrafted sarees, where tradition meets contemporary design.",
		sameAs: [
			"https://twitter.com/KayaanLtd",
			"https://facebook.com/kayaan.prints",
			"https://instagram.com/kayaanprintspvtltd",
		],
		contactPoint: [
			{
				"@type": "ContactPoint",
				telephone: "+91 89328 93893",
				contactType: "customer service",
				availableLanguage: ["English", "Hindi", "Gujarati"],
			},
		],
		address: {
			"@type": "PostalAddress",
			streetAddress:
				"F-5723 to 5752, Lift No.6, 3rd Floor, Raghukul Market, Ring Road",
			addressLocality: "Surat",
			addressRegion: "Gujarat",
			postalCode: "395002",
			addressCountry: "IN",
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
			name: "Kayaan Prints - Elegant Saree Collection",
			description:
				"Discover our exquisite collection of handcrafted sarees, where tradition meets contemporary design.",
			url: baseUrl,
			mainEntity: {
				"@type": "Store",
				name: "Kayaan Prints",
				description:
					"A premium store offering exquisite handcrafted sarees that blend tradition with contemporary design",
				telephone: "+91 89328 93893",
				openingHours: "Mo-Sa 10:00-19:00",
				hasMap: "https://goo.gl/maps/XYZ123",
				address: {
					"@type": "PostalAddress",
					streetAddress:
						"F-5723 to 5752, Lift No.6, 3rd Floor, Raghukul Market, Ring Road",
					addressLocality: "Surat",
					addressRegion: "Gujarat",
					postalCode: "395002",
					addressCountry: "IN",
				},
			},
		},
		// WebSite structured data
		{
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: "Kayaan Prints",
			url: baseUrl,
		},
		// FAQPage structured data
		{
			"@context": "https://schema.org",
			"@type": "FAQPage",
			mainEntity: [
				{
					"@type": "Question",
					name: "What types of sarees does Kayaan Prints offer?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "Kayaan Prints offers a wide range of handcrafted sarees that blend traditional craftsmanship with contemporary designs. Our collection includes luxury silk sarees, designer printed sarees, and exclusive festive and wedding collections.",
					},
				},
				{
					"@type": "Question",
					name: "How can I purchase a saree from Kayaan Prints?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "You can connect with us directly on WhatsApp or visit our store in Surat. We provide personalized assistance to help you select the perfect saree for your occasion.",
					},
				},
				{
					"@type": "Question",
					name: "Does Kayaan Prints ship internationally?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "Yes, we offer international shipping for our exclusive saree collections. Please contact us directly for shipping details and delivery timeframes for your location.",
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
			name: "Kayaan Prints Saree Giveaway",
			description:
				"Participate in our exclusive saree giveaway and win exquisite handcrafted designer sarees from Kayaan Prints.",
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
				name: "Kayaan Prints",
				url: baseUrl,
			},
			offers: {
				"@type": "Offer",
				price: "0",
				priceCurrency: "INR",
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
					name: "Saree Giveaway",
					item: `${baseUrl}/giveaway`,
				},
			],
		},
	];
}
