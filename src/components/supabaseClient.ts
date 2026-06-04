import { createClient } from '@supabase/supabase-js';

const getInitialConfig = () => {
  const localUrl = localStorage.getItem('pg_supabase_url');
  const localKey = localStorage.getItem('pg_supabase_anon_key');
  
  const rawUrl = localUrl || (import.meta as any).env.VITE_SUPABASE_URL || 'https://vbcrqylywbuqvuwqhrcp.supabase.co';
  const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  
  const anonKey = localKey || (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_7BnKh3VAwI3dzswc7NMaaw_sy2n6xE4';
  
  return { url: cleanUrl, key: anonKey, isCustom: !!localUrl };
};

let currentConfig = getInitialConfig();
let currentClient = createClient(currentConfig.url, currentConfig.key);

// Expose properties dynamically through a Proxy so that any import of 'supabase' in other files
// always references the latest active client without requiring re-imports or hot-reloads.
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    return (currentClient as any)[prop];
  }
});

export const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem('pg_supabase_url') || '';
  const localKey = localStorage.getItem('pg_supabase_anon_key') || '';
  return {
    url: localUrl,
    key: localKey,
    activeUrl: currentConfig.url,
    activeKey: currentConfig.key,
    isCustom: currentConfig.isCustom
  };
};

export const updateSupabaseConfig = (url: string, key: string) => {
  const cleanUrl = url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  const cleanKey = key.trim();
  
  if (cleanUrl) {
    localStorage.setItem('pg_supabase_url', cleanUrl);
  } else {
    localStorage.removeItem('pg_supabase_url');
  }
  
  if (cleanKey) {
    localStorage.setItem('pg_supabase_anon_key', cleanKey);
  } else {
    localStorage.removeItem('pg_supabase_anon_key');
  }
  
  currentConfig = getInitialConfig();
  currentClient = createClient(currentConfig.url, currentConfig.key);
  
  return currentConfig;
};
