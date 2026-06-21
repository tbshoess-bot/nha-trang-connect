export type UserType = "tourist" | "expat";
export type PostType = "event" | "question";

export interface Profile {
  id: string;
  full_name: string;
  bio: string | null;
  user_type: UserType;
  interests: string[];
  created_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  type: PostType;
  title: string;
  description: string | null;
  category: string | null;
  event_date: string | null;
  location: string | null;
  created_at: string;
  // join ile gelebilecek alanlar
  author?: Profile;
  participant_count?: number;
  answer_count?: number;
}

export interface EventParticipant {
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Answer {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  is_best: boolean;
  created_at: string;
  author?: Profile;
}

// Supabase generic client tipi için minimal placeholder.
// Gerçek projede `supabase gen types typescript` ile otomatik üretilebilir.
export type Database = any;

export const CATEGORIES = [
  { value: "para", label: "Para / exchange" },
  { value: "alisveris", label: "Alışveriş" },
  { value: "saglik", label: "Sağlık" },
  { value: "ulasim", label: "Ulaşım" },
  { value: "eglence", label: "Eğlence" },
  { value: "diger", label: "Diğer" },
];
