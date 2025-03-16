'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyEntry } from "../qr-code/actions";

export default function SuccessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entryData, setEntryData] = useState<{ code: string; name: string } | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const result = await verifyEntry();
        if (result.error) {
          setError(result.error);
          // If verification fails, redirect back to giveaway page after 3 seconds
          setTimeout(() => {
            router.push('/giveaway');
          }, 3000);
        } else if (result.success) {
          setEntryData({
            code: result.entryCode,
            name: result.name
          });
        }
      } catch (error) {
        setError('Failed to verify entry');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [router]);

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
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Redirecting you back to the giveaway page...
            </p>
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
            Thank you, {entryData.name}! Your entry has been successfully recorded
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Entry Code</p>
            <div className="font-mono text-2xl font-bold tracking-wider">
              {entryData.code}
            </div>
          </div>

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