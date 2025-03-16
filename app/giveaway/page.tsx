'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { differenceInSeconds } from "date-fns";
import { QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { getActiveEvent, type ActiveEvent } from "./actions";

function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      // Create date object and adjust for timezone offset
      const end = new Date(endDate);
      // Set to end of the same day
      end.setHours(23, 59, 59, 999);
      
      const now = new Date();
      
      const secondsLeft = differenceInSeconds(end, now);
      
      if (secondsLeft <= 0) {
        setTimeLeft("Ended");
        clearInterval(timer);
        return;
      }

      const days = Math.floor(secondsLeft / (24 * 60 * 60));
      const hours = Math.floor((secondsLeft % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((secondsLeft % (60 * 60)) / 60);
      const seconds = Math.floor(secondsLeft % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="font-mono text-2xl md:text-4xl font-bold text-primary">
      {timeLeft}
    </div>
  );
}

export default function GiveawayPage() {
  const [event, setEvent] = useState<ActiveEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getActiveEvent();
        setEvent(data);
      } catch (error) {
        console.error('Failed to fetch active event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">No Active Giveaway</h1>
          <p className="text-muted-foreground">
            Check back later for new giveaways!
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-6xl font-serif font-bold">
            {event.name}
          </h1>
          {event.description && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {event.description}
            </p>
          )}
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wider text-muted-foreground">
              Giveaway Ends In
            </p>
            <CountdownTimer endDate={event.end_date} />
          </div>
          <Button size="lg" className="mt-8">
            <QrCode className="mr-2 h-5 w-5" />
            Scan QR Code to Enter
          </Button>
        </div>

        {/* Prizes Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-serif text-center">Prizes</h2>
          <div className={cn(
            "grid gap-6 mx-auto",
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            "max-w-[400px] md:max-w-none", // Constrain single column width
            {
              "md:grid-cols-1 lg:grid-cols-1 md:max-w-[400px]": event.prizes.length === 1,
              "md:grid-cols-2 lg:grid-cols-2 md:max-w-[850px]": event.prizes.length === 2,
              "md:max-w-none": event.prizes.length >= 3,
            }
          )}>
            {event.prizes
              .sort((a, b) => a.seniority_index - b.seniority_index)
              .map((prize, index) => (
                <Card
                  key={prize.id}
                  className="overflow-hidden transition-transform hover:scale-105"
                >
                  {prize.image_url ? (
                    <div className="aspect-[4/3] relative">
                      <img
                        src={prize.image_url}
                        alt={prize.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                      <div className="text-4xl font-bold text-muted-foreground">
                        {index + 1}
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{prize.name}</h3>
                      {prize.description && (
                        <p className="text-muted-foreground">
                          {prize.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
} 