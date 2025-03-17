import type { MetadataRoute } from "next";

/**
 * Generate sitemap for the application
 * @returns Sitemap configuration
 */
export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl =
		process.env.NEXT_PUBLIC_SITE_URL || "https://raffle-luckydraw.vercel.app";

	// Define your routes here
	const routes = [
		{
			url: "/",
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: "/about",
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: "/giveaway",
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.9,
		},
		// Add more routes as needed
	];

	return routes.map((route) => ({
		url: `${baseUrl}${route.url}`,
		lastModified: route.lastModified,
		changeFrequency: route.changeFrequency as
			| "always"
			| "hourly"
			| "daily"
			| "weekly"
			| "monthly"
			| "yearly"
			| "never",
		priority: route.priority,
	}));
}
