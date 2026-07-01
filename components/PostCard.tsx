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

const LEFT_BORDER_COLOR: Record<PostType, string> = {
  event: "#f5a001",
  question: "#1E5631",
  listing: "#c0a87a",
  announcement: "#8D153A",
};
const SERVICE_BORDER = "#1E5631";

const BADGE: Record<PostType, string> = {
  event: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  question: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  listing: "bg-cream-100 text-ink-700/70 ring-1 ring-cream-300",
  announcement: "bg-crimson-50 text-crimson-700 ring-1 ring-crimson-100",
};
const SERVICE_BADGE = "bg-teal-50 text-teal-700 ring-1 ring-teal-200";

export default function PostCard({ post }: { post: Post }) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const isService = post.type === "listing" && post.listing_type === "service";

  const badgeLabel = isService ? t.serviceBadge :
    post.type === "event" ? t.eventBadge :
    post.type === "question" ? t.questionBadge :
    post.type === "listing" ? t.listingBadge :
    t.announcementBadge;

  const borderColor = isService ? SERVICE_BORDER : LEFT_BORDER_COLOR[post.type];

  return (
    <Link
      href={`/post/${post.id}`}
      className="block rounded-xl bg-white border border-cream-300 border-l-4 hover:shadow-card-hover transition-all duration-200"
      style={{ borderLeftColor: borderColor }}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isService ? SERVICE_BADGE : BADGE[post.type]}`}>
            {badgeLabel}
          </span>
          {post.category && (
            <span className="text-xs text-ink-700/45 font-medium">{post.category}</span>
          )}
          {post.type === "question" && post.is_answered && (
            <span className="ml-auto text-xs text-forest-500 font-semibold">✓ {t.statusAnswered}</span>
          )}
          {post.type === "listing" && post.listing_type !== "service" && post.price != null && (
            <span className="ml-auto text-sm font-bold text-ink-900">${post.price}</span>
          )}
        </div>

        {post.type === "listing" && post.images?.length > 0 && (
          <img
            src={post.images[0]}
            alt=""
            className="w-full h-40 object-cover rounded-lg mb-3 border border-cream-300"
          />
        )}

        <h3 className="font-semibold text-ink-900 leading-snug text-[15px]">{post.title}</h3>
        {post.description && (
          <p className="text-sm text-ink-700/70 mt-1 line-clamp-2 leading-relaxed">
            {post.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-3 text-xs text-ink-700/50 flex-wrap">
          {post.type === "event" && post.event_date && (
            <span className="flex items-center gap-1">📅 {formatDate(post.event_date, lang)}</span>
          )}
          {post.type === "event" && (post.address || post.location) && (
            <span className="flex items-center gap-1 truncate max-w-[160px]">
              📍 <span className="truncate">{post.address || post.location}</span>
            </span>
          )}
          {post.type === "event" && (
            <span className="flex items-center gap-1">👥 {post.participant_count ?? 0} {t.participant}</span>
          )}
          {post.type === "question" && (
            <span className="flex items-center gap-1">💬 {post.answer_count ?? 0} {t.answerCount}</span>
          )}
          {post.type === "listing" && post.listing_type !== "service" && post.condition && (
            <span>{post.condition === "new" ? t.conditionNew : t.conditionUsed}</span>
          )}
          {isService && (post.address || post.location) && (
            <span className="flex items-center gap-1 truncate max-w-[160px]">
              📍 <span className="truncate">{post.address || post.location}</span>
            </span>
          )}
          {isService && post.contact_phone && (
            <span className="flex items-center gap-1 text-teal-700 font-medium">
              💬 WhatsApp
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
