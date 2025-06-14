import { useAuth } from '../contexts/AuthContext';

export interface YouTubeSearchParams {
  keyword: string;
  country: string;
  category: string;
  publishTime: string;
  videoType: string;
  maxResults?: number;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration: string;
}

export interface YouTubeVideoStats {
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

export interface YouTubeVideoDetails {
  duration: string;
  definition: string;
  caption: string;
}

export interface YouTubeChannelInfo {
  publishedAt: string;
  subscriberCount: number;
  videoCount: number;
  customUrl?: string;
  country?: string;
  totalViewCount?: number;
}

export class YouTubeService {
  private static readonly BASE_URL = 'https://www.googleapis.com/youtube/v3';
  
  // Silent sequential API key testing - no status popups
  static async searchVideos(
    params: YouTubeSearchParams,
    apiKeys: string[]
  ): Promise<YouTubeVideo[]> {
    console.log(`🔍 Starting search with ${apiKeys.length} API keys available`);
    
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      console.log(`🔑 Trying API key ${i + 1}/${apiKeys.length}: ${apiKey.substring(0, 10)}...`);
      
      try {
        const searchUrl = new URL(`${this.BASE_URL}/search`);
        searchUrl.searchParams.append('part', 'snippet');
        searchUrl.searchParams.append('q', params.keyword);
        searchUrl.searchParams.append('type', 'video');
        searchUrl.searchParams.append('regionCode', params.country);
        searchUrl.searchParams.append('maxResults', (params.maxResults || 50).toString());
        searchUrl.searchParams.append('order', this.getSortOrder(params.publishTime));
        searchUrl.searchParams.append('key', apiKey);

        // Add category filter if not 'all'
        if (params.category !== 'all') {
          searchUrl.searchParams.append('videoCategoryId', params.category);
        }

        // Add date filter if needed
        const publishedAfter = this.getPublishedAfterDate(params.publishTime);
        if (publishedAfter) {
          searchUrl.searchParams.append('publishedAfter', publishedAfter);
        }

        // Add video duration filter for YouTube Shorts
        if (params.videoType === 'short') {
          searchUrl.searchParams.append('videoDuration', 'short'); // Videos less than 4 minutes
        } else if (params.videoType === 'long') {
          searchUrl.searchParams.append('videoDuration', 'medium'); // Videos between 4-20 minutes
          // Note: YouTube API doesn't have a perfect filter for >60 seconds, so we'll filter client-side
        }

        console.log(`🌐 Making request to YouTube API...`);
        const response = await fetch(searchUrl.toString());
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          if (response.status === 403) {
            const error = errorData.error?.errors?.[0];
            if (error?.reason === 'quotaExceeded' || error?.reason === 'dailyLimitExceeded') {
              console.warn(`❌ API key ${i + 1} quota exceeded: ${apiKey.substring(0, 10)}...`);
              // Only show notification if this is the last API key
              if (i === apiKeys.length - 1) {
                console.warn('🚨 All API keys exhausted - will trigger popup');
              }
              continue; // Try next API key
            } else if (error?.reason === 'keyInvalid') {
              console.warn(`❌ API key ${i + 1} is invalid: ${apiKey.substring(0, 10)}...`);
              // Only show notification if this is the last API key
              if (i === apiKeys.length - 1) {
                console.warn('🚨 All API keys invalid - will trigger popup');
              }
              continue; // Try next API key
            } else {
              console.error(`❌ API key ${i + 1} access denied: ${error?.message || 'Access denied'}`);
              continue; // Try next API key
            }
          } else {
            console.error(`❌ API key ${i + 1} HTTP error: ${response.status} ${response.statusText}`);
            continue; // Try next API key
          }
        }

        // Success!
        const data = await response.json();
        console.log(`✅ Success with API key ${i + 1}: ${data.items?.length || 0} videos found`);
        
        return data.items?.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          channelId: item.snippet.channelId,
          publishedAt: item.snippet.publishedAt,
          thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
          duration: 'PT0S' // Will be updated by getVideoStats if needed
        })) || [];

      } catch (error) {
        console.error(`❌ Network/fetch error with API key ${i + 1}:`, error);
        
        // For network errors, don't continue - it might affect all keys
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          throw new Error('Koneksi internet bermasalah atau YouTube API tidak dapat diakses');
        }
        
        // For other errors, try next key
        continue;
      }
    }

    // If we get here, all API keys failed
    throw new Error('Semua API key telah dicoba dan gagal - quota habis atau API key tidak valid');
  }

  // Enhanced search to get more results by trying multiple searches - TARGET: 100+ videos minimum
  static async searchVideosEnhanced(
    params: YouTubeSearchParams,
    apiKeys: string[]
  ): Promise<YouTubeVideo[]> {
    console.log('🔍 Starting enhanced search for 100+ results...');
    
    const allVideos: YouTubeVideo[] = [];
    const seenVideoIds = new Set<string>();
    
    // Strategy 1: Original search with maxResults=50
    try {
      const originalParams = { ...params, maxResults: 50 };
      const originalResults = await this.searchVideos(originalParams, apiKeys);
      for (const video of originalResults) {
        if (!seenVideoIds.has(video.id)) {
          seenVideoIds.add(video.id);
          allVideos.push(video);
        }
      }
      console.log(`✅ Original search: ${originalResults.length} videos, ${allVideos.length} unique total`);
    } catch (error) {
      console.error('❌ Original search failed:', error);
      // Re-throw API key related errors to trigger popup
      if (error instanceof Error && (
        error.message.includes('Semua API key telah dicoba') ||
        error.message.includes('quota habis') ||
        error.message.includes('API key tidak valid')
      )) {
        throw error;
      }
    }

    // Strategy 2: Try different sort orders with maxResults=50 each
    const sortOrders = ['date', 'viewCount', 'relevance', 'rating'];
    for (const order of sortOrders) {
      if (allVideos.length >= 200) break; // Stop if we already have enough
      
      try {
        const searchUrl = new URL(`${this.BASE_URL}/search`);
        
        // Try with first available API key
        const apiKey = apiKeys[0];
        if (!apiKey) {
          console.warn('⚠️ No API keys available for sort order search');
          throw new Error('Semua API key telah dicoba dan gagal - quota habis atau API key tidak valid');
        }

        searchUrl.searchParams.append('part', 'snippet');
        searchUrl.searchParams.append('q', params.keyword);
        searchUrl.searchParams.append('type', 'video');
        searchUrl.searchParams.append('regionCode', params.country);
        searchUrl.searchParams.append('maxResults', '50');
        searchUrl.searchParams.append('order', order);
        searchUrl.searchParams.append('key', apiKey);

        if (params.category !== 'all') {
          searchUrl.searchParams.append('videoCategoryId', params.category);
        }

        const publishedAfter = this.getPublishedAfterDate(params.publishTime);
        if (publishedAfter) {
          searchUrl.searchParams.append('publishedAfter', publishedAfter);
        }

        const response = await fetch(searchUrl.toString());
        if (response.ok) {
          const data = await response.json();
          const videos = data.items?.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            channelTitle: item.snippet.channelTitle,
            channelId: item.snippet.channelId,
            publishedAt: item.snippet.publishedAt,
            thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
            duration: 'PT0S'
          })) || [];

          let newVideos = 0;
          for (const video of videos) {
            if (!seenVideoIds.has(video.id)) {
              seenVideoIds.add(video.id);
              allVideos.push(video);
              newVideos++;
            }
          }
          console.log(`✅ Sort by ${order}: ${videos.length} videos, ${newVideos} new, ${allVideos.length} total`);
        } else if (response.status === 403) {
          // API key quota exceeded, but continue with other strategies
          console.warn(`⚠️ API key quota exceeded during sort search`);
        }
      } catch (error) {
        console.error(`❌ Search with ${order} sort failed:`, error);
        // Continue with other strategies
      }
    }

    // Strategy 3: Try with keyword variations if still under 100
    if (allVideos.length < 100) {
      const keywordVariations = this.generateKeywordVariations(params.keyword);
      
      for (const keyword of keywordVariations) {
        if (allVideos.length >= 200) break;
        
        try {
          const variantParams = { ...params, keyword: keyword, maxResults: 50 };
          const variantResults = await this.searchVideos(variantParams, apiKeys);
          
          let newVideos = 0;
          for (const video of variantResults) {
            if (!seenVideoIds.has(video.id)) {
              seenVideoIds.add(video.id);
              allVideos.push(video);
              newVideos++;
            }
          }
          console.log(`✅ Keyword "${keyword}": ${variantResults.length} videos, ${newVideos} new, ${allVideos.length} total`);
        } catch (error) {
          console.error(`❌ Search with keyword "${keyword}" failed:`, error);
          // Re-throw API key related errors to trigger popup
          if (error instanceof Error && (
            error.message.includes('Semua API key telah dicoba') ||
            error.message.includes('quota habis') ||
            error.message.includes('API key tidak valid')
          )) {
            throw error;
          }
        }
      }
    }

    console.log(`🏁 Enhanced search completed: ${allVideos.length} unique videos found`);
    
    return allVideos;
  }

  // Generate more comprehensive keyword variations
  private static generateKeywordVariations(originalKeyword: string): string[] {
    const variations = [];
    
    // Enhanced prefixes and suffixes
    const prefixes = ['cara', 'tutorial', 'tips', 'belajar', 'panduan', 'rahasia', 'trik', 'strategi'];
    const suffixes = ['terbaru', 'mudah', 'lengkap', '2024', '2025', 'pemula', 'gratis', 'terbaik'];
    
    // Add variations with prefixes
    for (const prefix of prefixes) {
      if (!originalKeyword.toLowerCase().includes(prefix.toLowerCase())) {
        variations.push(`${prefix} ${originalKeyword}`);
      }
    }
    
    // Add variations with suffixes
    for (const suffix of suffixes) {
      if (!originalKeyword.toLowerCase().includes(suffix.toLowerCase())) {
        variations.push(`${originalKeyword} ${suffix}`);
      }
    }
    
    // Add English variations if keyword is in Indonesian
    const englishTranslations: { [key: string]: string } = {
      'cara': 'how to',
      'tutorial': 'tutorial',
      'tips': 'tips',
      'belajar': 'learn',
      'masak': 'cooking',
      'edit': 'edit',
      'video': 'video',
      'foto': 'photo',
      'bisnis': 'business',
      'online': 'online'
    };
    
    for (const [indo, eng] of Object.entries(englishTranslations)) {
      if (originalKeyword.toLowerCase().includes(indo)) {
        const englishVariant = originalKeyword.toLowerCase().replace(indo, eng);
        variations.push(englishVariant);
      }
    }
    
    // Limit to 8 variations to avoid too many API calls
    return variations.slice(0, 8);
  }

  static async getVideoStats(
    videoIds: string[],
    apiKeys: string[]
  ): Promise<Map<string, YouTubeVideoStats>> {
    // Process in batches of 50 (YouTube API limit)
    const batchSize = 50;
    const allStats = new Map<string, YouTubeVideoStats>();
    
    for (let i = 0; i < videoIds.length; i += batchSize) {
      const batch = videoIds.slice(i, i + batchSize);
      
      // Try each API key until one works
      for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
        const apiKey = apiKeys[keyIndex];
        
        try {
          const statsUrl = new URL(`${this.BASE_URL}/videos`);
          statsUrl.searchParams.append('part', 'statistics');
          statsUrl.searchParams.append('id', batch.join(','));
          statsUrl.searchParams.append('key', apiKey);

          const response = await fetch(statsUrl.toString());
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            if (response.status === 403) {
              const error = errorData.error?.errors?.[0];
              if (error?.reason === 'quotaExceeded' || error?.reason === 'dailyLimitExceeded' || error?.reason === 'keyInvalid') {
                continue; // Try next API key
              }
            }
            
            throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          
          data.items?.forEach((item: any) => {
            allStats.set(item.id, {
              viewCount: parseInt(item.statistics.viewCount || '0'),
              likeCount: parseInt(item.statistics.likeCount || '0'),
              commentCount: parseInt(item.statistics.commentCount || '0')
            });
          });

          break; // Success, move to next batch

        } catch (error) {
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw new Error('Koneksi internet bermasalah atau YouTube API tidak dapat diakses');
          }
          
          // Continue to try next API key
        }
      }
    }

    return allStats;
  }

  static async getVideoDetails(
    videoIds: string[],
    apiKeys: string[]
  ): Promise<Map<string, YouTubeVideoDetails>> {
    // Process in batches of 50 (YouTube API limit)
    const batchSize = 50;
    const allDetails = new Map<string, YouTubeVideoDetails>();
    
    for (let i = 0; i < videoIds.length; i += batchSize) {
      const batch = videoIds.slice(i, i + batchSize);
      
      // Try each API key until one works
      for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
        const apiKey = apiKeys[keyIndex];
        
        try {
          const detailsUrl = new URL(`${this.BASE_URL}/videos`);
          detailsUrl.searchParams.append('part', 'contentDetails');
          detailsUrl.searchParams.append('id', batch.join(','));
          detailsUrl.searchParams.append('key', apiKey);

          const response = await fetch(detailsUrl.toString());
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            if (response.status === 403) {
              const error = errorData.error?.errors?.[0];
              if (error?.reason === 'quotaExceeded' || error?.reason === 'dailyLimitExceeded' || error?.reason === 'keyInvalid') {
                continue; // Try next API key
              }
            }
            
            throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          
          data.items?.forEach((item: any) => {
            allDetails.set(item.id, {
              duration: item.contentDetails.duration,
              definition: item.contentDetails.definition,
              caption: item.contentDetails.caption
            });
          });

          break; // Success, move to next batch

        } catch (error) {
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw new Error('Koneksi internet bermasalah atau YouTube API tidak dapat diakses');
          }
          
          // Continue to try next API key
        }
      }
    }

    return allDetails;
  }

  static async getChannelInfo(
    channelIds: string[],
    apiKeys: string[]
  ): Promise<Map<string, YouTubeChannelInfo>> {
    // Process in batches of 50 (YouTube API limit)
    const batchSize = 50;
    const allChannels = new Map<string, YouTubeChannelInfo>();
    
    // Remove duplicates
    const uniqueChannelIds = [...new Set(channelIds)];
    
    for (let i = 0; i < uniqueChannelIds.length; i += batchSize) {
      const batch = uniqueChannelIds.slice(i, i + batchSize);
      
      // Try each API key until one works
      for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
        const apiKey = apiKeys[keyIndex];
        
        try {
          const channelUrl = new URL(`${this.BASE_URL}/channels`);
          channelUrl.searchParams.append('part', 'snippet,statistics');
          channelUrl.searchParams.append('id', batch.join(','));
          channelUrl.searchParams.append('key', apiKey);

          const response = await fetch(channelUrl.toString());
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            if (response.status === 403) {
              const error = errorData.error?.errors?.[0];
              if (error?.reason === 'quotaExceeded' || error?.reason === 'dailyLimitExceeded' || error?.reason === 'keyInvalid') {
                continue; // Try next API key
              }
            }
            
            throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          
          data.items?.forEach((item: any) => {
            allChannels.set(item.id, {
              publishedAt: item.snippet.publishedAt,
              subscriberCount: parseInt(item.statistics.subscriberCount || '0'),
              videoCount: parseInt(item.statistics.videoCount || '0'),
              customUrl: item.snippet.customUrl,
              country: item.snippet.country,
              totalViewCount: parseInt(item.statistics.viewCount || '0')
            });
          });

          break; // Success, move to next batch

        } catch (error) {
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw new Error('Koneksi internet bermasalah atau YouTube API tidak dapat diakses');
          }
          
          // Continue to try next API key
        }
      }
    }

    return allChannels;
  }

  // Updated monetization detection algorithm based on YouTube Partner Program requirements
  static determineMonetizationStatus(
    subscriberCount: number,
    channelAgeDays: number,
    videoCount: number,
    customUrl?: string,
    totalViewCount?: number
  ): boolean {
    // YouTube Partner Program requirements (updated 2024):
    // ✅ 1,000+ subscribers (minimum requirement)
    // ✅ Channel age 5+ days (minimum requirement) 
    // ✅ 1+ video uploaded (minimum activity)
    // ✅ 4,000+ watch hours in past 12 months (estimated from total views)
    // ✅ Community features like membership/super thanks (indicated by custom URL)
    
    // Basic requirements check
    const hasMinSubscribers = subscriberCount >= 1000;
    const isChannelOldEnough = channelAgeDays >= 5; // Minimum 5 days as per YPP
    const hasMinVideos = videoCount >= 1; // At least 1 video
    
    // Estimate watch hours from total views (rough calculation)
    // Assume average video length of 8 minutes and 70% completion rate
    const estimatedWatchHours = totalViewCount ? (totalViewCount * 8 * 0.7) / 60 : 0;
    const hasMinWatchHours = estimatedWatchHours >= 4000;
    
    // Additional indicators of established channel
    const hasCustomUrl = !!customUrl; // Often indicates channel has community features
    const isEstablishedChannel = subscriberCount >= 10000 || channelAgeDays >= 365;
    
    // Strong indicators of monetization
    const strongIndicators = subscriberCount >= 50000 || 
                           (subscriberCount >= 5000 && channelAgeDays >= 180);
    
    // Calculate monetization probability
    let score = 0;
    
    // Core requirements (60% weight)
    if (hasMinSubscribers) score += 25;
    if (isChannelOldEnough) score += 10;
    if (hasMinVideos) score += 5;
    if (hasMinWatchHours) score += 20;
    
    // Additional factors (40% weight)
    if (hasCustomUrl) score += 15;
    if (isEstablishedChannel) score += 15;
    if (strongIndicators) score += 10;
    
    // Bonus for very active channels
    if (videoCount >= 50) score += 5;
    if (subscriberCount >= 100000) score += 10;
    
    const isLikelyMonetized = score >= 70; // 70% threshold for monetization
    
    return isLikelyMonetized;
  }

  private static getSortOrder(publishTime: string): string {
    switch (publishTime) {
      case 'hour':
      case 'today':
      case 'week':
      case 'month':
        return 'date';
      default:
        return 'relevance';
    }
  }

  private static getPublishedAfterDate(publishTime: string): string | null {
    const now = new Date();
    
    switch (publishTime) {
      case 'hour':
        const oneHourAgo = new Date(now);
        oneHourAgo.setHours(now.getHours() - 1);
        return oneHourAgo.toISOString();
      
      case 'today':
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        return today.toISOString();
      
      case 'week':
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        return sevenDaysAgo.toISOString();
      
      case 'month':
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return thirtyDaysAgo.toISOString();
      
      default:
        return null;
    }
  }
}