import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LicenseService } from '../services/licenseService';
import { Youtube, User, Mail, Key, Lock, Moon, Sun, BarChart3, AlertCircle, Clock, RefreshCw, Info, Activity, Copy, Check, Eye, EyeOff, RotateCcw, Trash2 } from 'lucide-react';

interface ApiKeyData {
  key: string;
  lastUsed: Date | null;
  status: 'active' | 'quota_exceeded' | 'invalid' | 'unused';
  usageCount: number;
  addedAt: Date;
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    licenseCode: '',
    youtubeApiKeys: Array(10).fill(''), // 10 slots for API keys
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedKeys, setCopiedKeys] = useState<Set<string>>(new Set());
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [usedApiKeys, setUsedApiKeys] = useState<ApiKeyData[]>([]);
  
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Load used API keys from localStorage on component mount
  useEffect(() => {
    const loadApiKeyHistory = () => {
      const stored = localStorage.getItem('apiKeyHistory');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const apiKeyData = parsed.map((item: any) => ({
            ...item,
            lastUsed: item.lastUsed ? new Date(item.lastUsed) : null,
            addedAt: new Date(item.addedAt)
          }));
          
          // Sort by last used (most recent first), then by added date
          const sortedData = sortApiKeysByLastUsed(apiKeyData);
          setUsedApiKeys(sortedData);
          console.log('✅ Loaded API key history:', sortedData.length, 'keys');
        } catch (error) {
          console.error('Error loading API key history:', error);
          // Create some sample data for demonstration
          createSampleApiKeyHistory();
        }
      } else {
        // Create some sample data for demonstration if no history exists
        createSampleApiKeyHistory();
      }
    };

    const createSampleApiKeyHistory = () => {
      const sampleData: ApiKeyData[] = [
        {
          key: 'AIzaSyDemoKey1234567890abcdefghijklmnop',
          lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          status: 'quota_exceeded',
          usageCount: 15,
          addedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          key: 'AIzaSyDemoKey2345678901bcdefghijklmnopq',
          lastUsed: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          status: 'active',
          usageCount: 8,
          addedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
        },
        {
          key: 'AIzaSyDemoKey3456789012cdefghijklmnopqr',
          lastUsed: null,
          status: 'unused',
          usageCount: 0,
          addedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
        },
        {
          key: 'AIzaSyDemoKey4567890123defghijklmnopqrs',
          lastUsed: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago (should be usable again)
          status: 'quota_exceeded',
          usageCount: 22,
          addedAt: new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
        },
        {
          key: 'AIzaSyDemoKey5678901234efghijklmnopqrst',
          lastUsed: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          status: 'invalid',
          usageCount: 3,
          addedAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
        }
      ];

      // Sort sample data by last used
      const sortedSampleData = sortApiKeysByLastUsed(sampleData);
      setUsedApiKeys(sortedSampleData);
      localStorage.setItem('apiKeyHistory', JSON.stringify(sortedSampleData));
      console.log('✅ Created sample API key history:', sortedSampleData.length, 'keys');
    };

    loadApiKeyHistory();
  }, []);

  // Function to sort API keys by last used (most recent first)
  const sortApiKeysByLastUsed = (apiKeys: ApiKeyData[]): ApiKeyData[] => {
    return [...apiKeys].sort((a, b) => {
      // If both have lastUsed dates, sort by most recent first
      if (a.lastUsed && b.lastUsed) {
        return b.lastUsed.getTime() - a.lastUsed.getTime();
      }
      
      // If only one has lastUsed, prioritize the one that was used
      if (a.lastUsed && !b.lastUsed) {
        return -1; // a comes first
      }
      if (!a.lastUsed && b.lastUsed) {
        return 1; // b comes first
      }
      
      // If neither has been used, sort by most recently added
      return b.addedAt.getTime() - a.addedAt.getTime();
    });
  };

  // Function to update API key history and maintain sort order
  const updateApiKeyHistory = (updatedKeys: ApiKeyData[]) => {
    const sortedKeys = sortApiKeysByLastUsed(updatedKeys);
    setUsedApiKeys(sortedKeys);
    localStorage.setItem('apiKeyHistory', JSON.stringify(sortedKeys));
  };

  // Function to add or update API key in history
  const addOrUpdateApiKeyInHistory = (apiKey: string, status: 'active' | 'quota_exceeded' | 'invalid' | 'unused' = 'unused') => {
    const currentKeys = [...usedApiKeys];
    const existingIndex = currentKeys.findIndex(item => item.key === apiKey);
    
    if (existingIndex !== -1) {
      // Update existing API key
      currentKeys[existingIndex] = {
        ...currentKeys[existingIndex],
        lastUsed: new Date(),
        status: status,
        usageCount: currentKeys[existingIndex].usageCount + (status === 'unused' ? 0 : 1)
      };
    } else {
      // Add new API key
      currentKeys.push({
        key: apiKey,
        lastUsed: status === 'unused' ? null : new Date(),
        status: status,
        usageCount: status === 'unused' ? 0 : 1,
        addedAt: new Date()
      });
    }
    
    updateApiKeyHistory(currentKeys);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleApiKeyChange = (index: number, value: string) => {
    const newApiKeys = [...formData.youtubeApiKeys];
    newApiKeys[index] = value;
    setFormData({
      ...formData,
      youtubeApiKeys: newApiKeys,
    });
    setError('');

    // If user is adding a new API key, add it to history as unused
    if (value.trim() && value.startsWith('AIza') && value.length >= 30) {
      addOrUpdateApiKeyInHistory(value.trim(), 'unused');
    }
  };

  // Get quota reset time (15:00 WIB = 08:00 UTC)
  const getQuotaResetTime = () => {
    const now = new Date();
    const resetTime = new Date();
    resetTime.setUTCHours(8, 0, 0, 0); // 15:00 WIB = 08:00 UTC
    
    if (now.getUTCHours() >= 8) {
      // If it's past 08:00 UTC today, next reset is tomorrow
      resetTime.setUTCDate(resetTime.getUTCDate() + 1);
    }
    
    return resetTime;
  };

  // Check if API key can be used again (quota reset)
  const canUseAgain = (apiKey: ApiKeyData) => {
    if (apiKey.status === 'invalid') return false;
    if (apiKey.status === 'unused' || apiKey.status === 'active') return true;
    
    if (apiKey.status === 'quota_exceeded' && apiKey.lastUsed) {
      const resetTime = getQuotaResetTime();
      const lastUsedDate = new Date(apiKey.lastUsed);
      
      // If last used was before today's reset time, it can be used again
      if (lastUsedDate < resetTime) {
        return true;
      }
    }
    
    return false;
  };

  // Get status display for used API keys
  const getStatusDisplay = (apiKey: ApiKeyData) => {
    const canUse = canUseAgain(apiKey);
    
    if (apiKey.status === 'invalid') {
      return {
        icon: <AlertCircle className="w-3 h-3 text-red-500" />,
        text: 'Tidak Valid',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        canUse: false
      };
    }
    
    if (apiKey.status === 'quota_exceeded') {
      if (canUse) {
        return {
          icon: <Check className="w-3 h-3 text-green-500" />,
          text: 'Sudah Bisa Digunakan',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          canUse: true
        };
      } else {
        const resetTime = getQuotaResetTime();
        const timeUntilReset = resetTime.getTime() - new Date().getTime();
        const hoursUntilReset = Math.ceil(timeUntilReset / (1000 * 60 * 60));
        
        return {
          icon: <Clock className="w-3 h-3 text-orange-500" />,
          text: `Reset ${hoursUntilReset}h lagi`,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          canUse: false
        };
      }
    }
    
    if (apiKey.status === 'active') {
      return {
        icon: <Check className="w-3 h-3 text-green-600" />,
        text: 'Siap Digunakan',
        color: 'text-green-700 dark:text-green-300',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        canUse: true
      };
    }
    
    // unused
    return {
      icon: <AlertCircle className="w-3 h-3 text-blue-500" />,
      text: 'Belum Digunakan',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      canUse: true
    };
  };

  // Format last used time
  const formatLastUsed = (lastUsed: Date | null) => {
    if (!lastUsed) return 'Belum pernah';
    
    const now = new Date();
    const diffMs = now.getTime() - lastUsed.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Baru saja';
    if (diffMinutes < 60) return `${diffMinutes}m lalu`;
    if (diffHours < 24) return `${diffHours}j lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays}h lalu`;
    
    return lastUsed.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  // Copy API key to clipboard
  const copyToClipboard = async (apiKey: string) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKeys(prev => new Set([...prev, apiKey]));
      
      setTimeout(() => {
        setCopiedKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(apiKey);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Toggle API key visibility
  const toggleKeyVisibility = (apiKey: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(apiKey)) {
        newSet.delete(apiKey);
      } else {
        newSet.add(apiKey);
      }
      return newSet;
    });
  };

  // Format API key for display
  const formatApiKeyForDisplay = (apiKey: string, isVisible: boolean) => {
    if (isVisible) {
      return apiKey;
    }
    return `${apiKey.substring(0, 8)}${'•'.repeat(16)}${apiKey.substring(apiKey.length - 4)}`;
  };

  // Reuse API key - add to first empty slot
  const reuseApiKey = (apiKey: string) => {
    const newApiKeys = [...formData.youtubeApiKeys];
    
    // Find first empty slot
    const emptyIndex = newApiKeys.findIndex(key => key.trim() === '');
    
    if (emptyIndex !== -1) {
      newApiKeys[emptyIndex] = apiKey;
      setFormData({
        ...formData,
        youtubeApiKeys: newApiKeys
      });
      
      // Update the API key status to show it's being reused
      addOrUpdateApiKeyInHistory(apiKey, 'unused');
      
      // Show success feedback
      const button = document.querySelector(`[data-reuse-key="${apiKey}"]`);
      if (button) {
        const originalText = button.textContent;
        button.textContent = '✓ Ditambahkan';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } else {
      alert('Semua slot API key sudah terisi. Kosongkan salah satu slot terlebih dahulu.');
    }
  };

  // Remove API key from used list
  const removeUsedApiKey = (apiKeyToRemove: string) => {
    const newUsedKeys = usedApiKeys.filter(item => item.key !== apiKeyToRemove);
    updateApiKeyHistory(newUsedKeys);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate API keys count before proceeding
      const validApiKeys = formData.youtubeApiKeys.filter(key => key.trim().length > 0);

      if (validApiKeys.length < 1) {
        setError(`Minimal 1 YouTube API key diperlukan. Saat ini tidak ada API key yang valid.`);
        setIsLoading(false);
        return;
      }

      if (validApiKeys.length > 10) {
        setError(`Maksimal 10 YouTube API keys diperbolehkan. Saat ini ada ${validApiKeys.length} API key.\n\nSilakan kurangi jumlah API key.`);
        setIsLoading(false);
        return;
      }

      // Validate with Airtable
      const validationResult = await LicenseService.validateLicense(
        formData.email,
        formData.licenseCode
      );
      
      if (validationResult.isValid && validationResult.userData) {
        // Use data from Airtable and combine API keys
        const userData = {
          username: validationResult.userData.username || formData.username,
          email: validationResult.userData.email,
          licenseCode: formData.licenseCode,
          youtubeApiKey: validApiKeys.join(', '), // Join valid API keys with commas
        };
        
        login(userData);
        navigate('/dashboard');
      } else {
        setError(validationResult.message || 'Email atau kode lisensi tidak valid.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan saat validasi. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate filled API keys for display
  const filledApiKeys = formData.youtubeApiKeys.filter(key => key.trim().length > 0).length;
  const estimatedDailyQuota = filledApiKeys * 10000;
  const estimatedSearches = Math.floor(estimatedDailyQuota / 100);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl w-full">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <Youtube className="w-8 h-8 text-white mr-2" />
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              YouTube Analytics Pro
            </h1>
            <p className="text-green-100 text-sm">
              Platform Analisis Video Profesional by Sipto Widodo
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Informasi Akun
                </h3>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Pengguna
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="Masukkan nama pengguna"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Terdaftar
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="siptowidodo@gmail.com"
                    />
                  </div>
                </div>

                {/* License Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kode Lisensi
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="licenseCode"
                      value={formData.licenseCode}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="Masukkan kode lisensi"
                    />
                  </div>
                </div>

                {/* API Key Usage Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Estimasi Quota Harian
                    </h4>
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                    <p><strong>API Keys Aktif:</strong> {filledApiKeys}/10</p>
                    <p><strong>Total Quota:</strong> {estimatedDailyQuota.toLocaleString()} units</p>
                    <p><strong>Estimasi Pencarian:</strong> ~{estimatedSearches.toLocaleString()} pencarian/hari</p>
                    <p><strong>Reset Quota:</strong> Setiap hari pukul 15:00 WIB</p>
                  </div>
                </div>
              </div>

              {/* Middle Column - API Keys Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    YouTube API Keys
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {filledApiKeys}/10 keys
                  </span>
                </div>

                {/* YouTube API Keys - 10 Slots */}
                <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  {formData.youtubeApiKeys.map((apiKey, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-8">
                          {index + 1}.
                        </span>
                        <div className="relative flex-1">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={apiKey}
                            onChange={(e) => handleApiKeyChange(index, e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 text-sm"
                            placeholder={`YouTube API Key ${index + 1} (opsional)`}
                          />
                          {apiKey.trim() && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-3 h-3 bg-green-500 rounded-full" title="API Key tersedia"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Minimal 1 API key, maksimal 10 API keys.</strong> Sistem akan otomatis beralih ke API key berikutnya jika ada yang gagal.
                </p>
              </div>

              {/* Right Column - Used API Keys History (Sorted by Last Used) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    API Keys Pernah Digunakan
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {usedApiKeys.length} keys
                    </span>
                    <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                      Terbaru ↑
                    </div>
                  </div>
                </div>

                {usedApiKeys.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    {usedApiKeys.map((apiKey, index) => {
                      const statusDisplay = getStatusDisplay(apiKey);
                      const isVisible = visibleKeys.has(apiKey.key);
                      const isCopied = copiedKeys.has(apiKey.key);
                      
                      return (
                        <div
                          key={`${apiKey.key}-${index}`}
                          className={`p-3 rounded-lg border ${statusDisplay.bgColor} border-gray-200 dark:border-gray-600 ${
                            index === 0 ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''
                          }`}
                        >
                          {/* Show "Terbaru" badge for the first item */}
                          {index === 0 && apiKey.lastUsed && (
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full font-medium">
                                🕒 Terakhir Digunakan
                              </div>
                            </div>
                          )}

                          {/* API Key Display */}
                          <div className="flex items-center space-x-2 mb-2">
                            <Key className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <code className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex-1 truncate">
                              {formatApiKeyForDisplay(apiKey.key, isVisible)}
                            </code>
                          </div>

                          {/* Status */}
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.bgColor} ${statusDisplay.color} mb-2`}>
                            {statusDisplay.icon}
                            <span>{statusDisplay.text}</span>
                          </div>

                          {/* Details */}
                          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-3">
                            <div>Terakhir: {formatLastUsed(apiKey.lastUsed)}</div>
                            <div>Penggunaan: {apiKey.usageCount} kali</div>
                            <div>Ditambah: {apiKey.addedAt.toLocaleDateString('id-ID')}</div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1">
                            {/* Reuse Button */}
                            <button
                              onClick={() => reuseApiKey(apiKey.key)}
                              data-reuse-key={apiKey.key}
                              disabled={!statusDisplay.canUse}
                              className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors duration-200 ${
                                statusDisplay.canUse
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                              }`}
                              title={statusDisplay.canUse ? 'Tambahkan ke slot API key' : 'API key belum bisa digunakan'}
                            >
                              <RotateCcw className="w-3 h-3 inline mr-1" />
                              Gunakan Lagi
                            </button>

                            {/* Copy Button */}
                            <button
                              onClick={() => copyToClipboard(apiKey.key)}
                              className={`p-1 rounded transition-colors duration-200 ${
                                isCopied 
                                  ? 'bg-green-100 dark:bg-green-900/20 text-green-600' 
                                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                              title={isCopied ? 'Copied!' : 'Copy API Key'}
                            >
                              {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>

                            {/* Show/Hide Button */}
                            <button
                              onClick={() => toggleKeyVisibility(apiKey.key)}
                              className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                              title={isVisible ? 'Hide' : 'Show'}
                            >
                              {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => removeUsedApiKey(apiKey.key)}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200"
                              title="Hapus dari riwayat"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Belum ada API key yang pernah digunakan
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      API key akan muncul di sini setelah digunakan
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <form onSubmit={handleSubmit} className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Memvalidasi...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>🔓 Masuk</span>
                  </>
                )}
              </button>
            </form>

            {/* Info Sections */}
            <div className="mt-6 space-y-4">
              {/* Login Info */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-2">
                      Fitur Baru - Smart API Key Sorting:
                    </p>
                    <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                      <p>• <strong>🕒 Urutan Terbaru:</strong> API key yang terakhir digunakan muncul paling atas</p>
                      <p>• <strong>📊 Real-time Update:</strong> Urutan otomatis berubah saat API key digunakan</p>
                      <p>• <strong>🔄 Auto-Sort:</strong> API key baru yang ditambahkan langsung masuk urutan</p>
                      <p>• <strong>💡 Smart Priority:</strong> Yang pernah digunakan prioritas di atas yang belum</p>
                      <p>• <strong>🎯 Easy Reuse:</strong> Tombol "Gunakan Lagi" untuk API key yang sudah bisa dipakai</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quota Management Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
                      Manajemen Quota API:
                    </p>
                    <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span><strong>Quota Reset:</strong> Setiap hari pukul 15:00 WIB (Midnight Pacific Time)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RefreshCw className="w-3 h-3" />
                        <span><strong>Auto-Reuse:</strong> API key otomatis bisa digunakan lagi setelah quota reset</span>
                      </div>
                      <p>• Setiap API key memiliki quota 10,000 units per hari</p>
                      <p>• Dengan 10 API keys = 100,000 units = ~1,000 pencarian per hari</p>
                      <p>• Status "Sudah Bisa Digunakan" muncul setelah quota reset</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;