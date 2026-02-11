import { useState, useEffect, useCallback, useRef } from 'react';
import { PageConfig, defaultConfig } from '@/types/config';
import { supabase } from '@/integrations/supabase/client';

const CONFIG_ROW_ID = '00000000-0000-0000-0000-000000000001';

export function useConfig() {
  const [config, setConfig] = useState<PageConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestConfigRef = useRef<PageConfig>(defaultConfig);

  // Load config from database
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('page_config')
          .select('config')
          .eq('id', CONFIG_ROW_ID)
          .maybeSingle();

        if (error) throw error;

        if (data?.config) {
          const loaded = { ...defaultConfig, ...(data.config as unknown as Partial<PageConfig>) };
          setConfig(loaded);
          latestConfigRef.current = loaded;
        }
      } catch (err) {
        console.error('Error loading config:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const saveToDb = useCallback(async (cfg: PageConfig) => {
    try {
      const { error } = await supabase
        .from('page_config')
        .upsert([{
          id: CONFIG_ROW_ID,
          config: JSON.parse(JSON.stringify(cfg)),
          updated_at: new Date().toISOString(),
        }]);
      if (error) throw error;
    } catch (err) {
      console.error('Error saving config:', err);
    }
  }, []);

  const updateConfig = useCallback((updates: Partial<PageConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      latestConfigRef.current = newConfig;

      // Debounce DB save (500ms)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveToDb(latestConfigRef.current);
      }, 500);

      return newConfig;
    });
  }, [saveToDb]);

  const resetConfig = useCallback(async () => {
    setConfig(defaultConfig);
    latestConfigRef.current = defaultConfig;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await saveToDb(defaultConfig);
  }, [saveToDb]);

  return { config, updateConfig, resetConfig, loading };
}
