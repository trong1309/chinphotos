import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { recordPageView } from '../services/settings.service';

export const usePageView = (): void => {
  const location = useLocation();

  useEffect(() => {
    const fullPath = location.pathname + location.search;

    let refType: 'gallery' | 'post' | 'page' = 'page';
    let refId: string | undefined = undefined;

    if (location.pathname.startsWith('/gallery/')) {
      refType = 'gallery';
      refId = location.pathname.split('/')[2];
    } else if (location.pathname.startsWith('/journal/')) {
      refType = 'post';
      refId = location.pathname.split('/')[2];
    }

    recordPageView({
      path: fullPath,
      refType,
      refId,
      referrer: document.referrer || '',
    });
  }, [location.pathname, location.search]);
};

export default usePageView;
