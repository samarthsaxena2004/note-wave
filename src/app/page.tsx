"use client";

import { useEffect, useState } from "react";
import LandingPage from "@/components/landing/LandingPage";
import DashboardPage from "@/components/dashboard/DashboardPage";

export default function RootPage() {
  const [mounted, setMounted] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    setMounted(true);
    const docs = localStorage.getItem("notewave_docs");
    if (docs && JSON.parse(docs).length > 0) {
      setHasEntered(true);
    }
  }, []);

  if (!mounted) return null;

  return hasEntered ? <DashboardPage /> : <LandingPage onEnter={() => setHasEntered(true)} />;
}