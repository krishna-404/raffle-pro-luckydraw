"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";
import { useEffect, useState } from "react";

export function AppDownloadBanner() {
	const [isIOS, setIsIOS] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		// Detect iOS devices
		const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
		setIsIOS(iOS);

		// Detect mobile devices
		const mobile =
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
				navigator.userAgent,
			);
		setIsMobile(mobile);
	}, []);

	if (!isMobile) return null; // Don't show on desktop

	const appStoreUrl = "https://m.kayaanprints.com";
	const buttonText = isIOS ? "Download on App Store" : "Get it on Play Store";
	const iconColor = isIOS ? "#000000" : "#00ff00"; // Black for iOS, Green for Android

	return (
		<div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
			<div className="flex items-center justify-between max-w-7xl mx-auto">
				<div className="flex-1">
					<h3 className="text-lg font-semibold">Kayaan Wholesale App</h3>
					<p className="text-sm text-muted-foreground">
						Download our app for a better shopping experience
					</p>
				</div>
				<Button asChild className="flex items-center gap-2">
					<a href={appStoreUrl} target="_blank" rel="noopener noreferrer">
						<Download size={20} />
						{buttonText}
						<ArrowRight size={16} className="ml-1" />
					</a>
				</Button>
			</div>
		</div>
	);
}
