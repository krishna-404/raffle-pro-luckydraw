'use client';

import { DashboardHeader } from "@/app/admin/(protected)/components/header";
import { DashboardShell } from "@/app/admin/(protected)/components/shell";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { isBefore, startOfDay } from "date-fns";
import { AlertCircle, CalendarIcon, ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { createEvent } from "./actions";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const prizeSchema = z.object({
  name: z.string().min(1, "Prize name is required"),
  description: z.string(),
  image: z.instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, "Max file size is 5MB.")
    .refine(
      file => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    )
    .nullable(),
  seniority_index: z.number(),
});

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string(),
  // Validate start date to ensure it's not in the past
  start_date: z.date({
    required_error: "Start date is required",
  }).refine(date => !isBefore(date, startOfDay(new Date())), "Start date must be today or in the future"),
  // Validate end date to ensure it's not in the past
  end_date: z.date({
    required_error: "End date is required",
  }).refine(date => !isBefore(date, startOfDay(new Date())), "End date must be today or in the future"),
  prizes: z.array(prizeSchema)
    .min(1, "At least one prize is required")
    .max(10, "Maximum 10 prizes allowed"),
// Ensure end date is not before start date
}).refine(data => !isBefore(data.end_date, data.start_date), {
  message: "End date must be on or after start date",
  path: ["end_date"],
});

type FormData = z.infer<typeof formSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  // Initialize form with react-hook-form and zod validation
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      prizes: [{ name: "", description: "", image: null, seniority_index: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "prizes",
    control: form.control,
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      // At this point, dates are in UTC midnight
      await createEvent(data);
      router.push('/admin/events');
      router.refresh();
    } catch (error) {
      // Show error in the form
      form.setError("root", { 
        type: "server",
        message: error instanceof Error 
          ? error.message 
          : "Failed to create event. Please try again."
      });
      
      // Scroll to error message
      const errorElement = document.querySelector('[role="alert"]');
      errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleDateSelect = (date: Date | undefined, onChange: (date: Date | undefined) => void) => {
    if (!date) {
      onChange(undefined);
      return;
    }

    // Extract the date components from the selected date
    // These will be in local timezone, but we only care about the date part
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // Create a new date at midnight UTC using Date.UTC
    // This ensures the date is stored consistently regardless of the user's timezone
    // For example: March 17th 00:00 UTC will be March 17th 05:30 IST
    const utcDate = new Date(Date.UTC(year, month, day));

    onChange(utcDate);
  };

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Create Event" 
        text="Create a new giveaway event with prizes."
      />

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Fill in the event details and add prizes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Summer Giveaway 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter event description..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                field.value.toLocaleDateString('en-IN', {
                                  timeZone: 'Asia/Kolkata',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })
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
                            selected={field.value}
                            onSelect={(date) => handleDateSelect(date, field.onChange)}
                            disabled={(date) =>
                              date ? isBefore(date, startOfDay(new Date())) : false
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                field.value.toLocaleDateString('en-IN', {
                                  timeZone: 'Asia/Kolkata',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })
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
                            selected={field.value}
                            onSelect={(date) => handleDateSelect(date, field.onChange)}
                            disabled={(date) =>
                              date ? isBefore(date, startOfDay(new Date())) : false
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Prizes</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ 
                      name: "", 
                      description: "", 
                      image: null,
                      seniority_index: fields.length 
                    })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Prize
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-[100px_1fr] gap-6">
                        {/* Image Preview Column */}
                        <FormField
                          control={form.control}
                          name={`prizes.${index}.image`}
                          render={({ field: { value, onChange, ...field } }) => (
                            <FormItem>
                              <FormControl>
                                <div className="space-y-4">
                                  <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                                    {value ? (
                                      <div className="absolute inset-0">
                                        <img
                                          src={URL.createObjectURL(value)}
                                          alt="Preview"
                                          className="h-full w-full rounded-lg object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div className="flex h-full items-center justify-center">
                                        <ImageIcon className="h-8 w-8 text-gray-400" />
                                      </div>
                                    )}
                                    <Input
                                      type="file"
                                      accept={ACCEPTED_IMAGE_TYPES.join(",")}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0] ?? null;
                                        onChange(file);
                                      }}
                                      className="absolute inset-0 cursor-pointer opacity-0"
                                      {...field}
                                    />
                                  </div>
                                  <FormMessage />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Name and Description Column */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`prizes.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Prize Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="iPhone 15 Pro" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`prizes.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Prize description..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {index > 0 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => remove(index)}
                              className="mt-2"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Prize
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {form.formState.errors.root && (
                <div 
                  className="rounded-md bg-destructive/15 p-3"
                  role="alert"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.root.message}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Event
                </Button>
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