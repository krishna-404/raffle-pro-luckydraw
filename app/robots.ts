import type { MetadataRoute } from "next";

/**
 * Generate robots.txt for the application
 * @returns Robots.txt configuration
 */
export default function robots(): MetadataRoute.Robots {
	const baseUrl =
		process.env.NEXT_PUBLIC_SITE_URL || "https://raffle-luckydraw.vercel.app";

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/api/", "/admin/", "/_next/", "/private/"],
		},
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
