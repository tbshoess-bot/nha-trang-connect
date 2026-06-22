"use client";

import Link from "next/link";
import type { Post, PostType } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";

function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const BADGE: Record<PostType, string> = {
  event: "bg-sunset-400/20 text-sunset-600",
  question: "bg-sea-500/15 text-sea-700",
  listing: "bg-sand-300/60 text-ink-700",
  announcement: "bg-sunset-500/15 text-sunset-600",
};

export default function PostCard({ post }: { post: Post }) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const badgeLabel =
    post.type === "event" ? t.eventBadge :
    post.type === "question" ? t.questionBadge :
    post.type === "listing" ? t.listingBadge :
    t.announcementBadge;

  return (
    <Link
      href={`/post/${post.id}`}
      className="block rounded-2xl border border-sand-300 bg-white p-4 hover:border-sea-500 transition"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${BADGE[post.type]}`}>
          {badgeLabel}
        </span>
        {post.category && (
          <span className="text-xs text-ink-700/50">{post.category}</span>
        )}
        {post.type === "question" && post.is_answered && (
          <span className="ml-auto text-xs text-sea-700 font-medium">✓ {t.statusAnswered}</span>
        )}
        {post.type === "listing" && post.price != null && (
          <span className="ml-auto text-sm font-semibold text-ink-900">${post.price}</span>
        )}
      </div>

      {post.type === "listing" && post.images?.length > 0 && (
        <img
          src={post.images[0]}
          alt=""
          className="w-full h-36 object-cover rounded-xl mb-2 border border-sand-300"
        />
      )}

      <h3 className="font-medium text-ink-900 leading-snug">{post.title}</h3>
      {post.description && (
        <p className="text-sm text-ink-700/80 mt-1 line-clamp-2">{post.description}</p>
      )}

      <div className="flex items-center gap-3 mt-3 text-xs text-ink-700/55 flex-wrap">
        {post.type === "event" && post.event_date && (
          <span>📅 {formatDate(post.event_date, lang)}</span>
        )}
        {post.type === "event" && (post.address || post.location) && (
          <span className="truncate max-w-[160px]">📍 {post.address || post.location}</span>
        )}
        {post.type === "event" && (
          <span>{post.participant_count ?? 0} {t.participant}</span>
        )}
        {post.type === "question" && (
          <span>{post.answer_count ?? 0} {t.answerCount}</span>
        )}
        {post.type === "listing" && post.condition && (
          <span>{post.condition === "new" ? t.conditionNew : t.conditionUsed}</span>
        )}
      </div>
    </Link>
  );
}
