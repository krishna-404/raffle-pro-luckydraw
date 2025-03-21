"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import type { Winner } from "../actions";

interface WinnerDetailsProps {
	winner: Winner | null;
	isOpen: boolean;
	onClose: () => void;
}

interface GeoLocation {
	country: string;
	city: string;
	region: string;
	loading: boolean;
	error: string | null;
}

// Function to parse user agent into a readable format
function parseUserAgent(userAgent: string | undefined | null): string {
	// If userAgent is undefined or null, return "Not available"
	if (!userAgent) {
		return "Not available";
	}

	try {
		// Extract browser information
		let browser = "Unknown";
		if (userAgent.includes("Firefox")) {
			browser = "Firefox";
		} else if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
			browser = "Chrome";
		} else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
			browser = "Safari";
		} else if (userAgent.includes("Edg")) {
			browser = "Edge";
		} else if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) {
			browser = "Internet Explorer";
		}

		// Extract OS information
		let os = "Unknown";
		if (userAgent.includes("Windows")) {
			os = "Windows";
		} else if (userAgent.includes("Mac OS")) {
			os = "macOS";
		} else if (userAgent.includes("Android")) {
			os = "Android";
		} else if (
			userAgent.includes("iOS") ||
			userAgent.includes("iPhone") ||
			userAgent.includes("iPad")
		) {
			os = "iOS";
		} else if (userAgent.includes("Linux")) {
			os = "Linux";
		}

		// Extract device type
		let device = "Desktop";
		if (userAgent.includes("Mobile")) {
			device = "Mobile";
		} else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
			device = "Tablet";
		}

		return `${browser} on ${os} (${device})`;
	} catch (error) {
		console.error("Error parsing user agent:", error);
		return userAgent;
	}
}

export function WinnerDetails({ winner, isOpen, onClose }: WinnerDetailsProps) {
	const [geoLocation, setGeoLocation] = useState<GeoLocation>({
		country: "",
		city: "",
		region: "",
		loading: false,
		error: null,
	});

	useEffect(() => {
		if (winner?.request_ip_address) {
			setGeoLocation((prev) => ({ ...prev, loading: true, error: null }));

			// Fetch geolocation data for the IP address
			fetch(`https://ipapi.co/${winner.request_ip_address}/json/`)
				.then((response) => {
					if (!response.ok) {
						throw new Error("Failed to fetch geolocation data");
					}
					return response.json();
				})
				.then((data) => {
					setGeoLocation({
						country: data.country_name || "",
						city: data.city || "",
						region: data.region || "",
						loading: false,
						error: null,
					});
				})
				.catch((error) => {
					console.error("Error fetching geolocation:", error);
					setGeoLocation((prev) => ({
						...prev,
						loading: false,
						error: "Failed to fetch geolocation data",
					}));
				});
		}
	}, [winner]);

	if (!winner) return null;

	// Parse user agent
	const readableUserAgent = parseUserAgent(winner.request_user_agent || "");

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent className="sm:max-w-[600px]">
				<AlertDialogHeader>
					<AlertDialogTitle>Winner Details</AlertDialogTitle>
					<AlertDialogDescription>
						Detailed information about the winner.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<div className="font-medium">Entry ID:</div>
						<div className="col-span-3">{winner.id}</div>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<div className="font-medium">Name:</div>
						<div className="col-span-3">{winner.name}</div>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<div className="font-medium">Email:</div>
						<div className="col-span-3">{winner.email || "-"}</div>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<div className="font-medium">WhatsApp:</div>
						<div className="col-span-3">{winner.whatsapp_number}</div>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<div className="font-medium">Company:</div>
						<div className="col-span-3">{winner.company_name || "-"}</div>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<div className="font-medium">Address:</div>
						<div className="col-span-3">{winner.address}</div>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<div className="font-medium">City:</div>
						<div className="col-span-3">{winner.city}</div>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<div className="font-medium">Pincode:</div>
						<div className="col-span-3">{winner.pincode}</div>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<div className="font-medium">Event:</div>
						<div className="col-span-3">{winner.event_name}</div>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<div className="font-medium">Prize:</div>
						<div className="col-span-3">
							<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
								{winner.prize_name}
							</span>
						</div>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<div className="font-medium">IP Address:</div>
						<div className="col-span-3">
							{winner.request_ip_address || "Not available"}
							{geoLocation.loading && (
								<span className="ml-2 text-xs text-muted-foreground">
									Loading location...
								</span>
							)}
							{geoLocation.error && (
								<span className="ml-2 text-xs text-red-500">
									{geoLocation.error}
								</span>
							)}
							{!geoLocation.loading &&
								!geoLocation.error &&
								geoLocation.city && (
									<span className="ml-2 text-xs text-muted-foreground">
										{geoLocation.city}, {geoLocation.region},{" "}
										{geoLocation.country}
									</span>
								)}
						</div>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<div className="font-medium">Device:</div>
						<div className="col-span-3">
							{readableUserAgent || "Not available"}
						</div>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<div className="font-medium">Created At:</div>
						<div className="col-span-3">
							{format(new Date(winner.created_at), "PPpp")}
						</div>
					</div>
				</div>
				<AlertDialogFooter>
					<AlertDialogAction onClick={() => onClose()}>Close</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
