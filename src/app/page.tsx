"use client";

import { useEffect, useState } from "react";
import LandingPage from "@/components/landing/LandingPage";
import DashboardPage from "@/components/dashboard/DashboardPage";

export default function RootPage() {
  const [hasDocs, setHasDocs] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedDocs = localStorage.getItem("notewave_docs");
    if (savedDocs) {
      try {
        const parsed = JSON.parse(savedDocs);
        setHasDocs(Array.isArray(parsed) && parsed.length > 0);
      } catch (e) {
        setHasDocs(false);
      }
    } else {
      setHasDocs(false);
    }
  }, []);

  // Prevent Hydration mismatch: show nothing until mounted
  if (!mounted || hasDocs === null) return null;

  return hasDocs ? <DashboardPage /> : <LandingPage />;
}