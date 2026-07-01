export type UserType = "tourist" | "expat";
export type PostType = "event" | "question" | "listing" | "announcement";
export type ListingType = "item" | "service";

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
  lat: number | null;
  lng: number | null;
  address: string | null;
  price: number | null;
  condition: "new" | "used" | null;
  images: string[];
  is_answered: boolean;
  listing_type: ListingType | null;
  contact_phone: string | null;
  website: string | null;
  created_at: string;
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

export type Database = any;
