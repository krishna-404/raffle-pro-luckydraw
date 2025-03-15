'use client';

import { Header } from "@/components/layout/header";
import { usePathname } from "next/navigation";

export function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Header />}
      {children}
    </>
  );
} 