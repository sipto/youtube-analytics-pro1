import React, { useState } from 'react';
import { VideoResult } from '../types/video';
import { 
  Play, 
  ExternalLink, 
  Download, 
  Eye, 
  Clock, 
  Calendar,
  Heart,
  MessageCircle,
  DollarSign,
  Youtube,
  TrendingUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info,
  Users,
  CheckCircle,
  XCircle,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ResultsTableProps {
  results: VideoResult[];
  isLoading: boolean;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results, isLoading }) => {
  const [sortField, setSortField] = useState<keyof VideoResult>('views');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatViewsPerHour = (viewsPerHour: number) => {
    if (viewsPerHour >= 1000) {
      return `${(viewsPerHour / 1000).toFixed(1)}K/jam`;
    }
    return `${Math.round(viewsPerHour)}/jam`;
  };

  const formatUploadDateTime = (publishedAt: string) => {
    const date = new Date(publishedAt);
    
    // Calculate GMT+7 (WIB)
    const gmtOffset = 7;
    const localDate = new Date(date.getTime() + (gmtOffset * 60 * 60 * 1000));
    
    // Format: DD/MM/YYYY HH:MM
    const formattedDate = localDate.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    });
    
    return formattedDate + ' WIB';
  };

  const getMonetizationDisplay = (isMonetized: boolean | undefined, subscriberCount: number | undefined) => {
    if (isMonetized === undefined) {
      return {
        icon: <Shield className="w-3 h-3 text-gray-400" />,
        text: 'N/A',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        tooltip: 'Data monetisasi tidak tersedia'
      };
    }
    
    if (isMonetized) {
      return {
        icon: <CheckCircle className="w-3 h-3 text-green-600" />,
        text: 'Monetized',
        color: 'text-green-700 dark:text-green-300',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        tooltip: `Channel kemungkinan sudah dimonetisasi berdasarkan analisis:\n• ${formatViews(subscriberCount || 0)} subscriber\n• Memenuhi syarat YouTube Partner Program\n• Estimasi jam tayang mencukupi\n• Channel established dengan aktivitas konsisten`
      };
    } else {
      const subCount = subscriberCount || 0;
      let reason = '';
      if (subCount < 1000) {
        reason = `Subscriber kurang dari 1,000 (${formatViews(subCount)})`;
      } else {
        reason = 'Belum memenuhi syarat lainnya (jam tayang/aktivitas)';
      }
      
      return {
        icon: <XCircle className="w-3 h-3 text-red-500" />,
        text: 'Not Monetized',
        color: 'text-red-700 dark:text-red-300',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        tooltip: `Channel belum memenuhi syarat monetisasi:\n• ${reason}\n• Perlu memenuhi semua syarat YouTube Partner Program`
      };
    }
  };

  const getRowColor = (video: VideoResult) => {
    const publishedAt = new Date(video.publishedAt);
    const now = new Date();
    const daysAgo = Math.floor((now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24));

    if (video.viewsPerHour > 10000) {
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    } else if (daysAgo > 30) {
      return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
    }
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  const exportToCsv = () => {
    const headers = ['Judul Video', 'Channel', 'Views', 'Subscriber', 'Usia Channel', 'Usia Channel (Hari)', 'Status Monetisasi', 'View per Jam', 'Likes', 'Komentar', 'RPM', 'Upload'];
    const csvContent = [
      headers.join(','),
      ...results.map(video => {
        const uploadDateTime = formatUploadDateTime(video.publishedAt);
        const monetizationStatus = video.isMonetized ? 'Monetized' : 'Not Monetized';
        return [
          `"${video.title}"`,
          `"${video.channelTitle}"`,
          video.views,
          video.subscriberCount || 0,
          `"${video.channelAge || 'N/A'}"`,
          video.channelAgeDays || 0,
          `"${monetizationStatus}"`,
          video.viewsPerHour,
          video.likeCount || 0,
          video.commentCount || 0,
          video.rpm,
          `"${uploadDateTime}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `youtube-research-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSort = (field: keyof VideoResult) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (field: keyof VideoResult) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-green-600" />
      : <ArrowDown className="w-4 h-4 text-green-600" />;
  };

  const sortedResults = [...results].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Special handling for channel age sorting - use actual days
    if (sortField === 'channelAge') {
      aValue = a.channelAgeDays || 0;
      bValue = b.channelAgeDays || 0;
    }
    
    // Special handling for monetization status
    if (sortField === 'isMonetized') {
      aValue = a.isMonetized ? 1 : 0;
      bValue = b.isMonetized ? 1 : 0;
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return sortDirection === 'asc' 
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResults = sortedResults.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    document.querySelector('.results-table')?.scrollIntoView({ behavior: 'smooth' });
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Mencari video YouTube...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
        <div className="text-center">
          <Youtube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Belum Ada Hasil Pencarian
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Masukkan keyword dan klik tombol cari untuk melihat hasil analisis video YouTube.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 results-table">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Hasil Analisis Video ({results.length})
              </h3>
              {totalPages > 1 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  - Halaman {currentPage} dari {totalPages}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Urutkan:</span>
                <select
                  value={`${sortField}-${sortDirection}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-') as [keyof VideoResult, 'asc' | 'desc'];
                    setSortField(field);
                    setSortDirection(direction);
                    setCurrentPage(1); // Reset to first page when sorting
                  }}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="viewsPerHour-desc">View per Jam (Tertinggi)</option>
                  <option value="viewsPerHour-asc">View per Jam (Terendah)</option>
                  <option value="views-desc">View Terbanyak</option>
                  <option value="views-asc">View Paling Sedikit</option>
                  <option value="subscriberCount-desc">Subscriber Terbanyak</option>
                  <option value="subscriberCount-asc">Subscriber Paling Sedikit</option>
                  <option value="channelAge-asc">Channel Termuda</option>
                  <option value="channelAge-desc">Channel Tertua</option>
                  <option value="isMonetized-desc">Channel Monetized</option>
                  <option value="isMonetized-asc">Channel Non-Monetized</option>
                  <option value="likeCount-desc">Like Terbanyak</option>
                  <option value="commentCount-desc">Komentar Terbanyak</option>
                  <option value="rpm-desc">RPM Tertinggi</option>
                  <option value="publishedAt-desc">Upload Terbaru</option>
                  <option value="publishedAt-asc">Upload Terlama</option>
                </select>
              </div>
              <button
                onClick={exportToCsv}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table with reduced video column width */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {/* Video - Further reduced width from w-80 to w-56 */}
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-56">
                  Video
                </th>
                {/* Views - Medium width */}
                <th 
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-20"
                  onClick={() => handleSort('views')}
                >
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>Views</span>
                    {getSortIcon('views')}
                  </div>
                </th>
                {/* Subscribers - Medium width */}
                <th 
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-20"
                  onClick={() => handleSort('subscriberCount')}
                >
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>Subs</span>
                    {getSortIcon('subscriberCount')}
                  </div>
                </th>
                {/* Channel Age - Medium width */}
                <th 
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-24"
                  onClick={() => handleSort('channelAge')}
                >
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Usia</span>
                    {getSortIcon('channelAge')}
                  </div>
                </th>
                {/* Monetization - Medium width */}
                <th 
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-28"
                  onClick={() => handleSort('isMonetized')}
                >
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Monetisasi</span>
                    {getSortIcon('isMonetized')}
                  </div>
                </th>
                {/* Views per Hour - Medium width */}
                <th 
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-20"
                  onClick={() => handleSort('viewsPerHour')}
                >
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>View/Jam</span>
                    {getSortIcon('viewsPerHour')}
                  </div>
                </th>
                {/* Likes - Narrow width */}
                <th 
                  className="px-1 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-16"
                  onClick={() => handleSort('likeCount')}
                >
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>Like</span>
                    {getSortIcon('likeCount')}
                  </div>
                </th>
                {/* Comments - Narrow width */}
                <th 
                  className="px-1 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-16"
                  onClick={() => handleSort('commentCount')}
                >
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>Komen</span>
                    {getSortIcon('commentCount')}
                  </div>
                </th>
                {/* RPM - Narrow width */}
                <th 
                  className="px-1 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-16"
                  onClick={() => handleSort('rpm')}
                >
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-3 h-3" />
                    <span>RPM</span>
                    {getSortIcon('rpm')}
                  </div>
                </th>
                {/* Upload Date - Medium width */}
                <th 
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-32"
                  onClick={() => handleSort('publishedAt')}
                >
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Upload</span>
                    {getSortIcon('publishedAt')}
                  </div>
                </th>
                {/* Actions - Increased width for better visibility */}
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentResults.map((video) => {
                const uploadDateTime = formatUploadDateTime(video.publishedAt);
                const monetization = getMonetizationDisplay(video.isMonetized, video.subscriberCount);
                
                return (
                  <tr 
                    key={video.id} 
                    className={`${getRowColor(video)} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200`}
                  >
                    {/* Video - Reduced padding and smaller thumbnail */}
                    <td className="px-3 py-3">
                      <div className="flex items-start space-x-2">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-14 h-9 object-cover rounded-lg shadow-sm flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                            {video.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {video.channelTitle}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Views */}
                    <td className="px-2 py-3 text-xs text-gray-900 dark:text-white">
                      <div className="font-medium">{formatViews(video.views)}</div>
                    </td>
                    {/* Subscribers */}
                    <td className="px-2 py-3 text-xs text-gray-900 dark:text-white">
                      <div className="font-medium">{formatViews(video.subscriberCount || 0)}</div>
                    </td>
                    {/* Channel Age */}
                    <td className="px-2 py-3 text-xs text-gray-900 dark:text-white">
                      <div className="font-medium" title={`${video.channelAgeDays || 0} hari`}>
                        {video.channelAge || 'N/A'}
                      </div>
                    </td>
                    {/* Monetization Status */}
                    <td className="px-2 py-3 text-xs">
                      <div 
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${monetization.bgColor} ${monetization.color}`}
                        title={monetization.tooltip}
                      >
                        {monetization.icon}
                        <span className="hidden lg:inline">{monetization.text}</span>
                        <span className="lg:hidden">{video.isMonetized ? '✓' : '✗'}</span>
                      </div>
                    </td>
                    {/* Views per Hour */}
                    <td className="px-2 py-3 text-xs">
                      <div className={`font-medium ${
                        video.viewsPerHour > 10000 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {formatViewsPerHour(video.viewsPerHour)}
                      </div>
                    </td>
                    {/* Likes - Compact */}
                    <td className="px-1 py-3 text-xs text-gray-900 dark:text-white">
                      <div className="font-medium">{formatViews(video.likeCount || 0)}</div>
                    </td>
                    {/* Comments - Compact */}
                    <td className="px-1 py-3 text-xs text-gray-900 dark:text-white">
                      <div className="font-medium">{formatViews(video.commentCount || 0)}</div>
                    </td>
                    {/* RPM - Compact */}
                    <td className="px-1 py-3 text-xs text-green-600 dark:text-green-400">
                      <div className="font-medium">
                        ${video.rpm.toFixed(1)}
                      </div>
                    </td>
                    {/* Upload Date - Simplified to show only date and time */}
                    <td className="px-2 py-3 text-xs text-gray-900 dark:text-white">
                      <div className="font-medium text-center">
                        {uploadDateTime}
                      </div>
                    </td>
                    {/* Actions - Better spacing and visibility */}
                    <td className="px-2 py-3 text-xs">
                      <div className="flex items-center space-x-1">
                        <a
                          href={`https://youtube.com/watch?v=${video.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-7 h-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200"
                          title="Lihat Video"
                        >
                          <Play className="w-3 h-3" />
                        </a>
                        <a
                          href={`https://youtube.com/channel/${video.channelId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-7 h-7 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors duration-200"
                          title="Lihat Channel"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {/* Results info */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Menampilkan {startIndex + 1}-{Math.min(endIndex, sortedResults.length)} dari {sortedResults.length} video
              </div>
              
              {/* Pagination controls */}
              <div className="flex items-center space-x-2">
                {/* Previous button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Sebelumnya
                </button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {generatePageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === '...' ? (
                        <span className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">...</span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(page as number)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            currentPage === page
                              ? 'bg-green-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Next button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Updated Disclaimer Note with Monetization Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
              📊 Informasi Penting tentang Data
            </h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>
                <strong>⚠️ Disclaimer:</strong> Semua data yang ditampilkan di atas adalah <strong>estimasi</strong> berdasarkan data yang tersedia secara publik di YouTube API.
              </p>
              <div className="mt-2 space-y-1 text-xs">
                <p>• <strong>Pagination:</strong> Hasil dibagi menjadi {itemsPerPage} video per halaman untuk performa yang lebih baik</p>
                <p>• <strong>View per Jam:</strong> Dihitung berdasarkan total views dibagi waktu sejak upload</p>
                <p>• <strong>Usia Channel:</strong> Dihitung dari tanggal pembuatan channel hingga sekarang (30 hari = 1 bulan, 365 hari = 1 tahun)</p>
                <p>• <strong>Upload Date:</strong> Menampilkan tanggal dan jam upload dalam format DD/MM/YYYY HH:MM WIB (GMT+7)</p>
                <p>• <strong>Status Monetisasi:</strong> Estimasi cerdas berdasarkan algoritma yang menganalisis:</p>
                <div className="ml-4 space-y-0.5 text-xs">
                  <p>  ✅ Subscriber count (minimum 1,000)</p>
                  <p>  ✅ Usia channel (minimum 5 hari)</p>
                  <p>  ✅ Jumlah video (minimum 1 video)</p>
                  <p>  ✅ Estimasi jam tayang (dari total views)</p>
                  <p>  ✅ Custom URL dan indikator channel established</p>
                </div>
                <p>• <strong>Subscriber Count:</strong> Data publik yang tersedia melalui YouTube API</p>
                <p>• <strong>RPM (Revenue per Mille):</strong> Estimasi berdasarkan rata-rata industri, bukan data aktual</p>
                <p>• <strong>Engagement:</strong> Data likes dan komentar dapat berubah secara real-time</p>
                <p>• <strong>Sorting:</strong> Pengurutan akan mereset ke halaman pertama</p>
                <p>• <strong>Akurasi:</strong> Data aktual mungkin berbeda dengan yang ditampilkan</p>
              </div>
              <p className="mt-2 text-xs italic">
                💡 Gunakan data ini sebagai referensi untuk riset dan analisis, bukan sebagai data absolut untuk keputusan bisnis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;