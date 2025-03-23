"use client";

import { DashboardHeader } from "@/app/admin/(protected)/components/header";
import { DashboardShell } from "@/app/admin/(protected)/components/shell";
import { useEventDates } from "@/app/admin/(protected)/events/hooks/useEventDates";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { isBefore, startOfDay } from "date-fns";
import {
	AlertCircle,
	CalendarIcon,
	ImageIcon,
	Loader2,
	Plus,
	Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
];

const prizeSchema = z.object({
	name: z.string().min(1, "Prize name is required"),
	description: z.string(),
	image: z
		.instanceof(File)
		.refine((file) => file.size <= MAX_FILE_SIZE, "Max file size is 5MB.")
		.refine(
			(file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
			"Only .jpg, .jpeg, .png and .webp formats are supported.",
		)
		.nullable(),
	seniority_index: z.number(),
});

// Form validation schema
const formSchema = z
	.object({
		name: z.string().min(1, "Event name is required"),
		description: z.string(),
		start_date: z
			.date({
				required_error: "Start date is required",
			})
			.refine(
				(date) => !isBefore(date, startOfDay(new Date())),
				"Start date must be today or in the future",
			),
		end_date: z
			.date({
				required_error: "End date is required",
			})
			.refine(
				(date) => !isBefore(date, startOfDay(new Date())),
				"End date must be today or in the future",
			),
		prizes: z
			.array(prizeSchema)
			.min(1, "At least one prize is required")
			.max(10, "Maximum 10 prizes allowed"),
	})
	.refine(
		(data) => {
			// Convert dates to UTC midnight for comparison
			const startUtc = new Date(
				Date.UTC(
					data.start_date.getFullYear(),
					data.start_date.getMonth(),
					data.start_date.getDate(),
				),
			);
			const endUtc = new Date(
				Date.UTC(
					data.end_date.getFullYear(),
					data.end_date.getMonth(),
					data.end_date.getDate(),
				),
			);

			return startUtc.getTime() < endUtc.getTime();
		},
		{
			message: "End date must be after start date",
			path: ["end_date"],
		},
	);

type FormData = z.infer<typeof formSchema>;

export default function CreateEventPage() {
	const router = useRouter();
	const { eventDates, isLoading: isLoadingDates } = useEventDates();
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
			// Create a FormData object to properly handle File objects
			const formData = new FormData();

			// Add basic event data
			formData.append("name", data.name);
			formData.append("description", data.description || "");
			formData.append("start_date", data.start_date.toISOString());
			formData.append("end_date", data.end_date.toISOString());

			// Add prizes data without images first
			const prizesWithoutImages = data.prizes.map((prize, index) => ({
				name: prize.name,
				description: prize.description || "",
				seniority_index: index,
			}));
			formData.append("prizes", JSON.stringify(prizesWithoutImages));

			// Add prize images separately
			data.prizes.forEach((prize, index) => {
				if (prize.image) {
					formData.append(`prize_image_${index}`, prize.image);
				}
			});

			// Use the API route with FormData
			const response = await fetch("/api/admin/events/create", {
				method: "POST",
				body: formData,
			});

			const result = await response.json();

			if (!response.ok) {
				// Handle error response from API
				throw new Error(result.error || "Failed to create event");
			}

			// Success - redirect to events page
			router.push("/admin/events");
			router.refresh();
		} catch (error) {
			// Show error in the form
			form.setError("root", {
				type: "server",
				message:
					error instanceof Error
						? error.message
						: "Failed to create event. Please try again.",
			});

			// Scroll to error message
			const errorElement = document.querySelector('[role="alert"]');
			errorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	};

	const handleDateSelect = (
		date: Date | undefined,
		onChange: (date: Date | undefined) => void,
	) => {
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

	// Check if a date is within any existing event's date range
	const isDateWithinExistingEvent = (date: Date) => {
		if (!eventDates || eventDates.length === 0) {
			return false;
		}

		// Convert the date to start of day in UTC to ensure consistent comparison
		const dateToCheck = startOfDay(new Date(date));

		return eventDates.some((event) => {
			// Convert event dates to start of day for comparison
			const eventStart = startOfDay(new Date(event.startDate));
			const eventEnd = startOfDay(new Date(event.endDate));

			// Check if the date is within the event's date range (inclusive)
			return dateToCheck >= eventStart && dateToCheck <= eventEnd;
		});
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
																!field.value && "text-muted-foreground",
															)}
														>
															{field.value ? (
																field.value.toLocaleDateString("en-IN", {
																	timeZone: "Asia/Kolkata",
																	day: "numeric",
																	month: "long",
																	year: "numeric",
																})
															) : (
																<span>Pick a date</span>
															)}
															<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													{isLoadingDates ? (
														<div className="flex items-center justify-center p-4">
															<Loader2 className="h-4 w-4 animate-spin" />
															<span className="ml-2">Loading dates...</span>
														</div>
													) : (
														<Calendar
															mode="single"
															selected={field.value}
															onSelect={(date) =>
																handleDateSelect(date, field.onChange)
															}
															disabled={(date) => {
																if (!date) return false;

																// Create a new date at midnight to ensure consistent comparison
																const dateToCheck = new Date(
																	date.getFullYear(),
																	date.getMonth(),
																	date.getDate(),
																);

																// Disable if date is before today
																const today = startOfDay(new Date());
																const isPastDate = dateToCheck < today;

																// Disable if date is within an existing event
																const isBooked =
																	isDateWithinExistingEvent(dateToCheck);

																return isPastDate || isBooked;
															}}
															initialFocus
														/>
													)}
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
																!field.value && "text-muted-foreground",
															)}
														>
															{field.value ? (
																field.value.toLocaleDateString("en-IN", {
																	timeZone: "Asia/Kolkata",
																	day: "numeric",
																	month: "long",
																	year: "numeric",
																})
															) : (
																<span>Pick a date</span>
															)}
															<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													{isLoadingDates ? (
														<div className="flex items-center justify-center p-4">
															<Loader2 className="h-4 w-4 animate-spin" />
															<span className="ml-2">Loading dates...</span>
														</div>
													) : (
														<Calendar
															mode="single"
															selected={field.value}
															onSelect={(date) =>
																handleDateSelect(date, field.onChange)
															}
															disabled={(date) => {
																if (!date) return false;

																// Create a new date at midnight to ensure consistent comparison
																const dateToCheck = new Date(
																	date.getFullYear(),
																	date.getMonth(),
																	date.getDate(),
																);

																// Disable if date is before today
																const today = startOfDay(new Date());
																const isPastDate = dateToCheck < today;

																// Disable if date is within an existing event
																const isBooked =
																	isDateWithinExistingEvent(dateToCheck);

																// Disable if date is same as or before start date
																let isBeforeStartDate = false;
																const startDate = form.getValues("start_date");
																if (startDate) {
																	// Convert both dates to midnight for comparison
																	const startToCompare = new Date(
																		startDate.getFullYear(),
																		startDate.getMonth(),
																		startDate.getDate(),
																	);

																	isBeforeStartDate =
																		dateToCheck <= startToCompare;
																}

																return (
																	isPastDate || isBooked || isBeforeStartDate
																);
															}}
															initialFocus
														/>
													)}
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
										onClick={() =>
											append({
												name: "",
												description: "",
												image: null,
												seniority_index: fields.length,
											})
										}
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
													render={({
														field: { value, onChange, ...field },
													}) => (
														<FormItem>
															<FormControl>
																<div className="space-y-4">
																	<button
																		type="button"
																		className="relative w-full aspect-square rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 cursor-pointer hover:border-gray-300 hover:bg-gray-100 transition-colors text-left"
																		onClick={() => {
																			// Find the file input and trigger a click
																			const fileInput = document.getElementById(
																				`prize-image-${index}`,
																			);
																			if (fileInput) {
																				fileInput.click();
																			}
																		}}
																		aria-label="Upload prize image"
																	>
																		{value ? (
																			<div className="absolute inset-0">
																				<img
																					src={URL.createObjectURL(value)}
																					alt="Preview"
																					className="h-full w-full rounded-lg object-contain"
																				/>
																			</div>
																		) : (
																			<div className="flex h-full items-center justify-center">
																				<ImageIcon className="h-8 w-8 text-gray-400" />
																			</div>
																		)}
																		<Input
																			id={`prize-image-${index}`}
																			type="file"
																			accept={ACCEPTED_IMAGE_TYPES.join(",")}
																			onChange={(e) => {
																				const file =
																					e.target.files?.[0] ?? null;
																				onChange(file);
																			}}
																			className="absolute inset-0 opacity-0 pointer-events-none"
																			{...field}
																		/>
																	</button>
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
																		<Input
																			placeholder="iPhone 15 Pro"
																			{...field}
																		/>
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
																		<Input
																			placeholder="Prize description..."
																			{...field}
																		/>
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
								<div className="rounded-md bg-destructive/15 p-3" role="alert">
									<div className="flex items-center gap-2">
										<AlertCircle className="h-4 w-4 text-destructive" />
										<p className="text-sm font-medium text-destructive">
											{form.formState.errors.root.message}
										</p>
									</div>
								</div>
							)}

							<div className="flex gap-4">
								<Button type="submit" disabled={form.formState.isSubmitting}>
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
