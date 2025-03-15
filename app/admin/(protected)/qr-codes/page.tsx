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
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getQrCodes, type QrCode } from "./actions";

type GroupedQrCodes = {
  datetime: string;
  created_by: string;
  total: number;
  used: number;
  unused: number;
  expires_at: string | null;
  codes: QrCode[];
}

export default function QrCodesPage() {
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQrCodes();
  }, []);

  const fetchQrCodes = async () => {
    try {
      setLoading(true);
      const result = await getQrCodes({ pageSize: 1000 });
      setQrCodes(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group QR codes by created_at datetime
  const groupedQrCodes = qrCodes.reduce((groups: GroupedQrCodes[], code) => {
    // Format with date and time
    const datetime = format(parseISO(code.created_at), 'yyyy-MM-dd HH:mm:ss');
    const existingGroup = groups.find(g => 
      g.datetime === datetime && 
      g.created_by === code.created_by_admin &&
      g.expires_at === code.expires_at
    );

    if (existingGroup) {
      existingGroup.total++;
      existingGroup.used += code.status === 'used' ? 1 : 0;
      existingGroup.unused += code.status === 'unused' ? 1 : 0;
      existingGroup.codes.push(code);
    } else {
      groups.push({
        datetime,
        created_by: code.created_by_admin,
        expires_at: code.expires_at,
        total: 1,
        used: code.status === 'used' ? 1 : 0,
        unused: code.status === 'unused' ? 1 : 0,
        codes: [code]
      });
    }
    return groups;
  }, []);

  // Sort groups by datetime descending
  groupedQrCodes.sort((a, b) => b.datetime.localeCompare(a.datetime));

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
              ) : groupedQrCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No QR codes found</TableCell>
                </TableRow>
              ) : (
                groupedQrCodes.map((group) => (
                  <TableRow key={`${group.datetime}-${group.created_by}-${group.expires_at}`}>
                    <TableCell>{format(parseISO(group.datetime), 'PPP p')}</TableCell>
                    <TableCell>{group.created_by}</TableCell>
                    <TableCell>{group.total}</TableCell>
                    <TableCell>{group.used}</TableCell>
                    <TableCell>{group.unused}</TableCell>
                    <TableCell>
                      {((group.used / group.total) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      {group.expires_at ? format(parseISO(group.expires_at), 'PPP') : 'Never'}
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