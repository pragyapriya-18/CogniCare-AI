"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  return <>{children}</>;
}