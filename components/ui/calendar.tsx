"use client";

import { cn } from "@/lib/utils";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	...props
}: CalendarProps) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn("rounded-md border bg-white p-3", className)}
			{...props}
		/>
	);
}
Calendar.displayName = "Calendar";

export { Calendar };
