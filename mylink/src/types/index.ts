export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  category?: string;
  isActive?: boolean;
  clickCount?: number;
  createdAt?: string;
  isPopular?: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  tags?: string[];
  statusMessage?: string;
  isAvailableForHire?: boolean;
  stats?: {
    views: number;
    likes: number;
  };
  links: LinkItem[];
}

export type ThemeAccent = "emerald" | "violet" | "sky" | "rose" | "amber";
