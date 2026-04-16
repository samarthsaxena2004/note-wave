"use client";

import { useEffect, useState } from "react";
import LandingPage from "@/components/landing/LandingPage";
import DashboardPage from "@/components/dashboard/DashboardPage";
import { useAuth } from "@/lib/supabase/AuthProvider";

export default function RootPage() {
  const { session, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) return null;

  return session ? <DashboardPage /> : <LandingPage />;
}