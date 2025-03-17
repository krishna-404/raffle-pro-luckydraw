import { RootLayoutWrapper } from "@/components/layout/root-layout";
import { Inter, Playfair_Display } from "next/font/google";
import { JsonLd } from "./components/json-ld";
import "./globals.css";
import {
	defaultMetadata,
	generateOrganizationJsonLd,
	generateWebsiteJsonLd,
} from "./lib/metadata";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({
	subsets: ["latin"],
	variable: "--font-serif",
});

export const metadata = defaultMetadata;

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={`${inter.className} ${playfair.variable}`}>
			<head>
				<JsonLd data={generateWebsiteJsonLd()} />
				<JsonLd data={generateOrganizationJsonLd()} />
			</head>
			<body className="min-h-screen flex flex-col">
				<RootLayoutWrapper>{children}</RootLayoutWrapper>
			</body>
		</html>
	);
}
