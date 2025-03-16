'use client';

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
  Button,
  useToast,
} from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { CalendarPlus, Gift, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteEvent, findEventWinners, getEventWinners, getEvents, type Event, type Winner } from "./actions";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [findingWinners, setFindingWinners] = useState(false);
  const [eventForWinners, setEventForWinners] = useState<string | null>(null);
  const [winnerError, setWinnerError] = useState<string | null>(null);
  const [winnerSuccess, setWinnerSuccess] = useState<string | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [showWinners, setShowWinners] = useState(false);
  const { toast } = useToast();

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

  const handleDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      toast({
        title: "Event deleted successfully",
        variant: "default",
      });
      fetchEvents();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete event');
    } finally {
      setEventToDelete(null);
    }
  };

  const handleWinnerButtonClick = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (event.winner_count > 0) {
      // If winners exist, show them
      try {
        setFindingWinners(true);
        const eventWinners = await getEventWinners(eventId);
        setWinners(eventWinners);
        setShowWinners(true);
      } catch (error) {
        setWinnerError(error instanceof Error ? error.message : 'Failed to fetch winners');
      } finally {
        setFindingWinners(false);
      }
    } else {
      // If no winners, show confirmation to find winners
      setEventForWinners(eventId);
    }
  };

  const handleFindWinners = async (eventId: string) => {
    try {
      setFindingWinners(true);
      const result = await findEventWinners(eventId);
      
      if (result.error) {
        setWinnerError(result.error);
      } else {
        setWinnerSuccess(`Successfully selected ${result.winnersCount} winners for the event!`);
        fetchEvents(); // Refresh the events list to update winner counts
      }
    } catch (error) {
      setWinnerError(error instanceof Error ? error.message : 'Failed to find winners');
    } finally {
      setFindingWinners(false);
      setEventForWinners(null);
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
                <TableHead>Prizes</TableHead>
                <TableHead>Winners</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">No events found</TableCell>
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
                    <TableCell>{event.prize_count}</TableCell>
                    <TableCell>{event.winner_count || 0}</TableCell>
                    <TableCell>{event.created_by_admin}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEventToDelete(event.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleWinnerButtonClick(event.id)}
                          disabled={event.status === 'upcoming' || findingWinners}
                          title={
                            event.status === 'upcoming' 
                              ? 'Event has not started yet' 
                              : event.winner_count > 0
                                ? 'View winners'
                                : 'Find winners'
                          }
                        >
                          <Gift className={`h-4 w-4 ${event.winner_count ? 'text-green-600' : 'text-muted-foreground'}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground">
          Total Events: {total}
        </div>

        {/* Confirmation Dialog for Delete */}
        <AlertDialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the event.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEventToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => eventToDelete && handleDelete(eventToDelete)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirmation Dialog for Finding Winners */}
        <AlertDialog open={!!eventForWinners} onOpenChange={() => setEventForWinners(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Find Winners</AlertDialogTitle>
              <AlertDialogDescription>
                This will randomly select winners for the event based on the number of prizes.
                Once winners are selected, they cannot be changed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEventForWinners(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => eventForWinners && handleFindWinners(eventForWinners)}
                disabled={findingWinners}
              >
                {findingWinners ? "Processing..." : "Find Winners"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Winners Display Dialog */}
        <AlertDialog open={showWinners} onOpenChange={() => setShowWinners(false)}>
          <AlertDialogContent className="max-w-4xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Event Winners</AlertDialogTitle>
              <AlertDialogDescription>
                The following participants have been selected as winners for this event.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entry ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Prize</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {winners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No winners found</TableCell>
                    </TableRow>
                  ) : (
                    winners.map((winner) => (
                      <TableRow key={winner.id}>
                        <TableCell className="font-mono text-xs">{winner.id}</TableCell>
                        <TableCell className="font-medium">{winner.name}</TableCell>
                        <TableCell>{winner.prize_name}</TableCell>
                        <TableCell>{winner.city}</TableCell>
                        <TableCell>{winner.whatsapp_number}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowWinners(false)}>
                Close
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Dialog for Delete */}
        {deleteError && (
          <AlertDialog open={!!deleteError} onOpenChange={() => setDeleteError(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cannot Delete Event</AlertDialogTitle>
                <AlertDialogDescription>{deleteError}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setDeleteError(null)}>
                  OK
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Error Dialog for Winners */}
        {winnerError && (
          <AlertDialog open={!!winnerError} onOpenChange={() => setWinnerError(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cannot Find Winners</AlertDialogTitle>
                <AlertDialogDescription>{winnerError}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setWinnerError(null)}>
                  OK
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Success Dialog for Winners */}
        {winnerSuccess && (
          <AlertDialog open={!!winnerSuccess} onOpenChange={() => setWinnerSuccess(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Winners Selected</AlertDialogTitle>
                <AlertDialogDescription>{winnerSuccess}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setWinnerSuccess(null)}>
                  OK
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </DashboardShell>
  );
} 