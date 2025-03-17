"use client";

import { Button } from "@/components/ui/button";
import { Html5Qrcode } from "html5-qrcode";
import { Check, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../../components/ui/dialog";

interface QrCodeScannerProps {
	isOpen: boolean;
	onClose: () => void;
}

export function QrCodeScanner({ isOpen, onClose }: QrCodeScannerProps) {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [validUrl, setValidUrl] = useState<string | null>(null);
	const scannerRef = useRef<Html5Qrcode | null>(null);
	const scannerContainerId = "qr-reader";
	const [isScanning, setIsScanning] = useState(false);

	// Handle dialog close
	const handleClose = useCallback(() => {
		// Don't use async here to avoid potential race conditions
		if (scannerRef.current) {
			try {
				scannerRef.current.stop().catch((err) => {
					// Just log and ignore errors during close
					console.debug("Error during close:", err);
				});
			} catch (err) {
				console.debug("Error during close:", err);
			}
		}
		onClose();
	}, [onClose]);

	// Single useEffect to handle scanner lifecycle
	useEffect(() => {
		let scanner: Html5Qrcode | null = null;
		let timerId: NodeJS.Timeout | null = null;

		const initializeScanner = () => {
			// Reset states
			setError(null);
			setValidUrl(null);
			setIsScanning(false);

			// Create scanner instance
			try {
				scanner = new Html5Qrcode(scannerContainerId);
				scannerRef.current = scanner;

				// Start scanner
				scanner
					.start(
						{ facingMode: "environment" }, // Use back camera
						{
							fps: 10,
							qrbox: { width: 250, height: 250 },
						},
						handleScanSuccess,
						handleScanFailure,
					)
					.then(() => {
						setIsScanning(true);
					})
					.catch((err) => {
						console.error("QR Scanner initialization error:", err);
						setError(
							"Could not access camera. Please ensure camera permissions are granted.",
						);
						scannerRef.current = null;
					});
			} catch (err) {
				console.error("QR Scanner creation error:", err);
				setError("Could not initialize camera. Please try again.");
				scannerRef.current = null;
			}
		};

		const handleScanSuccess = (decodedText: string) => {
			// First stop the scanner to prevent multiple scans
			if (scanner) {
				scanner.stop().catch((err) => console.debug("Stop error:", err));
				setIsScanning(false);
			}

			try {
				// Validate URL format
				const url = new URL(decodedText);

				// Check if URL matches our pattern
				if (
					url.pathname.startsWith("/giveaway/qr-code") &&
					url.searchParams.has("code") &&
					/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
						url.searchParams.get("code") || "",
					)
				) {
					// Valid QR code URL
					setValidUrl(decodedText);
					setError(null);
				} else {
					// Invalid QR code format
					setError(
						"Invalid QR code format. Please scan a valid giveaway QR code.",
					);
				}
			} catch (err) {
				// Not a valid URL
				setError("Invalid QR code. Please scan a valid giveaway QR code.");
			}
		};

		const handleScanFailure = (error: string) => {
			// Don't show errors during normal scanning
			console.debug("QR scan error:", error);
		};

		// Start scanner with a delay when dialog opens
		if (isOpen) {
			timerId = setTimeout(() => {
				initializeScanner();
			}, 500);
		}

		// Cleanup function
		return () => {
			if (timerId) {
				clearTimeout(timerId);
			}

			// Clean up scanner
			if (scannerRef.current) {
				try {
					scannerRef.current.stop().catch((err) => {
						// Just log and ignore errors during cleanup
						console.debug("Cleanup error:", err);
					});
				} catch (err) {
					console.debug("Cleanup error:", err);
				}
				scannerRef.current = null;
			}
			setIsScanning(false);
		};
	}, [isOpen]); // Only depend on isOpen

	const handleNavigate = () => {
		if (validUrl) {
			router.push(validUrl);
			handleClose();
		}
	};

	const handleRetry = () => {
		// Reset states
		setError(null);
		if (validUrl) {
			setValidUrl(null);
		}

		// Clean up any existing scanner
		if (scannerRef.current) {
			try {
				scannerRef.current.stop().catch(() => {});
			} catch (err) {
				// Ignore errors
			}
			scannerRef.current = null;
		}
		setIsScanning(false);

		// Re-initialize scanner after a short delay
		setTimeout(() => {
			try {
				const scanner = new Html5Qrcode(scannerContainerId);
				scannerRef.current = scanner;

				scanner
					.start(
						{ facingMode: "environment" },
						{
							fps: 10,
							qrbox: { width: 250, height: 250 },
						},
						(decodedText) => {
							// Stop scanner immediately
							scanner.stop().catch(() => {});
							setIsScanning(false);

							try {
								// Validate URL format
								const url = new URL(decodedText);

								// Check if URL matches pattern
								if (
									url.pathname.startsWith("/giveaway/qr-code") &&
									url.searchParams.has("code") &&
									/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
										url.searchParams.get("code") || "",
									)
								) {
									setValidUrl(decodedText);
									setError(null);
								} else {
									setError(
										"Invalid QR code format. Please scan a valid giveaway QR code.",
									);
								}
							} catch (err) {
								setError(
									"Invalid QR code. Please scan a valid giveaway QR code.",
								);
							}
						},
						(error) => console.debug("QR scan error:", error),
					)
					.then(() => {
						setIsScanning(true);
					})
					.catch((err) => {
						console.error("Error restarting scanner:", err);
						setError("Failed to restart camera. Please try again.");
					});
			} catch (err) {
				console.error("Error creating scanner:", err);
				setError("Failed to initialize camera. Please try again.");
			}
		}, 300);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{validUrl ? "QR Code Detected" : "Scan QR Code"}
					</DialogTitle>
					<DialogDescription>
						{validUrl
							? "Valid QR code detected! Click below to continue."
							: "Position the QR code within the frame to scan"}
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col items-center justify-center space-y-4">
					{/* Success View */}
					{validUrl && (
						<div className="text-center space-y-4">
							<div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
								<Check className="h-8 w-8 text-green-600" />
							</div>
							<p className="text-lg font-medium">
								QR Code Successfully Scanned
							</p>
							<p className="text-sm text-muted-foreground">
								Click the button below to continue to the entry form.
							</p>
						</div>
					)}

					{/* Scanner View - Only show if not successful yet */}
					{!validUrl && (
						<>
							<div
								id={scannerContainerId}
								className="w-full max-w-[300px] h-[300px] bg-muted rounded-md overflow-hidden"
							/>

							{/* Error Message */}
							{error && (
								<div className="text-sm text-red-500 text-center">{error}</div>
							)}
						</>
					)}
				</div>

				<DialogFooter className="flex flex-col sm:flex-row gap-2">
					{/* Show different buttons based on state */}
					{validUrl ? (
						<Button onClick={handleNavigate} className="w-full">
							Continue to Form
						</Button>
					) : error ? (
						<Button onClick={handleRetry} className="w-full">
							<RefreshCw className="mr-2 h-4 w-4" />
							Try Again
						</Button>
					) : (
						<Button variant="outline" onClick={handleClose} className="w-full">
							Cancel
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
