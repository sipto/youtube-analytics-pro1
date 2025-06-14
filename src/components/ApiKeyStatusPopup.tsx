import React from 'react';
import { Key, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ApiKeyStatusPopupProps {
  isOpen: boolean;
  currentApiKeyIndex: number;
  totalApiKeys: number;
  status: 'checking' | 'failed' | 'success' | 'exhausted';
  message: string;
}

const ApiKeyStatusPopup: React.FC<ApiKeyStatusPopupProps> = ({
  isOpen,
  currentApiKeyIndex,
  totalApiKeys,
  status,
  message
}) => {
  if (!isOpen) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'exhausted':
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      default:
        return <Key className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20';
      case 'failed':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
      case 'success':
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20';
      case 'exhausted':
        return 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getProgressPercentage = () => {
    if (totalApiKeys === 0) return 0;
    return Math.min(100, ((currentApiKeyIndex + 1) / totalApiKeys) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl border ${getStatusColor()} w-full max-w-md`}>
        {/* Header */}
        <div className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            {getStatusIcon()}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Status API Key
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {message}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>

          {/* API Key Counter */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            API Key {currentApiKeyIndex + 1} dari {totalApiKeys}
          </div>

          {/* API Key Status List */}
          <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
            {Array.from({ length: totalApiKeys }, (_, index) => {
              let keyStatus = 'waiting';
              let keyStatusText = 'Menunggu';
              let keyStatusColor = 'text-gray-400';
              let keyIcon = <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full" />;

              if (index < currentApiKeyIndex) {
                keyStatus = 'failed';
                keyStatusText = 'Gagal';
                keyStatusColor = 'text-red-500';
                keyIcon = <XCircle className="w-3 h-3 text-red-500" />;
              } else if (index === currentApiKeyIndex) {
                if (status === 'checking') {
                  keyStatus = 'checking';
                  keyStatusText = 'Mencoba...';
                  keyStatusColor = 'text-blue-600';
                  keyIcon = <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />;
                } else if (status === 'failed') {
                  keyStatus = 'failed';
                  keyStatusText = 'Gagal';
                  keyStatusColor = 'text-red-500';
                  keyIcon = <XCircle className="w-3 h-3 text-red-500" />;
                } else if (status === 'success') {
                  keyStatus = 'success';
                  keyStatusText = 'Berhasil';
                  keyStatusColor = 'text-green-600';
                  keyIcon = <CheckCircle className="w-3 h-3 text-green-600" />;
                }
              }

              return (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    API Key {index + 1}
                  </span>
                  <div className="flex items-center space-x-1">
                    {keyIcon}
                    <span className={`text-xs ${keyStatusColor}`}>
                      {keyStatusText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show exhausted message */}
          {status === 'exhausted' && (
            <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                <strong>Semua API Key telah dicoba!</strong><br />
                Popup penambahan API Key akan muncul setelah ini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiKeyStatusPopup;