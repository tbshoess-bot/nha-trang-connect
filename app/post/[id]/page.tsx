"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Post, Answer } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";

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

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

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
      } else {
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
    if (data) {
      setAnswers((prev) => [...prev, data as Answer]);
      setNewAnswer("");
    }
  }

  async function handleMarkBest(answerId: string) {
    await supabase.from("answers").update({ is_best: true }).eq("id", answerId);
    setAnswers((prev) =>
      prev.map((a) => (a.id === answerId ? { ...a, is_best: true } : { ...a, is_best: false }))
    );
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

  if (loading) return <p className="text-ink-700/60 text-sm">{t.loading}</p>;
  if (!post) return <p className="text-ink-700/60 text-sm">{t.notFound}</p>;

  const isEvent = post.type === "event";
  const isAuthor = currentUserId === post.author_id;
  const locale = lang === "ru" ? "ru-RU" : "en-GB";
  const editLabel = lang === "en" ? "Edit" : "Редактировать";
  const deleteLabel = lang === "en" ? "Delete" : "Удалить";
  const cancelLabel = lang === "en" ? "Cancel" : "Отмена";
  const saveLabel = lang === "en" ? "Save" : "Сохранить";

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-start justify-between gap-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isEvent ? "bg-sunset-400/20 text-sunset-600" : "bg-sea-500/15 text-sea-700"
            }`}
          >
            {isEvent ? t.eventBadge : t.questionBadge}
          </span>
          {isAuthor && !editing && (
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-ink-700/50 hover:text-sea-700 transition"
              >
                {editLabel}
              </button>
              <button
                onClick={handleDelete}
                className="text-xs text-ink-700/50 hover:text-sunset-600 transition"
              >
                {deleteLabel}
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="mt-2 space-y-2">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded-lg border border-sand-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sea-500 font-medium"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-sand-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleEditSave}
                className="px-4 py-1.5 rounded-lg bg-sea-500 text-white text-sm font-medium hover:bg-sea-700 transition"
              >
                {saveLabel}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-1.5 rounded-lg border border-sand-300 text-sm text-ink-700/70 hover:border-sea-500 transition"
              >
                {cancelLabel}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-medium mt-2">{post.title}</h1>
            {post.description && <p className="text-ink-700/80 mt-1">{post.description}</p>}
          </>
        )}
      </div>

      {isEvent ? (
        <div className="rounded-2xl border border-sand-300 bg-white p-4 space-y-3">
          <p className="text-sm text-ink-700/70">
            {post.event_date && new Date(post.event_date).toLocaleString(locale)}
            {post.location && ` · ${post.location}`}
          </p>
          <p className="text-sm text-ink-700/70">{participantCount} {t.peopleAttending}</p>
          <button
            onClick={handleJoin}
            disabled={joined}
            className="rounded-lg bg-sea-500 text-white px-4 py-2 text-sm font-medium hover:bg-sea-700 transition disabled:opacity-50"
          >
            {joined ? t.joined : t.join}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-ink-700/70">{answers.length} {t.answers}</h2>

          {answers.map((answer) => (
            <div
              key={answer.id}
              className={`rounded-xl border p-3 ${
                answer.is_best ? "border-sea-500 bg-sea-50" : "border-sand-300 bg-white"
              }`}
            >
              {answer.is_best && (
                <span className="text-xs font-medium text-sea-700">{t.bestAnswer}</span>
              )}
              <p className="text-sm text-ink-900 mt-1">{answer.content}</p>
              {!answer.is_best && isAuthor && (
                <button
                  onClick={() => handleMarkBest(answer.id)}
                  className="text-xs text-ink-700/50 hover:text-sea-700 mt-2"
                >
                  {t.markBest}
                </button>
              )}
            </div>
          ))}

          <form onSubmit={handleAnswerSubmit} className="space-y-2">
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder={t.answerPlaceholder}
              rows={2}
              className="w-full rounded-lg border border-sand-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-sea-500 text-white px-4 py-2 text-sm font-medium hover:bg-sea-700 transition"
            >
              {t.answerBtn}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
