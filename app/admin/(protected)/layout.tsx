import { signOut } from "@/app/admin/(protected)/actions";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import {
	CalendarDays,
	Gift,
	Home,
	LogOut,
	MessageSquare,
	QrCode,
	Users,
} from "lucide-react";
import { Inter, Playfair_Display } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({
	subsets: ["latin"],
	variable: "--font-serif",
});

const sidebarItems = [
	{
		title: "Dashboard",
		href: "/admin",
		icon: Home,
	},
	{
		title: "QR Codes",
		href: "/admin/qr-codes",
		icon: QrCode,
	},
	{
		title: "Events",
		href: "/admin/events",
		icon: CalendarDays,
	},
	{
		title: "Entries",
		href: "/admin/entries",
		icon: Users,
	},
	{
		title: "Winners",
		href: "/admin/winners",
		icon: Gift,
	},
	{
		title: "Message Logs",
		href: "/admin/message-logs",
		icon: MessageSquare,
	},
];

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen bg-background">
			{/* Sidebar */}
			<div className="hidden border-r border-border bg-muted/40 lg:block lg:w-64">
				<div className="flex h-full flex-col">
					<div className="flex h-14 items-center border-b border-border px-4">
						<Link href="/" className="flex items-center space-x-2">
							<Image
								src="/kayaan-logo.jpeg"
								alt="Kayaan Logo"
								width={140}
								height={70}
								className="rounded-sm"
							/>
						</Link>
					</div>
					<nav className="flex-1 space-y-1 p-2">
						{sidebarItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="flex items-center space-x-2 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary"
							>
								<item.icon className="h-5 w-5" />
								<span>{item.title}</span>
							</Link>
						))}
					</nav>
					<div className="border-t border-border p-4">
						<form action={signOut}>
							<Button
								variant="ghost"
								className="w-full justify-start space-x-2 text-muted-foreground hover:text-primary"
							>
								<LogOut className="h-5 w-5" />
								<span>Log out</span>
							</Button>
						</form>
					</div>
				</div>
			</div>

			{/* Main content */}
			<div className="flex-1">
				{children}
				<Toaster />
			</div>
		</div>
	);
}
