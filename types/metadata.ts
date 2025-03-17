import type { Metadata, ResolvedMetadata } from "next";

/**
 * Base metadata interface extending Next.js Metadata
 */
export interface SiteMetadata extends Metadata {
	/**
	 * The title template for the site
	 * @example "%s | Site Name"
	 */
	titleTemplate?: string;

	/**
	 * The site name
	 */
	siteName?: string;

	/**
	 * The site URL
	 */
	siteUrl?: string;

	/**
	 * The site locale
	 * @default "en_US"
	 */
	locale?: string;

	/**
	 * The site type (for Open Graph)
	 * @default "website"
	 */
	type?: string;

	/**
	 * The site authors
	 */
	authors?: {
		name: string;
		url?: string;
	}[];

	/**
	 * The site keywords
	 */
	keywords?: string[];

	/**
	 * The site verification tokens
	 */
	verification?: {
		google?: string;
		yandex?: string;
		yahoo?: string;
		bing?: string;
	};
}

/**
 * Page-specific metadata interface
 */
export interface PageMetadata extends Partial<SiteMetadata> {
	/**
	 * Whether to use the title template
	 * @default true
	 */
	useTitleTemplate?: boolean;
}

/**
 * JSON-LD structured data types
 */
export type JsonLdType = string;

/**
 * Generic schema.org object type for nested objects
 */
export interface SchemaObject {
	"@type"?: string;
	[key: string]:
		| string
		| number
		| boolean
		| null
		| undefined
		| SchemaObject
		| Array<string | number | boolean | SchemaObject | null | undefined>;
}

/**
 * JSON-LD structured data interface
 */
export interface JsonLd {
	"@context": string;
	"@type": JsonLdType;
	[key: string]:
		| string
		| number
		| boolean
		| null
		| undefined
		| SchemaObject
		| JsonLd
		| Array<
				string | number | boolean | SchemaObject | JsonLd | null | undefined
		  >;
}

/**
 * Metadata resolver function type
 */
export type MetadataResolver = (
	parent?: ResolvedMetadata,
) => Promise<Metadata> | Metadata;
