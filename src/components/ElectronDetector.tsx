import React, { useEffect, useState } from 'react';
import { Monitor, Globe, Download, Zap } from 'lucide-react';

interface ElectronAPI {
  getVersion: () => Promise<string>;
  showMessageBox: (options: any) => Promise<any>;
  platform: string;
  isElectron: boolean;
  isDev: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

const ElectronDetector: React.FC = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [appVersion, setAppVersion] = useState('');
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    const checkElectron = async () => {
      if (window.electronAPI) {
        setIsElectron(true);
        setPlatform(window.electronAPI.platform);
        
        try {
          const version = await window.electronAPI.getVersion();
          setAppVersion(version);
        } catch (error) {
          console.error('Error getting app version:', error);
        }
      }
    };

    checkElectron();
  }, []);

  if (!isElectron) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 max-w-sm">
        <div className="flex items-start space-x-2">
          <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
              🌐 Web Version
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Berjalan di browser. Download versi desktop untuk performa optimal!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 max-w-sm">
      <div className="flex items-start space-x-2">
        <Monitor className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-green-700 dark:text-green-300">
            💻 Desktop App
          </p>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1 space-y-0.5">
            <p>Version: {appVersion}</p>
            <p>Platform: {platform}</p>
            <div className="flex items-center space-x-1 mt-1">
              <Zap className="w-3 h-3" />
              <span>Performa Optimal!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectronDetector;