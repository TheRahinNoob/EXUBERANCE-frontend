"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/admin-auth/token";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/admin/login");
    }
  }, [router]);

  if (!isLoggedIn()) {
    return null;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin Panel</h1>
      <p>Admin UI coming soon.</p>
    </div>
  );
}