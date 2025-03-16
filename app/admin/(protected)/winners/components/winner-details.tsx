'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";
import { format } from "date-fns";
import { type Winner } from "../actions";

interface WinnerDetailsProps {
  winner: Winner | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WinnerDetails({ winner, isOpen, onClose }: WinnerDetailsProps) {
  if (!winner) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[600px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Winner Details</AlertDialogTitle>
          <AlertDialogDescription>
            Detailed information about the winner.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Entry ID:</div>
            <div className="col-span-3">{winner.id}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Name:</div>
            <div className="col-span-3">{winner.name}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Email:</div>
            <div className="col-span-3">{winner.email || '-'}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">WhatsApp:</div>
            <div className="col-span-3">{winner.whatsapp_number}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Address:</div>
            <div className="col-span-3">{winner.address}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">City:</div>
            <div className="col-span-3">{winner.city}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Pincode:</div>
            <div className="col-span-3">{winner.pincode}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Event:</div>
            <div className="col-span-3">{winner.event_name}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Prize:</div>
            <div className="col-span-3">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {winner.prize_name}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Created At:</div>
            <div className="col-span-3">
              {format(new Date(winner.created_at), 'PPpp')}
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onClose()}>
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 