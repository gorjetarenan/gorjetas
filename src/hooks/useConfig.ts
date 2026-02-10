import { useState, useEffect } from 'react';
import { PageConfig, defaultConfig } from '@/types/config';

const STORAGE_KEY = 'gorjetas-config';

export function useConfig() {
  const [config, setConfig] = useState<PageConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultConfig, ...JSON.parse(stored) } : defaultConfig;
    } catch {
      return defaultConfig;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const updateConfig = (updates: Partial<PageConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const resetConfig = () => setConfig(defaultConfig);

  return { config, updateConfig, resetConfig };
}
