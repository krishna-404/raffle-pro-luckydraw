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
import { type PaginationParams, type Winner, getWinners } from "./actions";
import { WinnerDetails } from "./components/winner-details";

export default function WinnersPage() {
	const [winners, setWinners] = useState<Winner[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null);
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
		fetchWinners({ page: pagination.page, pageSize: pagination.pageSize });
	}, [pagination.page, pagination.pageSize]);

	const fetchWinners = async (params: PaginationParams) => {
		try {
			setLoading(true);
			const { data, total, page, pageSize, totalPages } =
				await getWinners(params);
			setWinners(data);
			setTotal(total);
			setPagination({ page, pageSize, totalPages });
		} catch (error) {
			console.error("Failed to fetch winners:", error);
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
			const response = await fetch("/api/admin/winners/export");
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `winners-${format(new Date(), "yyyy-MM-dd")}.csv`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			console.error("Failed to export winners:", error);
		}
	};

	const handleViewDetails = (winner: Winner) => {
		setSelectedWinner(winner);
		setIsDetailsOpen(true);
	};

	return (
		<DashboardShell>
			<DashboardHeader
				heading="Winners"
				text="View and manage all event winners."
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
								<TableHead>Prize</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>WhatsApp</TableHead>
								<TableHead>Company</TableHead>
								<TableHead>City</TableHead>
								<TableHead>Created At</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={9} className="text-center">
										Loading...
									</TableCell>
								</TableRow>
							) : winners.length === 0 ? (
								<TableRow>
									<TableCell colSpan={9} className="text-center">
										No winners found
									</TableCell>
								</TableRow>
							) : (
								winners.map((winner) => (
									<TableRow key={winner.id}>
										<TableCell className="font-medium">{winner.id}</TableCell>
										<TableCell>{winner.event_name}</TableCell>
										<TableCell>{winner.name}</TableCell>
										<TableCell>
											<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
												{winner.prize_name}
											</span>
										</TableCell>
										<TableCell>{winner.email || "-"}</TableCell>
										<TableCell>{winner.whatsapp_number}</TableCell>
										<TableCell>{winner.company_name || "-"}</TableCell>
										<TableCell>{winner.city}</TableCell>
										<TableCell>
											{format(new Date(winner.created_at), "PPp")}
										</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleViewDetails(winner)}
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
						Total Winners: {total}
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

			<WinnerDetails
				winner={selectedWinner}
				isOpen={isDetailsOpen}
				onClose={() => setIsDetailsOpen(false)}
			/>
		</DashboardShell>
	);
}
