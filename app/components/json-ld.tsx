import type { JsonLd as JsonLdType } from "@/types/metadata";

interface JsonLdProps {
	data: JsonLdType | JsonLdType[];
}

/**
 * JSON-LD structured data component
 * @param data - JSON-LD data
 * @returns JSON-LD script element
 */
export function JsonLd({ data }: JsonLdProps) {
	const jsonLdData = Array.isArray(data) ? data : [data];
	// Using dangerouslySetInnerHTML is necessary for JSON-LD structured data
	// This is a common pattern for adding structured data to a page
	// eslint-disable-next-line react/no-danger
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(jsonLdData),
			}}
		/>
	);
}
