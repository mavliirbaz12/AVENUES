import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPath = useRef(null);

  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    const forceScrollTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      // Find any scrollable wrappers and reset them too
      document.querySelectorAll('[data-scroll-container]').forEach(el => {
        el.scrollTop = 0;
      });
    };

    // Fire immediately — before paint
    forceScrollTop();

    // Fire after first paint
    requestAnimationFrame(() => {
      forceScrollTop();
      // Fire one more time after layout settles
      requestAnimationFrame(() => forceScrollTop());
    });

    // Belt-and-suspenders fallback for slow pages
    const t1 = setTimeout(forceScrollTop, 50);
    const t2 = setTimeout(forceScrollTop, 150);
    const t3 = setTimeout(forceScrollTop, 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  return null;
}
