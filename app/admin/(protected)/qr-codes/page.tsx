'use client';

import { DashboardHeader } from "@/app/admin/(protected)/components/header";
import { DashboardShell } from "@/app/admin/(protected)/components/shell";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { getQrCodes, type QrCode, type QrCodeFilters, type SortBy } from "./actions";

export default function QrCodesPage() {
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState<QrCodeFilters>({});
  const [sortBy, setSortBy] = useState<SortBy>({
    column: 'created_at',
    order: 'desc',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQrCodes();
  }, [page, filters, sortBy]);

  const fetchQrCodes = async () => {
    try {
      setLoading(true);
      const result = await getQrCodes({ page, pageSize, filters, sortBy });
      setQrCodes(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: SortBy['column']) => {
    setSortBy(prev => ({
      column,
      order: prev.column === column && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="QR Codes" 
        text="Manage your QR codes and track their usage."
      >
        <Button>Generate QR Codes</Button>
      </DashboardHeader>

      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Filter by admin..."
            value={filters.created_by || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, created_by: e.target.value }))}
            className="max-w-[200px]"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Status: {filters.status || 'All'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: undefined }))}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: 'used' }))}>
                Used
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: 'unused' }))}>
                Unused
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.created_at_start ? format(new Date(filters.created_at_start), 'PPP') : 'Created from...'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.created_at_start ? new Date(filters.created_at_start) : undefined}
                onSelect={(date) => setFilters(prev => ({ ...prev, created_at_start: date?.toISOString() }))}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('created_by_admin')}
                    className="flex items-center gap-2"
                  >
                    Created By
                    {sortBy.column === 'created_by_admin' && (
                      <span>{sortBy.order === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('created_at')}
                    className="flex items-center gap-2"
                  >
                    Created At
                    {sortBy.column === 'created_at' && (
                      <span>{sortBy.order === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('expires_at')}
                    className="flex items-center gap-2"
                  >
                    Expires At
                    {sortBy.column === 'expires_at' && (
                      <span>{sortBy.order === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Entry Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : qrCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No QR codes found</TableCell>
                </TableRow>
              ) : (
                qrCodes.map((qrCode) => (
                  <TableRow key={qrCode.id}>
                    <TableCell className="font-mono">{qrCode.id.slice(0, 8)}</TableCell>
                    <TableCell>{qrCode.created_by_admin}</TableCell>
                    <TableCell>{format(new Date(qrCode.created_at), 'PPP')}</TableCell>
                    <TableCell>
                      {qrCode.expires_at ? format(new Date(qrCode.expires_at), 'PPP') : 'Never'}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        qrCode.status === 'used' 
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      )}>
                        {qrCode.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {qrCode.entry ? (
                        <span className="text-sm">
                          {qrCode.entry.name} (ID: {qrCode.entry.id.slice(0, 8)})
                        </span>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
} 