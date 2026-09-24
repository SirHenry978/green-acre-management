import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useUrlTab = (defaultTab: string, allowedTabs: readonly string[]) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const activeTab = requestedTab && allowedTabs.includes(requestedTab) ? requestedTab : defaultTab;

  const setActiveTab = useCallback((tab: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  return [activeTab, setActiveTab] as const;
};