import React, { useState } from 'react';
import { X, Key, Clock, CheckCircle, XCircle, AlertCircle, Plus, Trash2, RefreshCw, Activity, Copy, Check, Eye, EyeOff } from 'lucide-react';

interface ApiKeyData {
  key: string;
  lastUsed: Date | null;
  status: 'active' | 'quota_exceeded' | 'invalid' | 'unused';
  usageCount: number;
  addedAt: Date;
}

interface ApiKeyHistoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAddApiKeys: (newApiKeys: string) => Promise<void>;
  apiKeys: string[];
}

const ApiKeyHistoryPopup: React.FC<ApiKeyHistoryPopupProps> = ({ 
  isOpen, 
  onClose, 
  onAddApiKeys,
  apiKeys 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApiKeys, setNewApiKeys] = useState(Array(5).fill(''));
  const [copiedKeys, setCopiedKeys] = useState<Set<string>>(new Set());
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  // Get API key data from localStorage or create default
  const getApiKeyData = (): ApiKeyData[] => {
    const stored = localStorage.getItem('apiKeyHistory');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        lastUsed: item.lastUsed ? new Date(item.lastUsed) : null,
        addedAt: new Date(item.addedAt)
      }));
    }

    // Create default data for existing API keys
    return apiKeys.map(key => ({
      key,
      lastUsed: null,
      status: 'unused' as const,
      usageCount: 0,
      addedAt: new Date()
    }));
  };

  const [apiKeyData, setApiKeyData] = useState<ApiKeyData[]>(getApiKeyData());

  // Save to localStorage
  const saveApiKeyData = (data: ApiKeyData[]) => {
    localStorage.setItem('apiKeyHistory', JSON.stringify(data));
    setApiKeyData(data);
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

  // Get status display
  const getStatusDisplay = (apiKey: ApiKeyData) => {
    const canUse = canUseAgain(apiKey);
    
    if (apiKey.status === 'invalid') {
      return {
        icon: <XCircle className="w-4 h-4 text-red-500" />,
        text: 'API Key Tidak Valid',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        canUse: false
      };
    }
    
    if (apiKey.status === 'quota_exceeded') {
      if (canUse) {
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
          text: 'Sudah Bisa Digunakan Lagi',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          canUse: true
        };
      } else {
        const resetTime = getQuotaResetTime();
        const timeUntilReset = resetTime.getTime() - new Date().getTime();
        const hoursUntilReset = Math.ceil(timeUntilReset / (1000 * 60 * 60));
        
        return {
          icon: <Clock className="w-4 h-4 text-orange-500" />,
          text: `Quota Habis (Reset ${hoursUntilReset}h lagi)`,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          canUse: false
        };
      }
    }
    
    if (apiKey.status === 'active') {
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-600" />,
        text: 'Aktif & Siap Digunakan',
        color: 'text-green-700 dark:text-green-300',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        canUse: true
      };
    }
    
    // unused
    return {
      icon: <AlertCircle className="w-4 h-4 text-blue-500" />,
      text: 'Belum Pernah Digunakan',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      canUse: true
    };
  };

  // Format last used time
  const formatLastUsed = (lastUsed: Date | null) => {
    if (!lastUsed) return 'Belum pernah digunakan';
    
    const now = new Date();
    const diffMs = now.getTime() - lastUsed.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Baru saja';
    if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return lastUsed.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Copy API key to clipboard
  const copyToClipboard = async (apiKey: string) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKeys(prev => new Set([...prev, apiKey]));
      
      // Remove from copied set after 2 seconds
      setTimeout(() => {
        setCopiedKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(apiKey);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = apiKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedKeys(prev => new Set([...prev, apiKey]));
      setTimeout(() => {
        setCopiedKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(apiKey);
          return newSet;
        });
      }, 2000);
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
    return `${apiKey.substring(0, 10)}${'•'.repeat(20)}${apiKey.substring(apiKey.length - 6)}`;
  };

  // Handle add new API keys
  const handleAddApiKeys = async () => {
    const validKeys = newApiKeys.filter(key => key.trim().length > 0);
    if (validKeys.length === 0) return;

    try {
      await onAddApiKeys(validKeys.join(', '));
      
      // Update local data
      const newData = [...apiKeyData];
      validKeys.forEach(key => {
        if (!newData.find(item => item.key === key.trim())) {
          newData.push({
            key: key.trim(),
            lastUsed: null,
            status: 'unused',
            usageCount: 0,
            addedAt: new Date()
          });
        }
      });
      
      saveApiKeyData(newData);
      setNewApiKeys(Array(5).fill(''));
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding API keys:', error);
    }
  };

  // Remove API key
  const handleRemoveApiKey = (keyToRemove: string) => {
    const newData = apiKeyData.filter(item => item.key !== keyToRemove);
    saveApiKeyData(newData);
  };

  // Reset all quota status
  const handleResetAllQuota = () => {
    const newData = apiKeyData.map(item => ({
      ...item,
      status: item.status === 'quota_exceeded' ? 'active' : item.status
    })) as ApiKeyData[];
    saveApiKeyData(newData);
  };

  // Count statistics
  const stats = {
    total: apiKeyData.length,
    active: apiKeyData.filter(item => canUseAgain(item)).length,
    quotaExceeded: apiKeyData.filter(item => item.status === 'quota_exceeded' && !canUseAgain(item)).length,
    invalid: apiKeyData.filter(item => item.status === 'invalid').length
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Manajemen API Keys
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Monitor status dan riwayat penggunaan API keys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Statistics */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Total API Keys</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
              <div className="text-sm text-green-600 dark:text-green-400">Siap Digunakan</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.quotaExceeded}</div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Quota Habis</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.invalid}</div>
              <div className="text-sm text-red-600 dark:text-red-400">Tidak Valid</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah API Keys</span>
              </button>
              <button
                onClick={handleResetAllQuota}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Quota Status</span>
              </button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Quota reset setiap hari pukul 15:00 WIB
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Tambah API Keys Baru
              </h4>
              <div className="space-y-3">
                {newApiKeys.map((key, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 w-8">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const updated = [...newApiKeys];
                        updated[index] = e.target.value;
                        setNewApiKeys(updated);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      placeholder={`API Key ${index + 1} (opsional)`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-3 mt-4">
                <button
                  onClick={handleAddApiKeys}
                  disabled={newApiKeys.every(key => !key.trim())}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 text-sm"
                >
                  Tambah Keys
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* API Keys Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      API Key
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Terakhir Digunakan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Penggunaan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ditambahkan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {apiKeyData.map((apiKey, index) => {
                    const statusDisplay = getStatusDisplay(apiKey);
                    const isVisible = visibleKeys.has(apiKey.key);
                    const isCopied = copiedKeys.has(apiKey.key);
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        {/* Index */}
                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                          {index + 1}
                        </td>
                        
                        {/* API Key */}
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Key className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <code className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded max-w-xs truncate">
                              {formatApiKeyForDisplay(apiKey.key, isVisible)}
                            </code>
                          </div>
                        </td>
                        
                        {/* Status */}
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                            {statusDisplay.icon}
                            <span>{statusDisplay.text}</span>
                          </div>
                        </td>
                        
                        {/* Last Used */}
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                          {formatLastUsed(apiKey.lastUsed)}
                        </td>
                        
                        {/* Usage Count */}
                        <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">
                          <span className="font-medium">{apiKey.usageCount}</span> kali
                        </td>
                        
                        {/* Added Date */}
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                          {apiKey.addedAt.toLocaleDateString('id-ID')}
                        </td>
                        
                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-1">
                            {/* Copy Button */}
                            <button
                              onClick={() => copyToClipboard(apiKey.key)}
                              className={`p-1.5 rounded transition-colors duration-200 ${
                                isCopied 
                                  ? 'bg-green-100 dark:bg-green-900/20 text-green-600' 
                                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
                              }`}
                              title={isCopied ? 'Copied!' : 'Copy API Key'}
                            >
                              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                            
                            {/* Show/Hide Button */}
                            <button
                              onClick={() => toggleKeyVisibility(apiKey.key)}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 rounded transition-colors duration-200"
                              title={isVisible ? 'Hide API Key' : 'Show API Key'}
                            >
                              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            
                            {/* Delete Button */}
                            <button
                              onClick={() => handleRemoveApiKey(apiKey.key)}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200"
                              title="Hapus API Key"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {apiKeyData.length === 0 && (
            <div className="text-center py-8">
              <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Belum Ada API Keys
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Tambahkan API keys untuk mulai menggunakan aplikasi.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
              >
                Tambah API Keys
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p><strong>💡 Tips:</strong> Quota YouTube API reset setiap hari pukul 15:00 WIB (Midnight Pacific Time)</p>
            <p><strong>📊 Monitoring:</strong> Status akan otomatis update berdasarkan penggunaan dan waktu reset</p>
            <p><strong>🔄 Auto-rotation:</strong> Sistem akan otomatis beralih ke API key berikutnya jika ada yang gagal</p>
            <p><strong>📋 Copy:</strong> Klik tombol copy untuk menyalin API key ke clipboard</p>
            <p><strong>👁️ Visibility:</strong> Klik tombol mata untuk show/hide API key lengkap</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyHistoryPopup;