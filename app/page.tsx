import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
	return (
		<main className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="relative h-[90vh] flex items-center">
				<div className="absolute inset-0 z-0">
					<Image
						src="/hero-saree.jpg"
						alt="Elegant Saree Collection"
						fill
						className="object-cover brightness-75"
						priority
					/>
				</div>
				<div className="container relative z-10 mx-auto px-4">
					<div className="max-w-2xl text-white">
						<div className="mb-6">
							<Image
								src="/kayaan-logo.jpeg"
								alt="Kayaan Logo"
								width={200}
								height={100}
								className="rounded-md"
							/>
						</div>
						<h1 className="text-5xl font-serif font-bold mb-6">
							Timeless Beauty in Every Weave
						</h1>
						<p className="text-xl mb-8">
							Discover our exquisite collection of handcrafted sarees, where
							tradition meets contemporary design.
						</p>
						<div className="space-x-4">
							<Button
								size="lg"
								className="bg-primary hover:bg-primary/90 text-primary-foreground"
							>
								Explore Collection
							</Button>
							<Link href="/giveaway">
								<Button
									size="lg"
									variant="outline"
									className="bg-white/10 hover:bg-white/20 border-white text-white"
								>
									Join Giveaway
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Featured Collection */}
			<section className="py-20 bg-background">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-serif text-center mb-12 text-primary">
						Featured Collection
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{[1, 2, 3].map((item) => (
							<div
								key={item}
								className="group relative overflow-hidden rounded-lg"
							>
								<div className="aspect-[3/4] relative">
									<Image
										src={`/saree-${item}.jpg`}
										alt={`Featured Saree ${item}`}
										fill
										className="object-cover transition-transform group-hover:scale-105"
									/>
								</div>
								<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
									<h3 className="text-white text-xl font-medium">
										Collection Name
									</h3>
									<p className="text-white/80">Starting from ₹15,999</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* About Section */}
			<section className="py-20 bg-muted">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
						<div>
							<h2 className="text-3xl font-serif mb-6 text-primary">
								Our Heritage
							</h2>
							<p className="text-muted-foreground mb-4">
								For generations, we have been crafting the finest sarees,
								bringing together traditional artisanship with contemporary
								designs. Each piece tells a story of cultural richness and
								artistic excellence.
							</p>
							<p className="text-muted-foreground mb-6">
								Our commitment to quality and authenticity has made us a trusted
								name in luxury Indian wear.
							</p>
							<Button
								variant="outline"
								className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
							>
								Learn More
							</Button>
						</div>
						<div className="relative aspect-square">
							<Image
								src="/about-image.jpg"
								alt="Our Heritage"
								fill
								className="object-cover rounded-lg"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Newsletter Section */}
			<section className="py-20 bg-accent text-accent-foreground">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl font-serif mb-6">Stay Connected</h2>
					<p className="max-w-2xl mx-auto mb-8">
						Subscribe to our newsletter for exclusive updates, new collection
						launches, and special offers.
					</p>
					<form className="max-w-md mx-auto flex gap-4">
						<input
							type="email"
							placeholder="Enter your email"
							className="flex-1 px-4 py-2 rounded-lg text-foreground bg-background"
						/>
						<Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
							Subscribe
						</Button>
					</form>
				</div>
			</section>
		</main>
	);
}
