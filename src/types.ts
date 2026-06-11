export interface VideoItem {
  id: string;
  title: string;
  channelName: string;
  channelLogo: string;
  views: string;
  timeAgo: string;
  duration: string;
  thumbnailUrl: string;
  category: 'movies' | 'gaming' | 'software' | 'viral' | 'custom';
}

export type ThemeType = 'youtube' | 'torrent' | 'netflix';
export type RedirectType = 'global' | 'button_only';

export interface AdminSettings {
  adUrl: string;
  redirectType: RedirectType;
  selectedTheme: ThemeType;
  pageTitle: string;
  selectedCategory: 'movies' | 'gaming' | 'software' | 'viral' | 'custom';
}
