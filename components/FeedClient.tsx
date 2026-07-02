"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Post, PostType } from "@/lib/types";
import { REGIONS } from "@/lib/constants";
import PostCard from "@/components/PostCard";
import { translations } from "@/lib/translations";

const t = translations["en"];

type FilterType = "home" | PostType;
type ListingSub = "all" | "item" | "service";

interface HomeData {
  events: Post[];
  questions: Post[];
  listings: Post[];
}

export interface FeedClientProps {
  initialHomeData: HomeData;
  totalCounts: { events: number; questions: number; listings: number };
}

const FILTER_ICONS: Record<string, string> = {
  home: "🏠",
  event: "🗓",
  question: "❓",
  listing: "🏷",
  announcement: "📢",
};

const FILTER_LABELS: Record<string, string> = {
  home: "Home",
  event: t.filterEvents,
  question: t.filterQuestions,
  listing: t.filterListings,
  announcement: t.filterAnnouncements,
};

const FILTER_TABS: FilterType[] = ["home", "event", "question", "listing", "announcement"];

export default function FeedClient({ initialHomeData, totalCounts }: FeedClientProps) {
  const [filter, setFilter] = useState<FilterType>("home");
  const [region, setRegion] = useState("All");
  const [homeData, setHomeData] = useState<HomeData>(initialHomeData);
  const [homeLoading, setHomeLoading] = useState(false);
  const [tabPosts, setTabPosts] = useState<Post[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [listingSub, setListingSub] = useState<ListingSub>("all");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("preferredRegion") ?? "All";
    setRegion(stored);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (filter === "home") {
      if (region === "All") {
        setHomeData(initialHomeData);
      } else {
        loadHomeData(region);
      }
    } else {
      loadTabData(filter, region, filter === "listing" ? listingSub : "all");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, region, listingSub, initialized]);

  function changeRegion(r: string) {
    setRegion(r);
    localStorage.setItem("preferredRegion", r);
  }

  function changeFilter(f: FilterType) {
    setFilter(f);
    if (f !== "listing") setListingSub("all");
  }

  async function loadHomeData(selectedRegion: string) {
    setHomeLoading(true);
    const now = new Date().toISOString();
    const applyRegion = (q: ReturnType<typeof supabase.from>) =>
      selectedRegion !== "All" ? (q as any).eq("region", selectedRegion) : q;

    const [evRes, qRes, lRes] = await Promise.all([
      applyRegion(supabase.from("posts").select("*").eq("type", "event").gte("event_date", now).order("event_date", { ascending: true }).limit(6) as any),
      applyRegion(supabase.from("posts").select("*").eq("type", "question").order("created_at", { ascending: false }).limit(3) as any),
      applyRegion(supabase.from("posts").select("*").eq("type", "listing").order("created_at", { ascending: false }).limit(3) as any),
    ]);

    setHomeData({
      events: (evRes.data ?? []) as Post[],
      questions: (qRes.data ?? []) as Post[],
      listings: (lRes.data ?? []) as Post[],
    });
    setHomeLoading(false);
  }

  async function loadTabData(tab: PostType, selectedRegion: string, sub: ListingSub) {
    setTabLoading(true);
    const now = new Date().toISOString();

    let query: any =
      tab === "event"
        ? supabase.from("posts").select("*").eq("type", "event").gte("event_date", now).order("event_date", { ascending: true })
        : supabase.from("posts").select("*").eq("type", tab).order("created_at", { ascending: false });

    if (selectedRegion !== "All") query = query.eq("region", selectedRegion);
    if (tab === "listing" && sub !== "all") query = query.eq("listing_type", sub);

    const { data } = await query;
    setTabPosts((data ?? []) as Post[]);
    setTabLoading(false);
  }

  const showEventCount = totalCounts.events >= 10;
  const showListingCount = totalCounts.listings >= 10;
  const showQuestionCount = totalCounts.questions >= 10;
  const hasAnyCount = showEventCount || showListingCount || showQuestionCount;

  return (
    <div className="space-y-4">
      {/* ── Hero ── */}
      <div className="rounded-2xl overflow-hidden relative bg-gradient-to-br from-crimson-700 via-crimson-600 to-crimson-500 shadow-card">
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-gold-400/10 pointer-events-none" />
        <div className="relative p-5 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight leading-tight">
                Sri Lanka <span className="text-gold-300">Connect</span>
              </h1>
              <p className="text-sm text-crimson-100 mt-1 leading-snug max-w-[220px]">
                Travelers, backpackers &amp; expats — all in one place
              </p>
            </div>
            <span className="text-5xl leading-none -mt-1 select-none">🦁</span>
          </div>

          <button
            onClick={() => changeFilter("event")}
            className="mt-4 inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 active:bg-white/30 transition rounded-xl px-4 py-2 text-sm font-semibold text-white"
          >
            See what&apos;s happening this week →
          </button>

          {hasAnyCount && (
            <div className="flex gap-2 mt-4">
              {showEventCount && (
                <div className="flex-1 bg-white/15 rounded-xl py-2.5 px-1 text-center">
                  <div className="text-xl font-bold leading-none">{totalCounts.events}</div>
                  <div className="text-[10px] text-crimson-100 mt-1">events</div>
                </div>
              )}
              {showListingCount && (
                <div className="flex-1 bg-white/15 rounded-xl py-2.5 px-1 text-center">
                  <div className="text-xl font-bold leading-none">{totalCounts.listings}</div>
                  <div className="text-[10px] text-crimson-100 mt-1">listings</div>
                </div>
              )}
              {showQuestionCount && (
                <div className="flex-1 bg-white/15 rounded-xl py-2.5 px-1 text-center">
                  <div className="text-xl font-bold leading-none">{totalCounts.questions}</div>
                  <div className="text-[10px] text-crimson-100 mt-1">questions</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Region chips ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {(["All", ...REGIONS] as string[]).map((r) => (
          <button
            key={r}
            onClick={() => changeRegion(r)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              region === r
                ? "bg-ink-900 text-white border-ink-900"
                : "bg-white text-ink-700/60 border-cream-300 hover:border-ink-700/30"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* ── Type filter tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {FILTER_TABS.map((f) => (
          <button
            key={f}
            onClick={() => changeFilter(f)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? "bg-crimson-500 text-white shadow-sm"
                : "bg-white text-ink-700 border border-cream-300 hover:border-crimson-200 hover:bg-cream-50"
            }`}
          >
            <span className="text-base leading-none">{FILTER_ICONS[f]}</span>
            <span>{FILTER_LABELS[f]}</span>
          </button>
        ))}
      </div>

      {/* ── Listing sub-filter ── */}
      {filter === "listing" && (
        <div className="flex gap-2">
          {(["all", "item", "service"] as ListingSub[]).map((s) => (
            <button
              key={s}
              onClick={() => setListingSub(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                listingSub === s
                  ? "bg-ink-900 text-white border-ink-900"
                  : "bg-white text-ink-700/70 border-cream-300 hover:border-ink-700/30"
              }`}
            >
              {s === "all"
                ? t.filterListingsAll
                : s === "item"
                ? `🛒 ${t.filterForSale}`
                : `🔧 ${t.filterServices}`}
            </button>
          ))}
        </div>
      )}

      {/* ── Content ── */}
      {filter === "home" ? (
        homeLoading ? (
          <div className="py-10 text-center text-sm text-ink-700/50">Loading…</div>
        ) : (
          <HomeSections
            events={homeData.events}
            questions={homeData.questions}
            listings={homeData.listings}
            onSeeAllEvents={() => changeFilter("event")}
            onSeeAllQuestions={() => changeFilter("question")}
            onSeeAllListings={() => changeFilter("listing")}
          />
        )
      ) : tabLoading ? (
        <div className="py-10 text-center text-sm text-ink-700/50">Loading…</div>
      ) : tabPosts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-2xl mb-3">🌊</p>
          <p className="text-ink-700/70 font-medium">{t.noPosts}</p>
          <p className="text-sm text-ink-700/50 mt-1">{t.noPostsHint}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tabPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Home Sections ────────────────────────────────────────────────

interface HomeSectionsProps {
  events: Post[];
  questions: Post[];
  listings: Post[];
  onSeeAllEvents: () => void;
  onSeeAllQuestions: () => void;
  onSeeAllListings: () => void;
}

function HomeSections({
  events,
  questions,
  listings,
  onSeeAllEvents,
  onSeeAllQuestions,
  onSeeAllListings,
}: HomeSectionsProps) {
  const hasEvents = events.length > 0;
  const hasQuestions = questions.length > 0;
  const hasListings = listings.length > 0;

  if (!hasEvents && !hasQuestions && !hasListings) {
    return (
      <div className="text-center py-16">
        <p className="text-2xl mb-3">🌊</p>
        <p className="text-ink-700/70 font-medium">No posts yet for this area.</p>
        <p className="text-sm text-ink-700/50 mt-1">Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Upcoming Events — horizontal scroll strip */}
      {hasEvents && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-ink-900 uppercase tracking-widest">
              📅 Upcoming Events
            </h2>
            <button
              onClick={onSeeAllEvents}
              className="text-xs font-semibold text-crimson-600 hover:text-crimson-800 transition"
            >
              See all →
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
            {events.map((ev) => (
              <EventMiniCard key={ev.id} post={ev} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Questions */}
      {hasQuestions && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-ink-900 uppercase tracking-widest">
              ❓ Recent Questions
            </h2>
            <button
              onClick={onSeeAllQuestions}
              className="text-xs font-semibold text-crimson-600 hover:text-crimson-800 transition"
            >
              See all →
            </button>
          </div>
          <div className="space-y-2">
            {questions.map((q) => (
              <Link
                key={q.id}
                href={`/post/${q.id}`}
                className="block p-3.5 rounded-xl bg-white border border-cream-300 border-l-4 hover:shadow-sm transition"
                style={{ borderLeftColor: "#1E5631" }}
              >
                <p className="font-semibold text-ink-900 text-sm leading-snug">{q.title}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-ink-700/50">
                  {q.category && <span>{q.category}</span>}
                  <span>💬 {q.answer_count ?? 0} answers</span>
                  {q.is_answered && (
                    <span className="font-semibold" style={{ color: "#1E5631" }}>
                      ✓ Answered
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Listings */}
      {hasListings && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-ink-900 uppercase tracking-widest">
              🏷 Latest Listings
            </h2>
            <button
              onClick={onSeeAllListings}
              className="text-xs font-semibold text-crimson-600 hover:text-crimson-800 transition"
            >
              See all →
            </button>
          </div>
          <div className="space-y-3">
            {listings.map((l) => (
              <PostCard key={l.id} post={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Event Mini Card ─────────────────────────────────────────────

function EventMiniCard({ post }: { post: Post }) {
  const date = post.event_date ? new Date(post.event_date) : null;
  const day = date?.toLocaleDateString("en-GB", { day: "numeric" });
  const month = date?.toLocaleDateString("en-GB", { month: "short" });
  const time = date?.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <Link
      href={`/post/${post.id}`}
      className="shrink-0 w-36 rounded-xl bg-white border border-cream-300 border-l-4 overflow-hidden hover:shadow-md transition-all"
      style={{ borderLeftColor: "#f5a001" }}
    >
      <div className="p-3 flex flex-col gap-1">
        {date && (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-ink-900 leading-none">{day}</span>
            <span className="text-xs font-semibold text-ink-700/50 uppercase">{month}</span>
          </div>
        )}
        {time && <span className="text-[11px] text-crimson-600 font-semibold">{time}</span>}
        <p className="text-xs font-semibold text-ink-900 leading-tight line-clamp-3 mt-0.5">
          {post.title}
        </p>
        {(post.address || post.location) && (
          <p className="text-[10px] text-ink-700/50 truncate">
            📍 {post.address || post.location}
          </p>
        )}
        <p className="text-[10px] text-ink-700/45">👥 {post.participant_count ?? 0} going</p>
      </div>
    </Link>
  );
}
