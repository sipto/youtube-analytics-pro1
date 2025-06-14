import React, { useState } from 'react';
import { Search, Globe, Filter, Video, Clock, Tag } from 'lucide-react';

interface SearchFormProps {
  onSearch: (data: { 
    keyword: string; 
    country: string; 
    category: string;
    publishTime: string;
    videoType: string;
  }) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [formData, setFormData] = useState({
    keyword: '',
    country: 'ID',
    category: 'all',
    publishTime: 'anytime',
    videoType: 'all',
  });

  // Simplified countries list with just names
  const countries = [
    { code: 'ID', name: 'Indonesia' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'CA', name: 'Canada' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'IN', name: 'India' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'PL', name: 'Poland' },
    { code: 'RU', name: 'Russia' },
    { code: 'CN', name: 'China' },
    { code: 'TH', name: 'Thailand' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'SG', name: 'Singapore' },
    { code: 'PH', name: 'Philippines' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'EG', name: 'Egypt' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'KE', name: 'Kenya' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'PE', name: 'Peru' },
    { code: 'TR', name: 'Turkey' },
    { code: 'GR', name: 'Greece' },
    { code: 'PT', name: 'Portugal' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'AT', name: 'Austria' },
    { code: 'BE', name: 'Belgium' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'HU', name: 'Hungary' },
    { code: 'RO', name: 'Romania' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'HR', name: 'Croatia' },
    { code: 'RS', name: 'Serbia' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'IL', name: 'Israel' },
    { code: 'NZ', name: 'New Zealand' },
  ];

  const categories = [
    { value: 'all', label: '📂 Semua Kategori' },
    { value: '1', label: '🎬 Film & Animasi' },
    { value: '2', label: '🚗 Otomotif' },
    { value: '10', label: '🎵 Musik' },
    { value: '15', label: '🐾 Hewan Peliharaan' },
    { value: '17', label: '⚽ Olahraga' },
    { value: '19', label: '✈️ Perjalanan & Acara' },
    { value: '20', label: '🎮 Gaming' },
    { value: '22', label: '👥 Vlog' },
    { value: '23', label: '😂 Komedi' },
    { value: '24', label: '🎪 Hiburan' },
    { value: '25', label: '📰 Berita & Politik' },
    { value: '26', label: '💡 Cara & Gaya' },
    { value: '27', label: '🎓 Pendidikan' },
    { value: '28', label: '🔬 Sains & Teknologi' },
  ];

  const publishTimeOptions = [
    { value: 'anytime', label: '📅 Kapan Saja' },
    { value: 'hour', label: '⏰ 1 Jam Terakhir' },
    { value: 'today', label: '📆 24 Jam Terakhir' },
    { value: 'week', label: '📅 7 Hari Terakhir' },
    { value: 'month', label: '📅 30 Hari Terakhir' },
  ];

  const videoTypeOptions = [
    { value: 'all', label: '📹 Semua Video' },
    { value: 'short', label: '⚡ Video Short' },
    { value: 'long', label: '🎬 Video Long' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.keyword.trim()) {
      onSearch(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-6">
          <Search className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Pencarian Video YouTube
          </h2>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Keyword Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kata Kunci
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="keyword"
                value={formData.keyword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                placeholder="Masukkan kata kunci..."
              />
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lokasi
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 appearance-none"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kategori
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 appearance-none"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Publish Time Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Waktu Publikasi
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="publishTime"
                value={formData.publishTime}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 appearance-none"
              >
                {publishTimeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Video Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipe Video
            </label>
            <div className="relative">
              <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="videoType"
                value={formData.videoType}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 appearance-none"
              >
                {videoTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading || !formData.keyword.trim()}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 flex items-center space-x-2 min-w-[200px] justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Mencari...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;