import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import SearchForm from '../components/SearchForm';
import ResultsTable from '../components/ResultsTable';
import ApiKeyPopup from '../components/ApiKeyPopup';
import { VideoResult } from '../types/video';
import { YouTubeService } from '../services/youtubeService';

const Dashboard: React.FC = () => {
  const [results, setResults] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showApiKeyPopup, setShowApiKeyPopup] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState<any>(null);
  const { getAllApiKeys, user, addNewApiKeys } = useAuth();

  const calculateViewsPerHour = (views: number, publishedAt: string): number => {
    const now = new Date();
    const published = new Date(publishedAt);
    const hoursDiff = Math.max(1, (now.getTime() - published.getTime()) / (1000 * 60 * 60));
    return views / hoursDiff;
  };

  const calculateRPM = (views: number): number => {
    // Estimated RPM based on views (this is a rough estimation)
    if (views < 1000) return 0.5;
    if (views < 10000) return 1.2;
    if (views < 100000) return 2.1;
    if (views < 1000000) return 3.5;
    return 5.2;
  };

  const calculateChannelAge = (channelCreatedAt: string): { display: string; days: number } => {
    const now = new Date();
    const created = new Date(channelCreatedAt);
    const diffInMs = now.getTime() - created.getTime();
    const totalDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (totalDays === 0) {
      return { display: 'Hari Ini', days: 0 };
    } else if (totalDays === 1) {
      return { display: '1 Hari', days: 1 };
    } else if (totalDays < 30) {
      return { display: `${totalDays} Hari`, days: totalDays };
    } else if (totalDays < 365) {
      const months = Math.floor(totalDays / 30);
      const remainingDays = totalDays % 30;
      
      if (months === 1 && remainingDays === 0) {
        return { display: '1 Bulan', days: totalDays };
      } else if (remainingDays === 0) {
        return { display: `${months} Bulan`, days: totalDays };
      } else if (remainingDays === 1) {
        return { display: `${months} Bulan, 1 Hari`, days: totalDays };
      } else {
        return { display: `${months} Bulan, ${remainingDays} Hari`, days: totalDays };
      }
    } else {
      const years = Math.floor(totalDays / 365);
      const remainingDaysAfterYears = totalDays % 365;
      const months = Math.floor(remainingDaysAfterYears / 30);
      const days = remainingDaysAfterYears % 30;
      
      let displayParts = [];
      
      if (years === 1) {
        displayParts.push('1 Tahun');
      } else {
        displayParts.push(`${years}th`);
      }
      
      if (months > 0) {
        displayParts.push(`${months}bl`);
      }
      
      if (days > 0) {
        if (days === 1) {
          displayParts.push('1hr');
        } else {
          displayParts.push(`${days}hr`);
        }
      }
      
      return { 
        display: displayParts.join(', '), 
        days: totalDays 
      };
    }
  };

  // Update API key usage tracking
  const updateApiKeyUsage = (apiKey: string, status: 'success' | 'failed' | 'quota_exceeded' | 'invalid') => {
    const stored = localStorage.getItem('apiKeyHistory');
    let apiKeyData = [];
    
    if (stored) {
      apiKeyData = JSON.parse(stored);
    }
    
    // Find or create API key entry
    let keyEntry = apiKeyData.find((item: any) => item.key === apiKey);
    if (!keyEntry) {
      keyEntry = {
        key: apiKey,
        lastUsed: null,
        status: 'unused',
        usageCount: 0,
        addedAt: new Date().toISOString()
      };
      apiKeyData.push(keyEntry);
    }
    
    // Update usage data
    keyEntry.lastUsed = new Date().toISOString();
    keyEntry.usageCount += 1;
    
    if (status === 'success') {
      keyEntry.status = 'active';
    } else if (status === 'quota_exceeded') {
      keyEntry.status = 'quota_exceeded';
    } else if (status === 'invalid') {
      keyEntry.status = 'invalid';
    } else if (status === 'failed') {
      // Keep current status, just update usage
    }
    
    localStorage.setItem('apiKeyHistory', JSON.stringify(apiKeyData));
  };

  const handleAddApiKeys = async (newApiKeys: string): Promise<void> => {
    if (!user) return;

    // Use the new addNewApiKeys method that preserves working keys
    addNewApiKeys(newApiKeys);

    // If there was a previous search that failed, automatically retry it
    if (lastSearchParams) {
      console.log('🔄 Auto-retrying previous search with new API keys...');
      setTimeout(() => {
        handleSearch(lastSearchParams);
      }, 500); // Small delay to ensure API keys are properly updated
    }
  };

  const handleSearch = async (searchData: {
    keyword: string;
    country: string;
    category: string;
    publishTime: string;
    videoType: string;
  }) => {
    setIsLoading(true);
    setLastSearchParams(searchData); // Store search params for potential retry
    
    // Get all available API keys at the start
    const apiKeys = getAllApiKeys();
    
    if (apiKeys.length === 0) {
      setIsLoading(false);
      setShowApiKeyPopup(true);
      return;
    }
    
    console.log(`🔍 Starting search with ${apiKeys.length} API keys`);
    console.log('📋 Available API keys:', apiKeys.map((key, index) => `${index + 1}. ${key.substring(0, 10)}...`));
    
    try {
      // Add to search history
      if (!searchHistory.includes(searchData.keyword)) {
        setSearchHistory(prev => [searchData.keyword, ...prev.slice(0, 9)]);
      }

      console.log('🔍 Starting YouTube search for 100+ videos...');
      console.log('Search parameters:', searchData);
      
      // Use enhanced search strategy for 100+ results minimum
      // This will silently try API keys in sequence without showing status
      const videos = await YouTubeService.searchVideosEnhanced(
        {
          keyword: searchData.keyword,
          country: searchData.country,
          category: searchData.category,
          publishTime: searchData.publishTime,
          videoType: searchData.videoType,
          maxResults: 50
        },
        apiKeys // Pass all API keys
      );

      if (videos.length === 0) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      console.log(`📊 Found ${videos.length} unique videos, processing data...`);

      // Get video statistics and details (including duration)
      const videoIds = videos.map(v => v.id);
      
      const statsMap = await YouTubeService.getVideoStats(videoIds, apiKeys);
      const detailsMap = await YouTubeService.getVideoDetails(videoIds, apiKeys);

      // Get channel information for age calculation and monetization status
      const channelIds = [...new Set(videos.map(v => v.channelId))]; // Remove duplicates
      const channelMap = await YouTubeService.getChannelInfo(channelIds, apiKeys);

      // Combine video data with statistics, details, and channel info
      let videoResults: VideoResult[] = videos.map(video => {
        const stats = statsMap.get(video.id);
        const details = detailsMap.get(video.id);
        const channelInfo = channelMap.get(video.channelId);
        const views = stats?.viewCount || 0;
        const viewsPerHour = calculateViewsPerHour(views, video.publishedAt);
        
        // Calculate channel age
        let channelAge = { display: 'N/A', days: 0 };
        if (channelInfo) {
          channelAge = calculateChannelAge(channelInfo.publishedAt);
        }
        
        // Determine monetization status using updated algorithm
        const subscriberCount = channelInfo?.subscriberCount || 0;
        const isMonetized = channelInfo ? YouTubeService.determineMonetizationStatus(
          subscriberCount,
          channelAge.days,
          channelInfo.videoCount,
          channelInfo.customUrl,
          channelInfo.totalViewCount
        ) : false;
        
        return {
          id: video.id,
          title: video.title,
          channelTitle: video.channelTitle,
          channelId: video.channelId,
          views: views,
          publishedAt: video.publishedAt,
          viewsPerHour: viewsPerHour,
          thumbnailUrl: video.thumbnailUrl,
          duration: details?.duration || video.duration,
          likeCount: stats?.likeCount || 0,
          commentCount: stats?.commentCount || 0,
          rpm: calculateRPM(views),
          channelAge: channelAge.display,
          channelAgeDays: channelAge.days,
          isMonetized: isMonetized,
          subscriberCount: subscriberCount,
        };
      });

      // Filter by video type based on duration
      if (searchData.videoType === 'short') {
        videoResults = videoResults.filter(video => {
          const duration = video.duration;
          const totalSeconds = parseDuration(duration);
          return totalSeconds <= 60; // 60 seconds or less for shorts
        });
      } else if (searchData.videoType === 'long') {
        videoResults = videoResults.filter(video => {
          const duration = video.duration;
          const totalSeconds = parseDuration(duration);
          return totalSeconds > 60; // More than 60 seconds for long videos
        });
      }
      // For 'all', no filtering needed

      setResults(videoResults);
      setLastSearchParams(null); // Clear stored params on successful search
      console.log(`✅ Search completed: ${videoResults.length} videos found and processed (filtered by ${searchData.videoType})`);

    } catch (error) {
      console.error('❌ Search error:', error);
      
      // Enhanced error handling - check for quota/limit related errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // Remove HTML tags from error message for better detection
        const cleanErrorMessage = errorMessage.replace(/<[^>]*>/g, '');
        
        // Check for quota/limit related errors that should trigger API key popup
        const isQuotaError = cleanErrorMessage.includes('quota') || 
                           cleanErrorMessage.includes('limit') || 
                           cleanErrorMessage.includes('exceeded') ||
                           cleanErrorMessage.includes('semua api key telah dicoba') ||
                           cleanErrorMessage.includes('quota habis') ||
                           cleanErrorMessage.includes('api key tidak valid') ||
                           cleanErrorMessage.includes('dailylimitexceeded') ||
                           cleanErrorMessage.includes('quotaexceeded');
        
        const isInvalidKeyError = cleanErrorMessage.includes('invalid api key') || 
                                cleanErrorMessage.includes('keyinvalid') ||
                                cleanErrorMessage.includes('api key not valid');
        
        // Show popup if quota is exhausted or keys are invalid
        if (isQuotaError || isInvalidKeyError) {
          console.log('🔑 API key quota exhausted or invalid, showing popup for new API keys');
          setShowApiKeyPopup(true);
          
          // Show informative message about what happened
          if (isQuotaError) {
            console.log('📊 API key quota has been exceeded');
          } else if (isInvalidKeyError) {
            console.log('🔑 API key is invalid');
          }
        } else if (cleanErrorMessage.includes('koneksi') || cleanErrorMessage.includes('failed to fetch')) {
          alert('🌐 Masalah koneksi internet.\n\n🔧 Solusi:\n• Periksa koneksi internet Anda\n• Coba refresh halaman\n• Gunakan koneksi yang lebih stabil\n• Disable VPN jika sedang aktif');
        } else {
          alert(`❌ Terjadi kesalahan: ${error.message}\n\n📞 Jika masalah berlanjut, hubungi support dengan detail error ini.`);
        }
      } else {
        alert('❌ Terjadi kesalahan yang tidak diketahui.\n\n🔄 Silakan coba lagi atau hubungi support jika masalah berlanjut.');
      }
      
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to parse ISO 8601 duration to seconds
  const parseDuration = (duration: string): number => {
    // Parse ISO 8601 duration (PT1H2M30S = 1 hour 2 minutes 30 seconds)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (match) {
      const hours = parseInt(match[1] || '0');
      const minutes = parseInt(match[2] || '0');
      const seconds = parseInt(match[3] || '0');
      return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        searchHistory={searchHistory} 
        onAddApiKeys={handleAddApiKeys}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
          <ResultsTable results={results} isLoading={isLoading} />
        </div>
      </main>

      {/* API Key Addition Popup - Only shows when all keys are exhausted */}
      <ApiKeyPopup
        isOpen={showApiKeyPopup}
        onClose={() => setShowApiKeyPopup(false)}
        onAddApiKeys={handleAddApiKeys}
      />
    </div>
  );
};

export default Dashboard;