"use client";

import { DashboardHeader } from "@/app/admin/(protected)/components/header";
import { DashboardShell } from "@/app/admin/(protected)/components/shell";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Download, Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
	type Entry,
	type PaginationParams,
	deleteEntry,
	getEntries,
} from "./actions";
import { EntryDetails } from "./components/entry-details";

export default function EntriesPage() {
	const { toast } = useToast();
	const [entries, setEntries] = useState<Entry[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [entryToDelete, setEntryToDelete] = useState<Entry | null>(null);
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

	const handleDelete = async (entry: Entry) => {
		setEntryToDelete(entry);
		setIsDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!entryToDelete) return;

		try {
			const result = await deleteEntry(entryToDelete.id);
			if (result.success) {
				toast({
					title: "Entry deleted",
					description: "The entry has been successfully deleted.",
				});
				// Refresh the entries list
				fetchEntries({ page: pagination.page, pageSize: pagination.pageSize });
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to delete entry",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "An unexpected error occurred",
				variant: "destructive",
			});
		} finally {
			setIsDeleteDialogOpen(false);
			setEntryToDelete(null);
		}
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
											<div className="flex items-center gap-1">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleViewDetails(entry)}
													title="View details"
												>
													<Eye className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleDelete(entry)}
													title="Delete entry"
													className="text-red-600 hover:text-red-50 hover:bg-red-600 dark:text-red-500 dark:hover:text-red-50 dark:hover:bg-red-600"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
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

			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Entry</AlertDialogTitle>
						<AlertDialogDescription className="text-muted-foreground">
							Are you sure you want to delete this entry? This action cannot be
							undone.
						</AlertDialogDescription>
						{entryToDelete && (
							<div className="mt-4 rounded-md bg-muted p-3">
								<div className="font-medium">Entry Details:</div>
								<div className="mt-1 text-sm text-muted-foreground">
									<div>Name: {entryToDelete.name}</div>
									<div>Event: {entryToDelete.event_name}</div>
									<div>WhatsApp: {entryToDelete.whatsapp_number}</div>
								</div>
							</div>
						)}
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 dark:text-white focus:ring-red-600"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</DashboardShell>
	);
}
