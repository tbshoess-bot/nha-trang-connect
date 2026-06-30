"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import type { Post, Answer, PostType } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

const BADGE: Record<PostType, string> = {
  event: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  question: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  listing: "bg-cream-100 text-ink-700/70 ring-1 ring-cream-300",
  announcement: "bg-crimson-50 text-crimson-700 ring-1 ring-crimson-100",
};

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];
  const [post, setPost] = useState<Post | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [joined, setJoined] = useState(false);
  const [newAnswer, setNewAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    async function load() {
      const { data: postData } = await supabase.from("posts").select("*").eq("id", params.id).single();
      setPost(postData as Post);
      if (postData) {
        setEditTitle(postData.title);
        setEditDescription(postData.description ?? "");
      }

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id ?? null;
      setCurrentUserId(userId);

      if (postData?.type === "event") {
        const { count } = await supabase
          .from("event_participants")
          .select("*", { count: "exact", head: true })
          .eq("post_id", params.id);
        setParticipantCount(count ?? 0);
        if (userId) {
          const { data: existing } = await supabase
            .from("event_participants")
            .select("*")
            .eq("post_id", params.id)
            .eq("user_id", userId)
            .maybeSingle();
          setJoined(!!existing);
        }
      } else if (postData?.type === "question") {
        const { data: answerData } = await supabase
          .from("answers")
          .select("*")
          .eq("post_id", params.id)
          .order("is_best", { ascending: false })
          .order("created_at", { ascending: true });
        setAnswers((answerData as Answer[]) ?? []);
      }

      setLoading(false);
    }
    load();
  }, [params.id]);

  async function handleJoin() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;
    await supabase.from("event_participants").insert({ post_id: params.id, user_id: user.id });
    setJoined(true);
    setParticipantCount((c) => c + 1);
  }

  async function handleAnswerSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user || !newAnswer.trim()) return;
    const { data } = await supabase
      .from("answers")
      .insert({ post_id: params.id, author_id: user.id, content: newAnswer })
      .select()
      .single();
    if (data) { setAnswers((prev) => [...prev, data as Answer]); setNewAnswer(""); }
  }

  async function handleMarkBest(answerId: string) {
    await supabase.from("answers").update({ is_best: true }).eq("id", answerId);
    setAnswers((prev) =>
      prev.map((a) => (a.id === answerId ? { ...a, is_best: true } : { ...a, is_best: false }))
    );
  }

  async function handleMarkAnswered() {
    await supabase.from("posts").update({ is_answered: true }).eq("id", params.id);
    setPost((prev) => prev ? { ...prev, is_answered: true } : prev);
  }

  async function handleDelete() {
    const confirmed = window.confirm(lang === "en" ? "Delete this post?" : "Удалить эту публикацию?");
    if (!confirmed) return;
    await supabase.from("posts").delete().eq("id", params.id);
    router.push("/");
  }

  async function handleEditSave() {
    if (!editTitle.trim()) return;
    await supabase
      .from("posts")
      .update({ title: editTitle, description: editDescription || null })
      .eq("id", params.id);
    setPost((prev) => prev ? { ...prev, title: editTitle, description: editDescription || null } : prev);
    setEditing(false);
  }

  if (loading) return <p className="text-ink-700/60 text-sm py-8 text-center">{t.loading}</p>;
  if (!post) return <p className="text-ink-700/60 text-sm py-8 text-center">{t.notFound}</p>;

  const isAuthor = currentUserId === post.author_id;
  const locale = lang === "ru" ? "ru-RU" : "en-GB";

  const badgeLabel =
    post.type === "event" ? t.eventBadge :
    post.type === "question" ? t.questionBadge :
    post.type === "listing" ? t.listingBadge :
    t.announcementBadge;

  const inputClass = "w-full rounded-xl border border-cream-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500 bg-white";

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE[post.type]}`}>
              {badgeLabel}
            </span>
            {post.type === "question" && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                post.is_answered
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-cream-100 text-ink-700/60 ring-1 ring-cream-300"
              }`}>
                {post.is_answered ? t.statusAnswered : t.statusOpen}
              </span>
            )}
          </div>
          {isAuthor && !editing && (
            <div className="flex gap-2 ml-auto">
              <button onClick={() => setEditing(true)} className="text-xs text-ink-700/50 hover:text-crimson-500 transition font-medium">
                {lang === "en" ? "Edit" : "Редактировать"}
              </button>
              <button onClick={handleDelete} className="text-xs text-ink-700/50 hover:text-red-600 transition font-medium">
                {lang === "en" ? "Delete" : "Удалить"}
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="mt-3 space-y-2">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className={`${inputClass} font-semibold`}
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className={inputClass}
            />
            <div className="flex gap-2">
              <button onClick={handleEditSave} className="px-4 py-2 rounded-xl bg-crimson-500 text-white text-sm font-bold hover:bg-crimson-700 transition">
                {lang === "en" ? "Save" : "Сохранить"}
              </button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-xl border border-cream-300 text-sm text-ink-700/70 hover:border-crimson-500 transition bg-white">
                {lang === "en" ? "Cancel" : "Отмена"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold mt-2 leading-snug">{post.title}</h1>
            {post.description && <p className="text-ink-700/80 mt-2 leading-relaxed">{post.description}</p>}
          </>
        )}
      </div>

      {/* EVENT */}
      {post.type === "event" && (
        <div className="rounded-2xl border border-cream-300 bg-white p-5 space-y-3 shadow-card">
          {post.event_date && (
            <p className="text-sm text-ink-700/70 flex items-center gap-2">
              <span>📅</span>
              {new Date(post.event_date).toLocaleString(locale)}
            </p>
          )}
          {(post.address || post.location) && (
            <div className="space-y-2">
              <p className="text-sm text-ink-700/70 flex items-center gap-2">
                <span>📍</span>
                {post.address || post.location}
              </p>
              {post.lat && post.lng && (
                <div className="rounded-xl overflow-hidden border border-cream-300" style={{ height: 180 }}>
                  <MapPicker lat={post.lat} lng={post.lng} address="" onChange={() => {}} />
                </div>
              )}
              {post.lat && post.lng && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${post.lat}&mlon=${post.lng}&zoom=16`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-crimson-500 hover:text-crimson-700 hover:underline font-medium"
                >
                  {t.viewOnMap} ↗
                </a>
              )}
            </div>
          )}
          <p className="text-sm text-ink-700/60 flex items-center gap-1">
            <span>👥</span>
            {participantCount} {t.peopleAttending}
          </p>
          <button
            onClick={handleJoin}
            disabled={joined}
            className="rounded-xl bg-crimson-500 text-white px-6 py-2.5 text-sm font-bold hover:bg-crimson-700 transition shadow-sm disabled:opacity-50"
          >
            {joined ? t.joined : t.join}
          </button>
        </div>
      )}

      {/* LISTING */}
      {post.type === "listing" && (
        <div className="rounded-2xl border border-cream-300 bg-white p-5 space-y-3 shadow-card">
          {post.images?.length > 0 && (
            <div className="space-y-2">
              <img
                src={post.images[imgIndex]}
                alt=""
                className="w-full rounded-xl object-cover border border-cream-300"
                style={{ maxHeight: 280 }}
              />
              {post.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {post.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      onClick={() => setImgIndex(i)}
                      className={`w-14 h-14 rounded-lg object-cover cursor-pointer border-2 transition ${
                        i === imgIndex ? "border-crimson-500" : "border-cream-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-3">
            {post.price != null && (
              <span className="text-2xl font-bold text-ink-900">${post.price}</span>
            )}
            {post.condition && (
              <span className="text-sm px-3 py-0.5 rounded-full bg-cream-100 text-ink-700/70 border border-cream-300">
                {post.condition === "new" ? t.conditionNew : t.conditionUsed}
              </span>
            )}
          </div>
        </div>
      )}

      {/* QUESTION answers */}
      {post.type === "question" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-700/70">
              {answers.length} {t.answers}
            </h2>
            {isAuthor && !post.is_answered && (
              <button onClick={handleMarkAnswered} className="text-xs text-crimson-500 hover:text-crimson-700 hover:underline font-medium">
                {t.markAnswered}
              </button>
            )}
          </div>

          {answers.map((answer) => (
            <div
              key={answer.id}
              className={`rounded-xl border p-4 ${
                answer.is_best
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-cream-300 bg-white shadow-card"
              }`}
            >
              {answer.is_best && (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mb-1">
                  ✅ {t.bestAnswer}
                </span>
              )}
              <p className="text-sm text-ink-900 leading-relaxed">{answer.content}</p>
              {!answer.is_best && isAuthor && (
                <button onClick={() => handleMarkBest(answer.id)} className="text-xs text-ink-700/50 hover:text-emerald-700 mt-2 font-medium">
                  {t.markBest}
                </button>
              )}
            </div>
          ))}

          <form onSubmit={handleAnswerSubmit} className="space-y-2 pt-1">
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder={t.answerPlaceholder}
              rows={2}
              className={inputClass}
            />
            <button type="submit" className="rounded-xl bg-crimson-500 text-white px-5 py-2.5 text-sm font-bold hover:bg-crimson-700 transition shadow-sm">
              {t.answerBtn}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
