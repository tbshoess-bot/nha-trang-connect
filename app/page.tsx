import { createSupabaseServer } from "@/lib/supabase-server";
import FeedClient from "@/components/FeedClient";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = createSupabaseServer();
  const now = new Date().toISOString();

  const [evRes, qRes, lRes, evCount, qCount, lCount] = await Promise.all([
    db
      .from("posts")
      .select("*")
      .eq("type", "event")
      .gte("event_date", now)
      .order("event_date", { ascending: true })
      .limit(6),
    db
      .from("posts")
      .select("*")
      .eq("type", "question")
      .order("created_at", { ascending: false })
      .limit(3),
    db
      .from("posts")
      .select("*")
      .eq("type", "listing")
      .order("created_at", { ascending: false })
      .limit(3),
    db
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("type", "event")
      .gte("event_date", now),
    db
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("type", "question"),
    db
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("type", "listing"),
  ]);

  return (
    <FeedClient
      initialHomeData={{
        events: (evRes.data ?? []) as Post[],
        questions: (qRes.data ?? []) as Post[],
        listings: (lRes.data ?? []) as Post[],
      }}
      totalCounts={{
        events: evCount.count ?? 0,
        questions: qCount.count ?? 0,
        listings: lCount.count ?? 0,
      }}
    />
  );
}
