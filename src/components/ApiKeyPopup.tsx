import React, { useState } from 'react';
import { X, Key, AlertCircle, CheckCircle, Plus, Loader2 } from 'lucide-react';

interface ApiKeyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAddApiKeys: (newApiKeys: string) => Promise<void>;
}

const ApiKeyPopup: React.FC<ApiKeyPopupProps> = ({ isOpen, onClose, onAddApiKeys }) => {
  const [apiKeyFields, setApiKeyFields] = useState<string[]>(Array(10).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIntegrating, setIsIntegrating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleApiKeyChange = (index: number, value: string) => {
    const newFields = [...apiKeyFields];
    newFields[index] = value;
    setApiKeyFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      // Get non-empty API keys
      const validApiKeys = apiKeyFields.filter(key => key.trim().length > 0);

      if (validApiKeys.length === 0) {
        setError('Silakan masukkan minimal 1 API key baru.');
        setIsSubmitting(false);
        return;
      }

      // Validate API key format (basic check)
      const invalidKeys = validApiKeys.filter(key => !key.startsWith('AIza') || key.length < 30);
      if (invalidKeys.length > 0) {
        setError(`Format API key tidak valid. Pastikan API key dimulai dengan "AIza" dan memiliki panjang minimal 30 karakter.`);
        setIsSubmitting(false);
        return;
      }

      // Show integration loading
      setIsSubmitting(false);
      setIsIntegrating(true);

      // Join valid API keys with commas
      const newApiKeys = validApiKeys.join(', ');
      
      // Add new API keys (this will update the auth context)
      await onAddApiKeys(newApiKeys);
      
      // Show success state
      setSuccess(true);
      
      // Wait 2 seconds to show success message, then auto-close
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err) {
      setError('Terjadi kesalahan saat menambahkan API keys.');
      setIsSubmitting(false);
      setIsIntegrating(false);
    }
  };

  const handleClose = () => {
    setApiKeyFields(Array(10).fill(''));
    setError('');
    setSuccess(false);
    setIsSubmitting(false);
    setIsIntegrating(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-2">
            <Key className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isIntegrating ? 'Mengintegrasikan API Keys...' : success ? 'Berhasil!' : 'Masukkan API Key Baru'}
            </h3>
          </div>
          {!isIntegrating && !success && (
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Integration Loading State */}
          {isIntegrating && (
            <div className="text-center py-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Key className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Mengintegrasikan API Keys Baru
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sedang memproses dan mengintegrasikan API keys baru ke sistem...
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 w-full">
                  <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                    <p>• Memvalidasi API keys...</p>
                    <p>• Mengupdate konfigurasi sistem...</p>
                    <p>• Menyiapkan untuk pencarian berikutnya...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {success && (
            <div className="text-center py-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-green-600 mb-2">
                    API Keys Berhasil Ditambahkan!
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sistem siap untuk melanjutkan pencarian. Popup akan tertutup otomatis...
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800 w-full">
                  <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                    <p>✅ API keys berhasil diintegrasikan</p>
                    <p>✅ Quota baru tersedia untuk pencarian</p>
                    <p>✅ Anda dapat melanjutkan riset sekarang</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form State */}
          {!isIntegrating && !success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
                      Quota API Habis
                    </p>
                    <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                      <p>• Semua API key yang ada telah mencapai batas quota harian</p>
                      <p>• Tambahkan API key baru untuk melanjutkan pencarian</p>
                      <p>• Quota akan reset otomatis pukul 15:00 WIB besok</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Keys Input Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  YouTube API Keys Baru (Minimal 1, Maksimal 10)
                </label>
                <div className="space-y-3">
                  {apiKeyFields.map((apiKey, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-8">
                          {index + 1}.
                        </span>
                        <div className="relative flex-1">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={apiKey}
                            onChange={(e) => handleApiKeyChange(index, e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 text-sm"
                            placeholder={`API Key ${index + 1} (opsional)`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Isi minimal 1 field dengan API key baru. API key baru akan ditambahkan ke yang sudah ada.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="whitespace-pre-line">{error}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || apiKeyFields.every(key => !key.trim())}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Memvalidasi...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Tambah API Keys</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          {/* Instructions - Only show in form state */}
          {!isIntegrating && !success && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium mb-2">
                    Cara Mendapatkan API Key Baru:
                  </p>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
                    <p><strong>1.</strong> Buka Google Cloud Console (console.cloud.google.com)</p>
                    <p><strong>2.</strong> Buat project baru atau pilih project yang ada</p>
                    <p><strong>3.</strong> Aktifkan YouTube Data API v3</p>
                    <p><strong>4.</strong> Buat credentials → API Key</p>
                    <p><strong>5.</strong> Copy API key dan masukkan di form ini</p>
                    <p><strong>6.</strong> Ulangi untuk mendapatkan multiple API keys</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiKeyPopup;