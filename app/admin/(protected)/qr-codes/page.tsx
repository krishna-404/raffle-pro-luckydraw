"use client";

import { DashboardHeader } from "@/app/admin/(protected)/components/header";
import { DashboardShell } from "@/app/admin/(protected)/components/shell";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { format, subDays } from "date-fns";
import { Download, FileDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
	type QrCodeGroup,
	getQrCodeGroups,
	getQrCodesByGroup,
} from "./actions";
import { generateQrCodePdf } from "./pdf-generator";

// Helper function to adjust UTC midnight to display the correct date
function formatExpiryDate(dateString: string | null): string {
	if (!dateString) return "Never";

	// Parse the UTC date
	const utcDate = new Date(dateString);

	// If it's 23:59:59 UTC (end of day), subtract a day to get the correct day
	// This handles the case where we store the end of day in UTC but need to display
	// the actual day that was selected
	if (utcDate.getUTCHours() === 23 && utcDate.getUTCMinutes() === 59) {
		return format(subDays(utcDate, 1), "PPP");
	}

	return format(utcDate, "PPP");
}

export default function QrCodesPage() {
	const [groups, setGroups] = useState<QrCodeGroup[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
	const [pdfBlob, setPdfBlob] = useState<{ id: string; blob: Blob } | null>(
		null,
	);
	const { toast } = useToast();

	useEffect(() => {
		fetchQrCodes();
	}, []);

	const fetchQrCodes = async () => {
		try {
			setLoading(true);
			const { data, total } = await getQrCodeGroups();
			setGroups(data);
			setTotal(total);
		} catch (error) {
			console.error("Failed to fetch QR codes:", error);
			toast({
				title: "Error",
				description: "Failed to fetch QR codes",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleGeneratePdf = async (group: QrCodeGroup) => {
		try {
			// Create a unique ID for this group
			const groupId = `${group.created_at}-${group.created_by_admin}-${group.expires_at}`;

			// Set loading state
			setGeneratingPdf(groupId);

			// Show initial toast for starting the process
			toast({
				title: "Generating PDF",
				description: `Fetching QR codes for ${format(new Date(group.created_at), "PPP p")}...`,
			});

			console.log("Starting PDF generation for group:", {
				createdAt: group.created_at,
				admin: group.created_by_admin,
				expiresAt: group.expires_at,
				expectedTotal: group.total,
			});

			// Fetch QR codes for this group
			const qrCodes = await getQrCodesByGroup(
				group.created_at,
				group.created_by_admin,
				group.expires_at,
			);

			if (qrCodes.length === 0) {
				console.error(
					"No QR codes found for batch with exact timestamp match:",
					{
						exactCreatedAt: group.created_at,
						admin: group.created_by_admin,
						expectedTotal: group.total,
					},
				);

				toast({
					title: "No QR codes found",
					description:
						"There are no QR codes available for this exact timestamp. This may be due to timestamp precision differences in the database.",
					variant: "destructive",
				});
				return;
			}

			if (qrCodes.length !== group.total) {
				console.warn(
					`Found ${qrCodes.length} QR codes, but expected ${group.total}`,
				);

				toast({
					title: "Warning",
					description: `Found ${qrCodes.length} QR codes, but expected ${group.total}. Proceeding with available QR codes.`,
					variant: "default",
				});
			} else {
				console.log(`Found all ${qrCodes.length} QR codes for PDF generation`);
			}

			// Update toast to show progress
			toast({
				title: "Generating PDF",
				description: `Creating PDF with ${qrCodes.length} QR codes...`,
			});

			// Generate PDF
			const baseUrl = window.location.origin;
			const blob = await generateQrCodePdf(qrCodes, baseUrl);

			// Store the blob with its ID
			setPdfBlob({ id: groupId, blob });

			toast({
				title: "Success",
				description: `PDF with ${qrCodes.length} QR codes generated successfully. Click "Download PDF" to save.`,
				variant: "default",
				className: "bg-green-50 border-green-200 text-green-800",
			});
		} catch (error) {
			console.error("Failed to generate PDF:", error);

			// Extract error message
			const errorMessage =
				error instanceof Error ? error.message : "An unknown error occurred";

			// Display more specific error message
			toast({
				title: "Error generating PDF",
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			setGeneratingPdf(null);
		}
	};

	const handleDownloadPdf = (group: QrCodeGroup) => {
		const groupId = `${group.created_at}-${group.created_by_admin}-${group.expires_at}`;

		if (pdfBlob && pdfBlob.id === groupId) {
			// Create a download link
			const url = URL.createObjectURL(pdfBlob.blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `qr-codes-${format(new Date(group.created_at), "yyyy-MM-dd")}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		}
	};

	return (
		<DashboardShell>
			<DashboardHeader
				heading="QR Codes"
				text="Overview of QR codes grouped by creation date and time."
			>
				<Button asChild>
					<Link href="/admin/qr-codes/generate">Generate QR Codes</Link>
				</Button>
			</DashboardHeader>

			<div className="space-y-4">
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Created Date & Time</TableHead>
								<TableHead>Created By</TableHead>
								<TableHead>Total QR Codes</TableHead>
								<TableHead>Used</TableHead>
								<TableHead>Unused</TableHead>
								<TableHead>Usage %</TableHead>
								<TableHead>Expires At</TableHead>
								<TableHead>PDF</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={8} className="text-center">
										Loading...
									</TableCell>
								</TableRow>
							) : groups.length === 0 ? (
								<TableRow>
									<TableCell colSpan={8} className="text-center">
										No QR codes found
									</TableCell>
								</TableRow>
							) : (
								groups.map((group) => {
									const groupId = `${group.created_at}-${group.created_by_admin}-${group.expires_at}`;
									const isPdfGenerated = pdfBlob && pdfBlob.id === groupId;
									const isGenerating = generatingPdf === groupId;

									return (
										<TableRow key={groupId}>
											<TableCell>
												{format(new Date(group.created_at), "PPP p")}
											</TableCell>
											<TableCell>{group.created_by_admin}</TableCell>
											<TableCell>{group.total}</TableCell>
											<TableCell>{group.used}</TableCell>
											<TableCell>{group.unused}</TableCell>
											<TableCell>
												{((group.used / group.total) * 100).toFixed(1)}%
											</TableCell>
											<TableCell>
												{formatExpiryDate(group.expires_at)}
											</TableCell>
											<TableCell>
												{isPdfGenerated ? (
													<Button
														variant="default"
														size="sm"
														onClick={() => handleDownloadPdf(group)}
														className="bg-green-600 hover:bg-green-700 text-white"
													>
														<Download className="h-4 w-4 mr-1" />
														Download PDF
													</Button>
												) : (
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleGeneratePdf(group)}
														disabled={isGenerating}
													>
														{isGenerating ? (
															<>
																<Loader2 className="h-4 w-4 mr-1 animate-spin" />
																Generating...
															</>
														) : (
															<>
																<FileDown className="h-4 w-4 mr-1" />
																Generate PDF
															</>
														)}
													</Button>
												)}
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</div>

				<div className="text-sm text-muted-foreground">
					Total QR Codes: {total}
				</div>
			</div>
		</DashboardShell>
	);
}
