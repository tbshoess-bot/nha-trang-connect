"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Post, PostType } from "@/lib/types";
import PostCard from "@/components/PostCard";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";

type FilterType = "all" | PostType;

export default function FeedPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    async function loadFeed() {
      const now = new Date().toISOString();

      const [{ data: events }, { data: others }] = await Promise.all([
        supabase
          .from("posts")
          .select("*")
          .eq("type", "event")
          .gte("event_date", now)
          .order("event_date", { ascending: true }),
        supabase
          .from("posts")
          .select("*")
          .in("type", ["question", "listing", "announcement"])
          .order("created_at", { ascending: false }),
      ]);

      setPosts([...(events ?? []), ...(others ?? [])] as Post[]);
      setLoading(false);
    }
    loadFeed();
  }, []);

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: t.filterAll },
    { key: "event", label: t.filterEvents },
    { key: "question", label: t.filterQuestions },
    { key: "listing", label: t.filterListings },
    { key: "announcement", label: t.filterAnnouncements },
  ];

  const filtered = filter === "all" ? posts : posts.filter((p) => p.type === filter);

  if (loading) return <p className="text-ink-700/60 text-sm">{t.loadingFeed}</p>;

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              filter === key
                ? "bg-sea-500 text-white"
                : "bg-sand-100 text-ink-700/70 hover:bg-sand-300/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink-700/70">{t.noPosts}</p>
          <p className="text-sm text-ink-700/50 mt-1">{t.noPostsHint}</p>
        </div>
      ) : (
        filtered.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
