"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/lib/types";
import PostCard from "@/components/PostCard";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";

export default function FeedPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setPosts(data as Post[]);
      setLoading(false);
    }
    loadFeed();
  }, []);

  if (loading) {
    return <p className="text-ink-700/60 text-sm">{t.loadingFeed}</p>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-700/70">{t.noPosts}</p>
        <p className="text-sm text-ink-700/50 mt-1">{t.noPostsHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
