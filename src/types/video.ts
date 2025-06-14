export interface VideoResult {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  views: number;
  publishedAt: string;
  viewsPerHour: number;
  thumbnailUrl: string;
  duration: string;
  likeCount?: number;
  commentCount?: number;
  rpm: number;
  channelAge?: string; // Display format for channel age
  channelAgeDays?: number; // Actual days for sorting
  isMonetized?: boolean; // Monetization status
  subscriberCount?: number; // Subscriber count for monetization analysis
}

export interface SearchParams {
  keyword: string;
  country: string;
  category: string;
  publishTime: string;
  videoType: string;
}