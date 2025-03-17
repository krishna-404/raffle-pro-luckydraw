import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
	return (
		<main className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="relative h-screen w-full flex items-center">
				<div className="absolute inset-0 z-0">
					<Image
						src="/hero-saree.jpg"
						alt="Elegant Saree Collection"
						fill
						className="object-cover"
						priority
						sizes="100vw"
					/>
					{/* Black overlay for mobile and tablet views */}
					<div className="absolute inset-0 bg-black/30 md:bg-black/10 lg:bg-transparent" />
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
						<h1 className="text-5xl font-serif font-bold mb-6 drop-shadow-md">
							Timeless Beauty in Every Weave
						</h1>
						<p className="text-xl mb-8 drop-shadow-md">
							Discover our exquisite collection of handcrafted sarees, where
							tradition meets contemporary design.
						</p>
						<div>
							<Link href="/giveaway">
								<Button
									size="lg"
									className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
								{/* <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
									<h3 className="text-white text-xl font-medium">
										Collection Name
									</h3>
                  <p className="text-white/80">Starting from ₹15,999</p>
								</div> */}
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

			{/* Contact Us Section */}
			<section className="py-16 bg-background">
				<div className="container mx-auto px-4 max-w-5xl">
					<h2 className="text-3xl font-serif text-center mb-12 text-primary">
						Contact Us
					</h2>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-xl shadow-sm overflow-hidden">
						{/* Contact Information */}
						<div className="flex flex-col justify-center p-8 lg:p-10">
							<div className="mb-8 border-l-4 border-primary pl-4">
								<h3 className="text-xl font-serif mb-4 text-primary">
									Our Location
								</h3>
								<address className="not-italic text-muted-foreground space-y-1">
									<p className="font-medium text-foreground">
										Kayaan Prints Pvt. Ltd.
									</p>
									<p>F-5723 to 5752, Lift No.6,</p>
									<p>3rd Floor, Raghukul Market,</p>
									<p>Ring Road,</p>
									<p>Surat - 395002</p>
									<p className="pt-2">
										Ph:{" "}
										<a
											href="tel:+918932893893"
											className="text-primary hover:underline transition-colors"
										>
											+91 89328 93893
										</a>
									</p>
								</address>
							</div>

							<div className="border-l-4 border-primary pl-4">
								<h3 className="text-xl font-serif mb-4 text-primary">
									Connect With Us
								</h3>
								<div className="flex space-x-3">
									<a
										href="https://www.facebook.com/kayaan.prints/"
										target="_blank"
										rel="noopener noreferrer"
										className="bg-[#1877F2] text-white p-1.5 rounded-full hover:opacity-90 transition-all hover:scale-110 flex items-center justify-center"
										aria-label="Visit our Facebook page"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="currentColor"
											aria-hidden="true"
										>
											<title>Facebook</title>
											<path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
										</svg>
										<span className="sr-only">Facebook</span>
									</a>
									<a
										href="https://www.instagram.com/kayaanprintspvtltd/"
										target="_blank"
										rel="noopener noreferrer"
										className="bg-gradient-to-tr from-[#fd5949] via-[#d6249f] to-[#285AEB] text-white p-1.5 rounded-full hover:opacity-90 transition-all hover:scale-110 flex items-center justify-center"
										aria-label="Visit our Instagram page"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="currentColor"
											aria-hidden="true"
										>
											<title>Instagram</title>
											<path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.466.182-.8.398-1.15.748-.35.35-.566.684-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.04 0 2.67.01 2.986.058 4.04.045.976.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.04.058 2.67 0 2.987-.01 4.04-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.04 0-2.67-.01-2.986-.058-4.04-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.055-.048-1.37-.058-4.04-.058zm0 3.063a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27zm0 8.468a3.333 3.333 0 1 0 0-6.666 3.333 3.333 0 0 0 0 6.666zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
										</svg>
										<span className="sr-only">Instagram</span>
									</a>
									<a
										href="https://x.com/KayaanLtd"
										target="_blank"
										rel="noopener noreferrer"
										className="bg-black text-white p-1.5 rounded-full hover:opacity-90 transition-all hover:scale-110 flex items-center justify-center"
										aria-label="Visit our Twitter page"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="currentColor"
											aria-hidden="true"
										>
											<title>Twitter</title>
											<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
										</svg>
										<span className="sr-only">Twitter</span>
									</a>
								</div>
							</div>
						</div>

						{/* Google Maps */}
						<div className="h-[350px] lg:h-auto relative">
							<div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-0">
								<div className="text-center p-6">
									<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="text-primary"
										>
											<title>Map Pin</title>
											<path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
											<circle cx="12" cy="10" r="3" />
										</svg>
									</div>
									<p className="text-sm text-gray-600">
										Google Maps could not be loaded. Please visit our location
										at Raghukul Market, Ring Road, Surat.
									</p>
								</div>
							</div>
							<iframe
								src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.4069390311166!2d72.83661807607848!3d21.20750998127878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04e59411d1563%3A0xc9bd0d885d7c94be!2sRaghukul%20Textile%20Market!5e0!3m2!1sen!2sin!4v1716661234567!5m2!1sen!2sin"
								width="100%"
								height="100%"
								style={{ border: 0, position: "relative", zIndex: 10 }}
								allowFullScreen={false}
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
								title="Kayaan Prints Pvt. Ltd. Location"
								aria-label="Google Maps showing Kayaan Prints Pvt. Ltd. location"
								className="relative z-10"
							/>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
