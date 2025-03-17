"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginAction } from "./actions";
import { type LoginFormData, loginSchema } from "./types";

export default function AdminLoginPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginFormData) => {
		setError(null);
		const result = await loginAction(data);
		if (result.error) {
			setError(result.error);
		} else if (result.success) {
			router.push("/admin");
		}
	};

	return (
		<div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
			<div className="relative hidden h-full flex-col bg-accent p-10 text-accent-foreground lg:flex dark:border-r">
				<div className="absolute inset-0 bg-accent" />
				<div className="relative z-20 flex items-center text-lg font-medium">
					<Link
						href="/"
						className="font-serif text-2xl flex items-center gap-2"
					>
						<Image
							src="/kayaan-logo.jpeg"
							alt="Kayaan Logo"
							width={140}
							height={70}
							className="rounded-sm"
						/>
					</Link>
				</div>
				<div className="relative z-20 mt-auto">
					<blockquote className="space-y-2">
						<p className="text-lg">
							&ldquo;Managing your store's giveaways and lucky draws has never
							been easier.&rdquo;
						</p>
					</blockquote>
				</div>
			</div>
			<div className="lg:p-8 bg-background">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
					<div className="flex flex-col space-y-2 text-center">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">
							Admin Login
						</h1>
						<p className="text-sm text-muted-foreground">
							Enter your credentials to access the admin panel
						</p>
					</div>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						{error && (
							<div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
								{error}
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								{...register("email")}
								type="email"
								placeholder="admin@example.com"
								className="w-full"
							/>
							{errors.email && (
								<p className="text-sm text-red-600">{errors.email.message}</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								{...register("password")}
								type="password"
								className="w-full"
							/>
							{errors.password && (
								<p className="text-sm text-red-600">
									{errors.password.message}
								</p>
							)}
						</div>
						<Button
							type="submit"
							className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Signing in..." : "Sign In"}
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}
