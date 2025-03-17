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

			{/* Stay Connected Section */}
			<section className="py-20 bg-accent">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl font-serif mb-6 text-white">
						Stay Connected
					</h2>
					<p className="max-w-2xl mx-auto mb-8 text-white">
						Connect with us directly on WhatsApp for exclusive updates, new
						collection launches, and special offers.
					</p>
					<a
						href="https://wa.me/919925559041?text=Hello%20Kayaan%2C%20I%20visited%20your%20website%20and%20I'm%20interested%20in%20your%20saree%20collection.%20Could%20you%20please%20share%20more%20details%3F"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="currentColor"
							className="h-5 w-5"
							aria-labelledby="whatsappIconTitle"
							role="img"
						>
							<title id="whatsappIconTitle">WhatsApp Icon</title>
							<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
							<path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-1.97 0-3.8-.57-5.35-1.55L2 22l1.55-4.65A9.969 9.969 0 0 1 2 12 10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.96A7.95 7.95 0 0 0 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8z" />
						</svg>
						Connect on WhatsApp
					</a>
				</div>
			</section>
		</main>
	);
}
