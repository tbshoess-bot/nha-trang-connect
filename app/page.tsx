"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Post, PostType } from "@/lib/types";
import PostCard from "@/components/PostCard";
import { translations } from "@/lib/translations";

type FilterType = "all" | PostType;
type ListingSubFilter = "all" | "item" | "service";

const FILTER_ICONS: Record<FilterType, string> = {
  all: "✨",
  event: "🗓",
  question: "❓",
  listing: "🏷",
  announcement: "📢",
};

export default function FeedPage() {
  const t = translations["en"];
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [listingSub, setListingSub] = useState<ListingSubFilter>("all");

  useEffect(() => {
    async function loadFeed() {
      const now = new Date().toISOString();
      const [{ data: events }, { data: others }] = await Promise.all([
        supabase.from("posts").select("*").eq("type", "event").gte("event_date", now).order("event_date", { ascending: true }),
        supabase.from("posts").select("*").in("type", ["question", "listing", "announcement"]).order("created_at", { ascending: false }),
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

  function handleFilterChange(key: FilterType) {
    setFilter(key);
    setListingSub("all");
  }

  let filtered = filter === "all" ? posts : posts.filter((p) => p.type === filter);
  if (filter === "listing" && listingSub !== "all") {
    filtered = filtered.filter((p) => (p.listing_type ?? "item") === listingSub);
  }

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden relative bg-gradient-to-br from-crimson-700 via-crimson-600 to-crimson-500 shadow-card">
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-gold-400/10 pointer-events-none" />

        <div className="relative p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight leading-tight">
                Sri Lanka <span className="text-gold-300">Connect</span>
              </h1>
              <p className="text-sm text-crimson-100 mt-1 leading-snug max-w-[220px]">
                Travelers, backpackers &amp; expats — all in one place
              </p>
            </div>
            <span className="text-5xl leading-none -mt-1 select-none">🦁</span>
          </div>

          {/* Live stats */}
          <div className="flex gap-2 mt-4">
            {[
              { count: posts.filter((p) => p.type === "event").length, label: "upcoming events" },
              { count: posts.filter((p) => p.type === "listing").length, label: "listings" },
              { count: posts.filter((p) => p.type === "question").length, label: "questions" },
            ].map(({ count, label }) => (
              <div key={label} className="flex-1 bg-white/15 rounded-xl py-2.5 px-1 text-center">
                <div className="text-xl font-bold leading-none">{loading ? "—" : count}</div>
                <div className="text-[10px] text-crimson-100 mt-1 leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleFilterChange(key)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
              filter === key
                ? "bg-crimson-500 text-white shadow-sm"
                : "bg-white text-ink-700 border border-cream-300 hover:border-crimson-200 hover:bg-cream-50"
            }`}
          >
            <span className="text-base leading-none">{FILTER_ICONS[key]}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Listing sub-filter */}
      {filter === "listing" && (
        <div className="flex gap-2">
          {([
            { key: "all" as const, label: t.filterListingsAll },
            { key: "item" as const, label: `🛒 ${t.filterForSale}` },
            { key: "service" as const, label: `🔧 ${t.filterServices}` },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setListingSub(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                listingSub === key
                  ? "bg-ink-900 text-white border-ink-900"
                  : "bg-white text-ink-700/70 border-cream-300 hover:border-ink-700/30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Feed */}
      {loading ? (
        <div className="py-10 text-center text-sm text-ink-700/50">{t.loadingFeed}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-2xl mb-3">🌊</p>
          <p className="text-ink-700/70 font-medium">{t.noPosts}</p>
          <p className="text-sm text-ink-700/50 mt-1">{t.noPostsHint}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  );
}
