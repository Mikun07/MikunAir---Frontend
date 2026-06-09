import { useEffect } from 'react';

const APP_NAME = 'MikunAir';

export function useWindowTitle(pageTitle: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${pageTitle} — ${APP_NAME}`;
    return () => {
      document.title = previous;
    };
  }, [pageTitle]);
}
