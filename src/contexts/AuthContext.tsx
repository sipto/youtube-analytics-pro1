import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  username: string;
  email: string;
  licenseCode: string;
  youtubeApiKey: string;
  youtubeApiKeys?: string[]; // Array of API keys for failover
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  getNextApiKey: () => string | null;
  markApiKeyAsFailed: (apiKey: string) => void;
  addNewApiKeys: (newApiKeys: string) => void;
  resetApiKeyRotation: () => void;
  getApiKeyStatus: () => { current: number; total: number; failed: number };
  getAllApiKeys: () => string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentApiKeyIndex, setCurrentApiKeyIndex] = useState(0);

  const login = (userData: User) => {
    // Parse multiple API keys from comma-separated string or newline-separated
    const apiKeysArray = userData.youtubeApiKey
      .split(/[,\n]/) // Split by comma or newline
      .map(key => key.trim())
      .filter(key => key.length > 0)
      .slice(0, 10); // Updated maximum to 10 API keys

    // Validate minimum requirement (changed to 1)
    if (apiKeysArray.length < 1) {
      throw new Error('Minimal 1 YouTube API key diperlukan. Saat ini tidak ada API key yang valid.');
    }

    const userWithApiKeys = {
      ...userData,
      youtubeApiKeys: apiKeysArray
    };

    setUser(userWithApiKeys);
    // Reset index when logging in
    setCurrentApiKeyIndex(0);
    localStorage.setItem('user', JSON.stringify(userWithApiKeys));
    
    console.log(`✅ Login successful with ${apiKeysArray.length} API keys`);
    console.log('📋 API Keys loaded:', apiKeysArray.map((key, index) => `${index + 1}. ${key.substring(0, 10)}...`));
  };

  const logout = () => {
    setUser(null);
    setCurrentApiKeyIndex(0);
    localStorage.removeItem('user');
  };

  // Get all API keys for external use
  const getAllApiKeys = (): string[] => {
    return user?.youtubeApiKeys || [];
  };

  const getNextApiKey = (): string | null => {
    if (!user?.youtubeApiKeys || user.youtubeApiKeys.length === 0) {
      console.warn('❌ No API keys available in user data');
      return null;
    }

    // Check if we've exhausted all API keys
    if (currentApiKeyIndex >= user.youtubeApiKeys.length) {
      console.warn(`❌ All ${user.youtubeApiKeys.length} API keys have been exhausted (index: ${currentApiKeyIndex})`);
      return null;
    }

    const apiKey = user.youtubeApiKeys[currentApiKeyIndex];
    console.log(`🔑 Returning API key ${currentApiKeyIndex + 1}/${user.youtubeApiKeys.length}: ${apiKey.substring(0, 10)}...`);
    
    return apiKey;
  };

  const markApiKeyAsFailed = (apiKey: string) => {
    console.warn(`❌ Marking API key ${currentApiKeyIndex + 1} as failed: ${apiKey.substring(0, 10)}...`);
    
    // Move to next API key index
    const nextIndex = currentApiKeyIndex + 1;
    setCurrentApiKeyIndex(nextIndex);
    console.log(`🔄 Moving to API key index: ${nextIndex}`);
  };

  // New method to add API keys without replacing existing ones
  const addNewApiKeys = (newApiKeys: string) => {
    if (!user) return;

    // Parse new API keys
    const newApiKeysArray = newApiKeys
      .split(/[,\n]/)
      .map(key => key.trim())
      .filter(key => key.length > 0);

    // Combine with existing API keys
    const existingKeys = user.youtubeApiKeys || [];
    const combinedApiKeys = [...existingKeys, ...newApiKeysArray];

    // Update user data with combined API keys
    const updatedUser = {
      ...user,
      youtubeApiKey: combinedApiKeys.join(', '),
      youtubeApiKeys: combinedApiKeys.slice(0, 10) // Maximum 10 API keys
    };

    setUser(updatedUser);
    // Don't reset index - continue from where we left off
    localStorage.setItem('user', JSON.stringify(updatedUser));

    console.log(`✅ Added ${newApiKeysArray.length} new API keys. Total: ${combinedApiKeys.length}`);
  };

  // Reset API key rotation (useful for new searches)
  const resetApiKeyRotation = () => {
    setCurrentApiKeyIndex(0);
    console.log('🔄 API key rotation reset to index 0');
  };

  // Get current API key status
  const getApiKeyStatus = () => {
    const total = user?.youtubeApiKeys?.length || 0;
    const current = Math.min(currentApiKeyIndex + 1, total); // Current key being tried (1-based)
    const failed = currentApiKeyIndex; // Number of keys that have failed
    
    return { current, total, failed };
  };

  const isAuthenticated = user !== null;

  // Check for existing user on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    }
  }, []);

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    getNextApiKey,
    markApiKeyAsFailed,
    addNewApiKeys,
    resetApiKeyRotation,
    getApiKeyStatus,
    getAllApiKeys,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};