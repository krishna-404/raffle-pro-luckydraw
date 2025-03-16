'use client';

import { DashboardHeader } from "@/app/admin/(protected)/components/header";
import { DashboardShell } from "@/app/admin/(protected)/components/shell";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isBefore, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { generateQrCodes } from "./actions";

const formSchema = z.object({
  count: z.number().min(1).max(1000),
  expiresAt: z.date().optional().refine(
    date => !date || !isBefore(date, startOfDay(new Date())),
    "Expiry date must be today or in the future"
  ),
});

type FormData = z.infer<typeof formSchema>;

export default function GenerateQrCodesPage() {
  const router = useRouter();
  const [displayDate, setDisplayDate] = useState<Date | undefined>(undefined);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      count: 1,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await generateQrCodes(data);
      router.push('/admin/qr-codes');
      router.refresh();
    } catch (error) {
      console.error('Failed to generate QR codes:', error);
    }
  };

  const handleDateSelect = (date: Date | undefined, onChange: (date: Date | undefined) => void) => {
    if (!date) {
      setDisplayDate(undefined);
      onChange(undefined);
      return;
    }

    // Save the original date for display purposes
    setDisplayDate(date);
    
    // Extract the date components from the selected date
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // Create a new date at the END of the day (23:59:59.999) in UTC
    // This ensures QR codes expire at the end of the selected day
    const utcDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

    onChange(utcDate);
  };

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Generate QR Codes" 
        text="Create new QR codes for your events."
      />

      <Card>
        <CardHeader>
          <CardTitle>QR Code Generation</CardTitle>
          <CardDescription>
            Specify how many QR codes you want to generate and when they should expire.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of QR Codes</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={1000}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      You can generate up to 1000 QR codes at once.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiry Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {displayDate ? (
                              format(displayDate, "d MMMM yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={displayDate}
                          onSelect={(date) => handleDateSelect(date, field.onChange)}
                          disabled={(date) =>
                            date ? isBefore(date, startOfDay(new Date())) : false
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      QR codes will become invalid at the end of this day (11:59 PM).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit">Generate QR Codes</Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardShell>
  );
} 