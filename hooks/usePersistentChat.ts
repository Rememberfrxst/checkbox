
import { useState, useCallback } from 'react';

// Web search integration removed — provide a stable no-op hook API so existing imports don't break
export function useWebSearchState() {
  const noop = useCallback(() => {}, []);
  return {
    isWebSearchEnabled: false,
    isSearching: false,
    toggleWebSearch: noop,
    setSearching: noop,
    resetSearchState: noop,
    // backward compatibility aliases
    isActive: false,
    activateSearch: noop,
    deactivateSearch: noop,
  } as const;
}
