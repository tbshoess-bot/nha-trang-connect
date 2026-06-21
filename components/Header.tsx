"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const { lang, setLang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "";

  return (
    <header className="border-b border-sand-300 bg-sand-50/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-sea-700 tracking-tight">
          Nha Trang Connect
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <div className="flex gap-1 text-xs">
            <button
              onClick={() => setLang("en")}
              className={`px-2 py-1 rounded transition ${lang === "en" ? "bg-sea-500 text-white" : "text-ink-700/60 hover:text-sea-700"}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("ru")}
              className={`px-2 py-1 rounded transition ${lang === "ru" ? "bg-sea-500 text-white" : "text-ink-700/60 hover:text-sea-700"}`}
            >
              RU
            </button>
          </div>

          {user ? (
            <>
              <Link href="/post/new" className="px-3 py-1.5 rounded-full bg-sea-500 text-white hover:bg-sea-700 transition">
                {t.share}
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sea-500 text-white flex items-center justify-center text-xs font-semibold">
                  {initials}
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-ink-700/60 hover:text-sunset-600 transition"
                >
                  {lang === "en" ? "Sign out" : "Выйти"}
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/post/new" className="px-3 py-1.5 rounded-full bg-sea-500 text-white hover:bg-sea-700 transition">
                {t.share}
              </Link>
              <Link href="/login" className="text-ink-700 hover:text-sea-700">
                {t.login}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
