"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { type PostType } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";

export default function NewPostPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];
  const [type, setType] = useState<PostType>("question");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(t.categories[0].value);
  const currentCategories = type === "event" ? t.eventCategories : t.categories;
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setError(t.mustLogin);
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        type,
        title,
        description,
        category,
        event_date: type === "event" ? eventDate : null,
        location: type === "event" ? location : null,
      })
      .select()
      .single();

    if (error) setError(error.message);
    else router.push(`/post/${data.id}`);
  }

  return (
    <div className="max-w-sm mx-auto py-8">
      <h1 className="text-lg font-medium mb-4">{t.whatToShare}</h1>

      <div className="flex gap-2 mb-5">
        {(["question", "event"] as PostType[]).map((pt) => (
          <button
            key={pt}
            type="button"
            onClick={() => { setType(pt); setCategory(pt === "event" ? t.eventCategories[0].value : t.categories[0].value); }}
            className={`flex-1 rounded-lg border py-2 text-sm transition ${
              type === pt ? "border-sea-500 bg-sea-500/10 text-sea-700" : "border-sand-300 text-ink-700/70"
            }`}
          >
            {pt === "question" ? t.askQuestion : t.createEvent}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-ink-700/70">
            {type === "question" ? t.questionLabel : t.eventTitleLabel}
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === "question" ? t.questionPlaceholder : t.eventTitlePlaceholder}
            className="w-full mt-1 rounded-lg border border-sand-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
          />
        </div>

        <div>
          <label className="text-sm text-ink-700/70">{t.details}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full mt-1 rounded-lg border border-sand-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
          />
        </div>

        <div>
          <label className="text-sm text-ink-700/70">{t.category}</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full mt-1 rounded-lg border border-sand-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
          >
            {currentCategories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {type === "event" && (
          <>
            <div>
              <label className="text-sm text-ink-700/70">{t.dateTime}</label>
              <input
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full mt-1 rounded-lg border border-sand-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
              />
            </div>
            <div>
              <label className="text-sm text-ink-700/70">{t.location}</label>
              <input
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t.locationPlaceholder}
                className="w-full mt-1 rounded-lg border border-sand-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-sea-500 text-white py-2 text-sm font-medium hover:bg-sea-700 transition"
        >
          {t.postBtn}
        </button>
        {error && <p className="text-sm text-sunset-600">{error}</p>}
      </form>
    </div>
  );
}
