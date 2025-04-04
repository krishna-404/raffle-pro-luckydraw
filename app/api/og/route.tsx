import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Dynamic OG image generation API route
 * @param req The incoming request
 * @returns An ImageResponse or a redirect to a fallback image
 */
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);

		// Get the title from the search parameters
		const title = searchParams.get("title");
		if (!title) {
			return new Response("Missing title parameter", { status: 400 });
		}

		// Get other parameters with defaults
		const description =
			searchParams.get("description") ||
			"Discover our exquisite collection of handcrafted sarees, where tradition meets contemporary design.";
		const route = searchParams.get("route") || "/";

		// Load the Inter font
		const interRegular = await fetch(
			"https://fonts.googleapis.com/css2?family=Inter&display=swap",
		).then((res) => res.arrayBuffer());

		const interBold = await fetch(
			"https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap",
		).then((res) => res.arrayBuffer());

		// Create a simple OG image with just text
		return new ImageResponse(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#111827",
					color: "white",
					padding: "40px 60px",
					fontFamily: "Inter",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						textAlign: "center",
						width: "100%",
						maxWidth: "800px",
					}}
				>
					<div
						style={{
							marginBottom: "30px",
							padding: "15px 30px",
							backgroundColor: "white",
							color: "#111827",
							borderRadius: "8px",
							fontWeight: "bold",
							fontSize: "32px",
						}}
					>
						Kayaan Prints
					</div>
					<h1
						style={{
							fontSize: "60px",
							fontWeight: "bold",
							marginBottom: "20px",
							lineHeight: 1.2,
						}}
					>
						{title}
					</h1>
					{description && (
						<p
							style={{
								fontSize: "30px",
								marginTop: "0",
								marginBottom: "40px",
								lineHeight: 1.4,
								opacity: 0.8,
							}}
						>
							{description}
						</p>
					)}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							marginTop: "20px",
						}}
					>
						<p
							style={{
								fontSize: "24px",
								opacity: 0.6,
							}}
						>
							kayaanprints.com{route !== "/" ? route : ""}
						</p>
					</div>
				</div>
			</div>,
			{
				width: 1200,
				height: 630,
				fonts: [
					{
						name: "Inter",
						data: interRegular,
						style: "normal",
						weight: 400,
					},
					{
						name: "Inter",
						data: interBold,
						style: "normal",
						weight: 700,
					},
				],
			},
		);
	} catch (error) {
		console.error("Error generating OG image:", error);

		// Determine which fallback image to use based on the route
		const route = new URL(req.url).searchParams.get("route") || "/";
		const fallbackImage =
			route === "/giveaway" ? "/giveaway-og-image.png" : "/opengraph-image.png";

		// Redirect to the fallback image
		return new Response(null, {
			status: 307,
			headers: {
				Location: fallbackImage,
			},
		});
	}
}
