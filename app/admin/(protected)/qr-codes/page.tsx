'use client';

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
import { format, subDays } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getQrCodeGroups, type QrCodeGroup } from "./actions";

// Helper function to adjust UTC midnight to display the correct date
function formatExpiryDate(dateString: string | null): string {
  if (!dateString) return 'Never';
  
  // Parse the UTC date
  const utcDate = new Date(dateString);
  
  // If it's 23:59:59 UTC (end of day), subtract a day to get the correct day
  // This handles the case where we store the end of day in UTC but need to display
  // the actual day that was selected
  if (utcDate.getUTCHours() === 23 && utcDate.getUTCMinutes() === 59) {
    return format(subDays(utcDate, 1), 'PPP');
  }
  
  return format(utcDate, 'PPP');
}

export default function QrCodesPage() {
  const [groups, setGroups] = useState<QrCodeGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

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
      console.error('Failed to fetch QR codes:', error);
    } finally {
      setLoading(false);
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No QR codes found</TableCell>
                </TableRow>
              ) : (
                groups.map((group) => (
                  <TableRow key={`${group.created_at}-${group.created_by_admin}-${group.expires_at}`}>
                    <TableCell>{format(new Date(group.created_at), 'PPP p')}</TableCell>
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
                  </TableRow>
                ))
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