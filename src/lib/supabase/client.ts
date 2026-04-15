import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
);
