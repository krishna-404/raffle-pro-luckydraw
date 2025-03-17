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
import { registerAction } from "./actions";
import { type RegisterFormData, registerSchema } from "./types";

export default function AdminRegisterPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
	});

	const onSubmit = async (data: RegisterFormData) => {
		setError(null);
		const result = await registerAction(data);
		if (result.error) {
			setError(result.error);
		} else if (result.success) {
			router.push("/admin/login");
		}
	};

	return (
		<div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
			<div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
				<div className="absolute inset-0 bg-zinc-900" />
				<div className="relative z-20 flex items-center text-lg font-medium">
					<div className="flex items-center gap-2">
						<Image
							src="/kayaan-logo.jpeg"
							alt="Kayaan Logo"
							width={140}
							height={70}
							className="rounded-sm"
						/>
					</div>
				</div>
				<div className="relative z-20 mt-auto">
					<blockquote className="space-y-2">
						<p className="text-lg">
							&ldquo;This admin panel lets you manage your events, prizes, and
							QR codes for your raffle draws.&rdquo;
						</p>
					</blockquote>
				</div>
			</div>
			<div className="lg:p-8">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
					<div className="flex flex-col space-y-2 text-center">
						<h1 className="text-2xl font-semibold tracking-tight">
							Create an admin account
						</h1>
						<p className="text-sm text-muted-foreground">
							Enter your details below to create your admin account
						</p>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								placeholder="admin@example.com"
								type="email"
								{...register("email")}
							/>
							{errors.email && (
								<p className="text-sm text-red-500">{errors.email.message}</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" {...register("password")} />
							{errors.password && (
								<p className="text-sm text-red-500">
									{errors.password.message}
								</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="token">Registration Token</Label>
							<Input id="token" type="password" {...register("token")} />
							{errors.token && (
								<p className="text-sm text-red-500">{errors.token.message}</p>
							)}
						</div>
						{error && <div className="text-sm text-red-500">{error}</div>}
						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? "Creating account..." : "Create account"}
						</Button>
					</form>

					<p className="px-8 text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							href="/admin/login"
							className="underline underline-offset-4 hover:text-primary"
						>
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
