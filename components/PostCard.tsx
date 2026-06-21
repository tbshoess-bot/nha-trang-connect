"use client";

import Link from "next/link";
import type { Post } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";

function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", { day: "numeric", month: "short" });
}

export default function PostCard({ post }: { post: Post }) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const isEvent = post.type === "event";

  return (
    <Link
      href={`/post/${post.id}`}
      className="block rounded-2xl border border-sand-300 bg-white p-4 hover:border-sea-500 transition"
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isEvent ? "bg-sunset-400/20 text-sunset-600" : "bg-sea-500/15 text-sea-700"
          }`}
        >
          {isEvent ? t.eventBadge : t.questionBadge}
        </span>
        {post.category && (
          <span className="text-xs text-ink-700/60">{post.category}</span>
        )}
      </div>

      <h3 className="font-medium text-ink-900">{post.title}</h3>
      {post.description && (
        <p className="text-sm text-ink-700/80 mt-1 line-clamp-2">{post.description}</p>
      )}

      <div className="flex items-center gap-4 mt-3 text-xs text-ink-700/60">
        {isEvent && post.event_date && <span>{formatDate(post.event_date, lang)}</span>}
        {isEvent && post.location && <span>{post.location}</span>}
        {isEvent && <span>{post.participant_count ?? 0} {t.participant}</span>}
        {!isEvent && <span>{post.answer_count ?? 0} {t.answerCount}</span>}
      </div>
    </Link>
  );
}
