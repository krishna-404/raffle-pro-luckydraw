"use client";

import { DashboardHeader } from "@/app/admin/(protected)/components/header";
import { DashboardShell } from "@/app/admin/(protected)/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Download, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import {
	type MessageLog,
	type PaginationParams,
	exportMessageLogs,
	getMessageLogs,
} from "./actions";

export default function MessageLogsPage() {
	const [logs, setLogs] = useState<MessageLog[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
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
		fetchLogs({ page: pagination.page, pageSize: pagination.pageSize });
	}, [pagination.page, pagination.pageSize]);

	const fetchLogs = async (params: PaginationParams) => {
		try {
			setLoading(true);
			const { data, total, page, pageSize, totalPages, statusCounts } =
				await getMessageLogs(params);
			setLogs(data);
			setTotal(total);
			setPagination({ page, pageSize, totalPages });
			setStatusCounts(statusCounts);
		} catch (error) {
			console.error("Failed to fetch message logs:", error);
		} finally {
			setLoading(false);
		}
	};

	const handlePageChange = (newPage: number) => {
		if (newPage > 0 && newPage <= pagination.totalPages) {
			setPagination({ ...pagination, page: newPage });
		}
	};

	const handlePageSizeChange = (
		event: React.ChangeEvent<HTMLSelectElement>,
	) => {
		const newPageSize = Number.parseInt(event.target.value);
		setPagination({ ...pagination, page: 1, pageSize: newPageSize });
	};

	const handleExport = async () => {
		try {
			const data = await exportMessageLogs();

			// Convert to CSV
			const headers = [
				"ID",
				"Template ID",
				"Recipient",
				"Event",
				"Entry",
				"Status",
				"Error Message",
				"Created At",
			];

			const csvRows = [
				headers.join(","),
				...data.map((log) =>
					[
						log.id,
						log.template_id,
						log.recipient_mobile,
						log.event_name || "N/A",
						log.entry_name || "N/A",
						log.status,
						log.error_message
							? `"${log.error_message.replace(/"/g, '""')}"`
							: "",
						format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
					].join(","),
				),
			];

			const csvContent = csvRows.join("\n");

			// Create download link
			const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.setAttribute("href", url);
			link.setAttribute(
				"download",
				`message-logs-${format(new Date(), "yyyy-MM-dd")}.csv`,
			);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			console.error("Failed to export message logs:", error);
		}
	};

	const getStatusBadgeColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "success":
				return "bg-green-100 text-green-800";
			case "error":
				return "bg-red-100 text-red-800";
			case "skipped":
				return "bg-yellow-100 text-yellow-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<DashboardShell>
			<DashboardHeader
				heading="Message Logs"
				text="View and manage message logs"
			>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							fetchLogs({
								page: pagination.page,
								pageSize: pagination.pageSize,
							})
						}
					>
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh
					</Button>
					<Button variant="outline" size="sm" onClick={handleExport}>
						<Download className="h-4 w-4 mr-2" />
						Export
					</Button>
				</div>
			</DashboardHeader>

			<div className="grid gap-4">
				<Card>
					<CardHeader className="py-4">
						<CardTitle>Message Status Overview</CardTitle>
						<CardDescription>
							Summary of message statuses across all logs
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{Object.entries(statusCounts).map(([status, count]) => (
								<Badge
									key={status}
									variant="outline"
									className={getStatusBadgeColor(status)}
								>
									{status}: {count}
								</Badge>
							))}
							<Badge variant="outline">Total: {total}</Badge>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="py-4">
						<div className="flex items-center justify-between">
							<CardTitle>Message Logs</CardTitle>
							<div className="flex items-center gap-2">
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
						</div>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex justify-center items-center py-8">
								<RefreshCw className="h-6 w-6 animate-spin" />
								<span className="ml-2">Loading...</span>
							</div>
						) : logs.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								No message logs found
							</div>
						) : (
							<>
								<div className="rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Recipient</TableHead>
												<TableHead>Template</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Event</TableHead>
												<TableHead>Entry</TableHead>
												<TableHead>Sent At</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{logs.map((log) => (
												<TableRow key={log.id}>
													<TableCell className="font-medium">
														{log.recipient_mobile}
													</TableCell>
													<TableCell>{log.template_id}</TableCell>
													<TableCell>
														<Badge
															variant="outline"
															className={getStatusBadgeColor(log.status)}
														>
															{log.status}
														</Badge>
													</TableCell>
													<TableCell>{log.event_name || "N/A"}</TableCell>
													<TableCell>{log.entry_name || "N/A"}</TableCell>
													<TableCell>
														{format(
															new Date(log.created_at),
															"yyyy-MM-dd HH:mm:ss",
														)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>

								<div className="flex items-center justify-between mt-4">
									<div className="text-sm text-muted-foreground">
										Showing {logs.length} of {total} results
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
										<div className="text-sm">
											Page {pagination.page} of {pagination.totalPages}
										</div>
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
							</>
						)}
					</CardContent>
				</Card>
			</div>
		</DashboardShell>
	);
}
