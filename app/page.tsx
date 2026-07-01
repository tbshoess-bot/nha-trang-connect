"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Post, PostType } from "@/lib/types";
import PostCard from "@/components/PostCard";
import { useLanguage } from "@/lib/LanguageContext";
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
  const { lang } = useLanguage();
  const t = translations[lang];
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
      <div className="rounded-2xl bg-gradient-to-br from-crimson-500 to-crimson-700 p-5 text-white shadow-card">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🌴</span>
          <h1 className="text-base font-bold tracking-tight">
            {lang === "en" ? "Sri Lanka Community" : "Сообщество Шри-Ланки"}
          </h1>
        </div>
        <p className="text-sm text-crimson-100 leading-relaxed">
          {lang === "en"
            ? "Find events, ask questions, meet fellow travelers & expats"
            : "Мероприятия, вопросы, знакомства с путешественниками и экспатами"}
        </p>
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
