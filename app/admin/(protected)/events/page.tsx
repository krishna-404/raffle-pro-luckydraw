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
import { format } from "date-fns";
import { CalendarPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getEvents, type Event } from "./actions";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, total } = await getEvents();
      setEvents(data);
      setTotal(total);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: Event['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Events" 
        text="Manage your giveaway events and track their performance."
      >
        <Button asChild>
          <Link href="/admin/events/create">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </DashboardHeader>

      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Entries</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">No events found</TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      <Link 
                        href={`/admin/events/${event.id}`}
                        className="text-primary hover:underline"
                      >
                        {event.name}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {event.description || '-'}
                    </TableCell>
                    <TableCell>{format(new Date(event.start_date), 'PPP')}</TableCell>
                    <TableCell>{format(new Date(event.end_date), 'PPP')}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(event.status)}`}>
                        {event.status}
                      </span>
                    </TableCell>
                    <TableCell>{event.entry_count}</TableCell>
                    <TableCell>{event.created_by_admin}</TableCell>
                    <TableCell>{format(new Date(event.created_at), 'PPp')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground">
          Total Events: {total}
        </div>
      </div>
    </DashboardShell>
  );
} 