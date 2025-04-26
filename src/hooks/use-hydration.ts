import { useState, useEffect } from 'react';

/**
 * Hook to track hydration state for Zustand persisted stores
 * Useful to prevent redirects before the store has loaded from localStorage
 * @returns boolean indicating if hydration is complete
 */
export function useHydration() {
	const [isHydrated, setIsHydrated] = useState(false);

	// Effect runs once on mount
	useEffect(() => {
		// Adding a small delay ensures the store has time to hydrate
		// from localStorage, even in fast browsers
		const timeout = setTimeout(() => {
			setIsHydrated(true);
		}, 10);

		return () => clearTimeout(timeout);
	}, []);

	return isHydrated;
}
