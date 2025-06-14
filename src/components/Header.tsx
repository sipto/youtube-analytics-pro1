import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Youtube, User, LogOut, Moon, Sun, History, Shield, BarChart3, Key, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApiKeyHistoryPopup from './ApiKeyHistoryPopup';

interface HeaderProps {
  searchHistory: string[];
  onAddApiKeys?: (newApiKeys: string) => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ searchHistory, onAddApiKeys }) => {
  const { user, logout, getAllApiKeys } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showApiKeyHistory, setShowApiKeyHistory] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddApiKeys = async (newApiKeys: string) => {
    if (onAddApiKeys) {
      await onAddApiKeys(newApiKeys);
    }
  };

  // Get API key statistics
  const apiKeys = getAllApiKeys();
  const apiKeyCount = apiKeys.length;

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Youtube className="w-8 h-8 text-red-500" />
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    YouTube Analytics Pro
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Platform Analisis Video Profesional by Sipto Widodo
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* API Key Management */}
              <div className="relative">
                <button
                  onClick={() => setShowApiKeyHistory(true)}
                  className="flex items-center space-x-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Manajemen API Keys"
                >
                  <Activity className="w-5 h-5" />
                  <span className="text-sm font-medium">{apiKeyCount}</span>
                </button>
              </div>

              {/* Search History */}
              <div className="relative">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                  title="Riwayat Pencarian"
                >
                  <History className="w-5 h-5" />
                </button>
                
                {showHistory && searchHistory.length > 0 && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Riwayat Pencarian
                      </h3>
                    </div>
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {searchHistory.map((keyword, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                        >
                          {keyword}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                title="Toggle Theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.username}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {apiKeyCount} API Keys aktif
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowApiKeyHistory(true);
                          setShowUserMenu(false);
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                      >
                        <Key className="w-4 h-4" />
                        <span>Kelola API Keys</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* API Key History Popup */}
      <ApiKeyHistoryPopup
        isOpen={showApiKeyHistory}
        onClose={() => setShowApiKeyHistory(false)}
        onAddApiKeys={handleAddApiKeys}
        apiKeys={apiKeys}
      />
    </>
  );
};

export default Header;