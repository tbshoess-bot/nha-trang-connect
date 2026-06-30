"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { UserType } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [userType, setUserType] = useState<UserType>("tourist");
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setError(t.mustLogin);
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      bio,
      user_type: userType,
      interests,
    });

    if (error) setError(error.message);
    else router.push("/");
  }

  return (
    <div className="max-w-sm mx-auto py-8">
      <div className="text-center mb-6">
        <span className="text-3xl">👋</span>
        <h1 className="text-lg font-bold mt-2">{t.setupProfile}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-ink-700/70">{t.nameLabel}</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full mt-1 rounded-xl border border-cream-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500 bg-white"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink-700/70">{t.bioLabel}</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className="w-full mt-1 rounded-xl border border-cream-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500 bg-white"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink-700/70">{t.whoAreYou}</label>
          <div className="flex gap-2 mt-1">
            {(["tourist", "expat"] as UserType[]).map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setUserType(type)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition ${
                  userType === type
                    ? "border-crimson-500 bg-crimson-50 text-crimson-700"
                    : "border-cream-300 text-ink-700/70 bg-white hover:border-crimson-200"
                }`}
              >
                {type === "tourist" ? t.tourist : t.expat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink-700/70">{t.interests}</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {t.interestOptions.map((interest) => (
              <button
                type="button"
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1 rounded-full text-sm border font-medium transition ${
                  interests.includes(interest)
                    ? "border-crimson-500 bg-crimson-50 text-crimson-700"
                    : "border-cream-300 text-ink-700/70 bg-white hover:border-crimson-200"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-crimson-500 text-white py-3 text-sm font-bold hover:bg-crimson-700 transition shadow-sm"
        >
          {t.saveAndGo}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
