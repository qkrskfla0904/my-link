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
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  links: LinkItem[];
}
