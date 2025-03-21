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
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Download, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { type Entry, type PaginationParams, getEntries } from "./actions";
import { EntryDetails } from "./components/entry-details";

export default function EntriesPage() {
	const [entries, setEntries] = useState<Entry[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [pagination, setPagination] = useState<{
		page: number;
		pageSize: number;
		totalPages: number;
	}>({
		page: 1,
		pageSize: 10,
		totalPages: 1,
	});

	useEffect(() => {
		fetchEntries({ page: pagination.page, pageSize: pagination.pageSize });
	}, [pagination.page, pagination.pageSize]);

	const fetchEntries = async (params: PaginationParams) => {
		try {
			setLoading(true);
			const { data, total, page, pageSize, totalPages } =
				await getEntries(params);
			setEntries(data);
			setTotal(total);
			setPagination({ page, pageSize, totalPages });
		} catch (error) {
			console.error("Failed to fetch entries:", error);
		} finally {
			setLoading(false);
		}
	};

	const handlePageChange = (newPage: number) => {
		if (newPage > 0 && newPage <= pagination.totalPages) {
			setPagination((prev) => ({ ...prev, page: newPage }));
		}
	};

	const handlePageSizeChange = (
		event: React.ChangeEvent<HTMLSelectElement>,
	) => {
		const newPageSize = Number.parseInt(event.target.value, 10);
		setPagination((prev) => ({ ...prev, pageSize: newPageSize, page: 1 }));
	};

	const handleExport = async () => {
		try {
			const response = await fetch("/api/admin/entries/export");
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `entries-${format(new Date(), "yyyy-MM-dd")}.csv`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			console.error("Failed to export entries:", error);
		}
	};

	const handleViewDetails = (entry: Entry) => {
		setSelectedEntry(entry);
		setIsDetailsOpen(true);
	};

	return (
		<DashboardShell>
			<DashboardHeader
				heading="Entries"
				text="View and manage all event entries."
			>
				<Button onClick={handleExport}>
					<Download className="mr-2 h-4 w-4" />
					Export to CSV
				</Button>
			</DashboardHeader>

			<div className="space-y-4">
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Entry ID</TableHead>
								<TableHead>Event</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>WhatsApp</TableHead>
								<TableHead>Company</TableHead>
								<TableHead>City</TableHead>
								<TableHead>Pincode</TableHead>
								<TableHead>QR Code</TableHead>
								<TableHead>Prize</TableHead>
								<TableHead>Created At</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={11} className="text-center">
										Loading...
									</TableCell>
								</TableRow>
							) : entries.length === 0 ? (
								<TableRow>
									<TableCell colSpan={11} className="text-center">
										No entries found
									</TableCell>
								</TableRow>
							) : (
								entries.map((entry) => (
									<TableRow key={entry.id}>
										<TableCell className="font-medium">{entry.id}</TableCell>
										<TableCell>{entry.event_name}</TableCell>
										<TableCell>{entry.name}</TableCell>
										<TableCell>{entry.email || "-"}</TableCell>
										<TableCell>{entry.whatsapp_number}</TableCell>
										<TableCell>{entry.company_name || "-"}</TableCell>
										<TableCell>{entry.city}</TableCell>
										<TableCell>{entry.pincode}</TableCell>
										<TableCell>
											{entry.qr_code_id ? (
												<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
													{entry.qr_code_id.slice(0, 8)}
												</span>
											) : (
												"-"
											)}
										</TableCell>
										<TableCell>
											{entry.prize_name ? (
												<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
													{entry.prize_name}
												</span>
											) : (
												"-"
											)}
										</TableCell>
										<TableCell>
											{format(new Date(entry.created_at), "PPp")}
										</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleViewDetails(entry)}
												title="View details"
											>
												<Eye className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				<div className="flex items-center justify-between">
					<div className="text-sm text-muted-foreground">
						Total Entries: {total}
					</div>

					<div className="flex items-center space-x-6">
						<div className="flex items-center space-x-2">
							<span className="text-sm text-muted-foreground">
								Rows per page:
							</span>
							<select
								className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm"
								value={pagination.pageSize}
								onChange={handlePageSizeChange}
							>
								<option value="5">5</option>
								<option value="10">10</option>
								<option value="20">20</option>
								<option value="50">50</option>
							</select>
						</div>

						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								size="icon"
								onClick={() => handlePageChange(pagination.page - 1)}
								disabled={pagination.page === 1}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<span className="text-sm">
								Page {pagination.page} of {pagination.totalPages}
							</span>
							<Button
								variant="outline"
								size="icon"
								onClick={() => handlePageChange(pagination.page + 1)}
								disabled={pagination.page === pagination.totalPages}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>

			<EntryDetails
				entry={selectedEntry}
				isOpen={isDetailsOpen}
				onClose={() => setIsDetailsOpen(false)}
			/>
		</DashboardShell>
	);
}
