export interface User {
  id: number;
  username: string;
  email?: string;
}

export interface Post {
  id: number;
  content: string;
  image_url?: string | null;
  created_at: string;
  user_id?: number;
  sentiment?: number;
  text_label?: ModerationLabel | null;
  image_label?: ImageModerationLabel | null;
  final_label?: ModerationLabel | null;
  likes_count?: number;
  liked?: boolean;
  username?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export type ToastType = "success" | "error" | "info";

export type ModerationLabel = "clean" | "offensive" | "hate" | "scam";

export type ImageModerationLabel = "non-violence" | "violence";

export type ModerationFilter = "all" | ModerationLabel;
