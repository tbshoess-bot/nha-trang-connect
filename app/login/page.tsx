"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";

export default function LoginPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/profile/setup` },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="max-w-sm mx-auto text-center py-16">
        <div className="text-5xl mb-4">✉️</div>
        <h1 className="text-xl font-bold mb-2">{t.checkEmail}</h1>
        <p className="text-sm text-ink-700/60 leading-relaxed">{t.checkEmailHint(email)}</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto py-12">
      <div className="text-center mb-8">
        <span className="text-4xl">🦁</span>
        <h1 className="text-xl font-bold mt-3 mb-1">{t.signIn}</h1>
        <p className="text-sm text-ink-700/60">
          {lang === "en" ? "Join the Sri Lanka community" : "Присоединяйтесь к сообществу Шри-Ланки"}
        </p>
      </div>
      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          required
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-cream-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-500 bg-white"
        />
        <button
          type="submit"
          className="w-full rounded-xl bg-crimson-500 text-white py-3 text-sm font-bold hover:bg-crimson-700 transition shadow-sm"
        >
          {t.sendLoginLink}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
