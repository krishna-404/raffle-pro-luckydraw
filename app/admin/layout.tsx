import { Button } from "@/components/ui/button";
import { CalendarDays, Gift, Home, LogOut, QrCode, Users } from "lucide-react";
import { Inter, Playfair_Display } from "next/font/google";
import Link from "next/link";
import { signOut } from "./actions";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
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
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden border-r bg-gray-100/40 lg:block lg:w-64">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-serif text-xl font-bold">ELEGANCE</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
          <div className="border-t p-4">
            <form action={signOut}>
              <Button variant="ghost" className="w-full justify-start space-x-2">
                <LogOut className="h-5 w-5" />
                <span>Log out</span>
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">{children}</div>
    </div>
  );
} 