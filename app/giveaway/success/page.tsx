'use client';

export const dynamic = 'force-dynamic';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { differenceInSeconds } from "date-fns";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyEntry } from "../qr-code/actions";

// Countdown timer component for events
function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      // Create date object for end date
      const end = new Date(endDate);
      // Set to end of the same day
      end.setHours(23, 59, 59, 999);
      
      const now = new Date();
      
      const secondsLeft = differenceInSeconds(end, now);
      
      if (secondsLeft <= 0) {
        setTimeLeft("Event has ended");
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
    <div className="text-center mt-4">
      <p className="text-sm text-muted-foreground mb-1">Event ends in</p>
      <div className="font-mono text-lg font-semibold text-primary">
        {timeLeft}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entryData, setEntryData] = useState<{ 
    code: string; 
    name: string;
    eventName: string;
    eventEndDate?: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      // Prevent multiple verifications
      if (isVerifying) return;
      setIsVerifying(true);

      try {
        const result = await verifyEntry();
        
        // Only update state if component is still mounted
        if (isMounted) {
          if (result.error) {
            setError(result.error);
          } else if (result.success) {
            setEntryData({
              code: result.entryCode,
              name: result.name,
              eventName: result.eventName || 'Giveaway',
              eventEndDate: result.eventEndDate
            });
          }
        }
      } catch (error) {
        console.error('Verification error:', error);
        if (isMounted) {
          setError('Failed to verify entry');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsVerifying(false);
        }
      }
    };

    verify();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying your entry...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Verification Failed</CardTitle>
            <CardDescription className="whitespace-pre-wrap">{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please try submitting your entry again.
            </p>
            <Button asChild className="w-full">
              <Link href="/giveaway">Return to Giveaway</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!entryData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Invalid entry verification</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/giveaway">Return to Giveaway</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Entry Confirmed!</CardTitle>
          <CardDescription>
            Thank you, {entryData?.name}!
          </CardDescription>
          <CardDescription>
            Your entry has been successfully recorded for{' '}
            <span className="font-semibold text-primary">
              {entryData?.eventName}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Entry Code</p>
            <div className="font-mono text-2xl font-bold tracking-wider">
              {entryData?.code}
            </div>
          </div>

          {entryData.eventEndDate && (
            <CountdownTimer endDate={entryData.eventEndDate} />
          )}

          <div className="text-sm text-muted-foreground text-center space-y-2">
            <p>
              We have sent your entry code to your WhatsApp number.
            </p>
            <p>
              Please save this code for future reference.
            </p>
          </div>

          <Button asChild className="w-full">
            <Link href="/giveaway">Return to Giveaway</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
} 