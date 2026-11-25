import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 767px)';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 || window.matchMedia(MOBILE_QUERY).matches)
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const updateViewport = () =>
      setIsMobile(window.innerWidth < 768 || mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    window.addEventListener('resize', updateViewport);
    return () => {
      mediaQuery.removeEventListener('change', updateViewport);
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  return isMobile;
}
