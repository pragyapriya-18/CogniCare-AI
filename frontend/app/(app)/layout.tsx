"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";


export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      router.replace("/login");
      return;
    }

    setChecking(false);
  }, [router, pathname]);

  if (checking) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}