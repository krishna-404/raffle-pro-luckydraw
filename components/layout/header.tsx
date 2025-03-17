"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			// Show navbar after scrolling 100px
			if (window.scrollY > 100) {
				setIsVisible(true);
			} else {
				setIsVisible(false);
			}
		};

		// Add scroll event listener
		window.addEventListener("scroll", handleScroll);

		// Clean up the event listener
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	return (
		<header
			className={`fixed w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border transition-all duration-300 ${
				isVisible
					? "translate-y-0 opacity-100"
					: "translate-y-[-100%] opacity-0"
			}`}
		>
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

					<div className="hidden md:block flex-1" />

					<div className="flex items-center">
						<Link href="/giveaway">
							<Button
								variant="outline"
								size="sm"
								className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
							>
								Giveaway
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
