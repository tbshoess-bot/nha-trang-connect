"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { translations } from "@/lib/translations";
import type { User } from "@supabase/supabase-js";

const t = translations["en"];

export default function Header() {
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
    <header className="bg-crimson-500 shadow-md sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl leading-none">🦁</span>
          <span className="font-bold text-white tracking-tight text-[15px]">
            Sri Lanka <span className="text-gold-300">Connect</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <div id="google_translate_element" className="shrink-0" />

          {user ? (
            <>
              <Link
                href="/post/new"
                className="px-4 py-1.5 rounded-full bg-gold-400 text-ink-900 font-bold hover:bg-gold-300 transition text-sm shadow-sm"
              >
                + {t.share}
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gold-400 text-ink-900 flex items-center justify-center text-xs font-bold border-2 border-gold-300">
                  {initials}
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-white/60 hover:text-white transition hidden sm:block"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/post/new"
                className="px-4 py-1.5 rounded-full bg-gold-400 text-ink-900 font-bold hover:bg-gold-300 transition text-sm shadow-sm"
              >
                + {t.share}
              </Link>
              <Link href="/login" className="text-white/80 hover:text-white text-sm font-medium">
                {t.login}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
