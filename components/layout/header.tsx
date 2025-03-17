import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function Header() {
	return (
		<header className="fixed w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<Link
						href="/"
						className="font-serif text-2xl font-bold flex items-center gap-2"
					>
						<Image
							src="/kayaan-logo.jpeg"
							alt="Kayaan Logo"
							width={140}
							height={70}
							className="rounded-sm"
						/>
					</Link>

					<nav className="hidden md:flex items-center space-x-8">
						<Link
							href="/collection"
							className="text-foreground/80 hover:text-primary transition-colors"
						>
							Collection
						</Link>
						<Link
							href="/about"
							className="text-foreground/80 hover:text-primary transition-colors"
						>
							About
						</Link>
						<Link
							href="/contact"
							className="text-foreground/80 hover:text-primary transition-colors"
						>
							Contact
						</Link>
						<Link
							href="/giveaway"
							className="text-foreground/80 hover:text-primary transition-colors"
						>
							Giveaway
						</Link>
					</nav>

					<div className="flex items-center space-x-4">
						<Button
							variant="ghost"
							size="sm"
							className="text-foreground/80 hover:text-primary"
						>
							Search
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
						>
							Contact Us
						</Button>
					</div>
				</div>
			</div>
		</header>
	);
}
