"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { type PostType } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

const POST_TYPES: PostType[] = ["event", "question", "listing", "announcement"];

const TYPE_ICONS: Record<PostType, string> = {
  event: "🗓",
  question: "❓",
  listing: "🏷",
  announcement: "📢",
};

export default function NewPostPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];

  const [type, setType] = useState<PostType>("event");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(t.eventCategories[0].value);
  const [eventDay, setEventDay] = useState("");
  const [eventMonth, setEventMonth] = useState("");
  const [eventYear, setEventYear] = useState("");
  const [eventHour, setEventHour] = useState("");
  const [eventMinute, setEventMinute] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<"new" | "used">("used");
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTypeChange(newType: PostType) {
    setType(newType);
    if (newType === "event") setCategory(t.eventCategories[0].value);
    else if (newType === "question") setCategory(t.categories[0].value);
    else setCategory("");
  }

  async function uploadImages(postId: string): Promise<string[]> {
    const urls: string[] = [];
    for (const file of images) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${postId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("post-images").upload(path, file);
      if (!upErr) {
        const { data } = supabase.storage.from("post-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) { setError(t.mustLogin); return; }

    if (type === "listing" && images.length === 0) {
      setError(lang === "en" ? "Please add at least one photo." : "Добавьте хотя бы одно фото.");
      return;
    }

    setUploading(true);

    const { data, error: insertError } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        type,
        title,
        description: description || null,
        category: category || null,
        event_date: type === "event" && eventDay && eventMonth && eventYear
          ? new Date(`${eventYear}-${eventMonth.padStart(2,"0")}-${eventDay.padStart(2,"0")}T${(eventHour||"12").padStart(2,"0")}:${(eventMinute||"00").padStart(2,"0")}:00`).toISOString()
          : null,
        location: address || null,
        lat: type === "event" ? lat : null,
        lng: type === "event" ? lng : null,
        address: type === "event" ? address || null : null,
        price: type === "listing" ? parseFloat(price) || null : null,
        condition: type === "listing" ? condition : null,
        images: [],
        is_answered: false,
      })
      .select()
      .single();

    if (insertError) { setError(insertError.message); setUploading(false); return; }

    if (type === "listing" && images.length > 0) {
      const imageUrls = await uploadImages(data.id);
      await supabase.from("posts").update({ images: imageUrls }).eq("id", data.id);
    }

    setUploading(false);
    router.push(`/post/${data.id}`);
  }

  const typeLabels: Record<PostType, string> = {
    event: t.typeEvent,
    question: t.typeQuestion,
    listing: t.typeListing,
    announcement: t.typeAnnouncement,
  };

  const titlePlaceholder =
    type === "question" ? t.questionPlaceholder :
    type === "event" ? t.eventTitlePlaceholder :
    type === "listing" ? t.listingTitlePlaceholder :
    t.announcementTitlePlaceholder;

  const inputClass = "w-full mt-1 rounded-xl border border-cream-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500 bg-white";
  const labelClass = "text-sm font-medium text-ink-700/70";

  return (
    <div className="max-w-sm mx-auto py-8">
      <h1 className="text-lg font-bold mb-5">{t.whatToShare}</h1>

      {/* Post type selector */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {POST_TYPES.map((pt) => (
          <button
            key={pt}
            type="button"
            onClick={() => handleTypeChange(pt)}
            className={`rounded-xl border py-2.5 text-sm font-medium transition flex items-center justify-center gap-2 ${
              type === pt
                ? "border-crimson-500 bg-crimson-50 text-crimson-700"
                : "border-cream-300 text-ink-700/70 bg-white hover:border-crimson-200"
            }`}
          >
            <span>{TYPE_ICONS[pt]}</span>
            {typeLabels[pt]}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>
            {type === "question" ? t.questionLabel : type === "event" ? t.eventTitleLabel : t.titleLabel}
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={titlePlaceholder}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>{t.details}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </div>

        {type === "event" && (
          <>
            <div>
              <label className={labelClass}>{t.category}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                {t.eventCategories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t.dateTime}</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <input
                  type="number" min="1" max="31" placeholder={lang === "en" ? "Day" : "День"}
                  value={eventDay} onChange={(e) => setEventDay(e.target.value)} required
                  className="rounded-xl border border-cream-300 px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-crimson-500 bg-white"
                />
                <select
                  value={eventMonth} onChange={(e) => setEventMonth(e.target.value)} required
                  className="rounded-xl border border-cream-300 px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500 bg-white"
                >
                  <option value="">{lang === "en" ? "Month" : "Месяц"}</option>
                  {(lang === "en"
                    ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
                    : ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"]
                  ).map((m, i) => (
                    <option key={i+1} value={String(i+1)}>{m}</option>
                  ))}
                </select>
                <input
                  type="number" min="2024" max="2030" placeholder={lang === "en" ? "Year" : "Год"}
                  value={eventYear} onChange={(e) => setEventYear(e.target.value)} required
                  className="rounded-xl border border-cream-300 px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-crimson-500 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <select
                  value={eventHour} onChange={(e) => setEventHour(e.target.value)}
                  className="rounded-xl border border-cream-300 px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500 bg-white"
                >
                  <option value="">{lang === "en" ? "Hour" : "Час"}</option>
                  {Array.from({length: 24}, (_, i) => (
                    <option key={i} value={String(i)}>{String(i).padStart(2,"0")}:00</option>
                  ))}
                </select>
                <select
                  value={eventMinute} onChange={(e) => setEventMinute(e.target.value)}
                  className="rounded-xl border border-cream-300 px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500 bg-white"
                >
                  <option value="">00 min</option>
                  {["00","15","30","45"].map((m) => (
                    <option key={m} value={m}>{m} min</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={`${labelClass} block mb-1`}>{t.locationLabel}</label>
              <MapPicker
                lat={lat}
                lng={lng}
                address={address}
                onChange={(newLat, newLng, newAddr) => {
                  setLat(newLat);
                  setLng(newLng);
                  setAddress(newAddr);
                }}
              />
            </div>
          </>
        )}

        {type === "question" && (
          <div>
            <label className={labelClass}>{t.category}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              {t.categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        )}

        {type === "listing" && (
          <>
            <div>
              <label className={labelClass}>{t.priceLabel} (USD)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t.conditionLabel}</label>
              <div className="flex gap-2 mt-1">
                {(["new", "used"] as const).map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCondition(c)}
                    className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition ${
                      condition === c
                        ? "border-crimson-500 bg-crimson-50 text-crimson-700"
                        : "border-cream-300 text-ink-700/70 bg-white"
                    }`}
                  >
                    {c === "new" ? t.conditionNew : t.conditionUsed}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>{t.photosLabel}</label>
              <input
                type="file"
                accept="image/*"
                multiple
                required
                onChange={(e) => setImages(Array.from(e.target.files ?? []))}
                className="w-full mt-1 text-sm text-ink-700/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-crimson-50 file:text-crimson-700 file:text-sm cursor-pointer"
              />
              {images.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {images.map((f, i) => (
                    <img
                      key={i}
                      src={URL.createObjectURL(f)}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover border border-cream-300"
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full rounded-xl bg-crimson-500 text-white py-3 text-sm font-bold hover:bg-crimson-700 transition shadow-sm disabled:opacity-50"
        >
          {uploading ? t.uploading : t.postBtn}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
