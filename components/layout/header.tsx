import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function Header() {
	return (
		<header className="fixed w-full z-50 bg-white/80 backdrop-blur-sm">
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
							className="text-neutral-600 hover:text-neutral-900"
						>
							Collection
						</Link>
						<Link
							href="/about"
							className="text-neutral-600 hover:text-neutral-900"
						>
							About
						</Link>
						<Link
							href="/contact"
							className="text-neutral-600 hover:text-neutral-900"
						>
							Contact
						</Link>
						<Link
							href="/giveaway"
							className="text-neutral-600 hover:text-neutral-900"
						>
							Giveaway
						</Link>
					</nav>

					<div className="flex items-center space-x-4">
						<Button variant="ghost" size="sm">
							Search
						</Button>
						<Button variant="outline" size="sm">
							Contact Us
						</Button>
					</div>
				</div>
			</div>
		</header>
	);
}
