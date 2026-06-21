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
      <div className="max-w-sm mx-auto text-center py-12">
        <h1 className="text-lg font-medium mb-2">{t.checkEmail}</h1>
        <p className="text-sm text-ink-700/70">{t.checkEmailHint(email)}</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto py-12">
      <h1 className="text-lg font-medium mb-4">{t.signIn}</h1>
      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          required
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-sand-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sea-500"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-sea-500 text-white py-2 text-sm font-medium hover:bg-sea-700 transition"
        >
          {t.sendLoginLink}
        </button>
        {error && <p className="text-sm text-sunset-600">{error}</p>}
      </form>
    </div>
  );
}
