import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_KEY = "nobelhub:scroll-positions";

const readPositions = (): Record<string, number> => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writePositions = (positions: Record<string, number>) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // ignore quota / privacy errors
  }
};

/**
 * Remembers scroll position per route key (pathname + search).
 * - Restores scroll on POP navigation (back/forward).
 * - Scrolls to top on PUSH/REPLACE (fresh navigation).
 * - Saves position on unmount and before unload.
 */
const ScrollRestoration = () => {
  const location = useLocation();
  const navType = useNavigationType();
  const key = location.pathname + location.search;
  const keyRef = useRef(key);

  // Disable browser's native scroll restoration so we control it.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      const previous = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => {
        window.history.scrollRestoration = previous;
      };
    }
  }, []);

  // Save scroll position before navigating away or unloading.
  useEffect(() => {
    keyRef.current = key;

    const save = () => {
      const positions = readPositions();
      positions[keyRef.current] = window.scrollY;
      writePositions(positions);
    };

    window.addEventListener("beforeunload", save);
    return () => {
      save();
      window.removeEventListener("beforeunload", save);
    };
  }, [key]);

  // Restore (or reset) scroll position on route change.
  useEffect(() => {
    const positions = readPositions();
    const saved = positions[key];

    // Wait one frame so the new route's content is rendered.
    const raf = requestAnimationFrame(() => {
      if (navType === "POP" && typeof saved === "number") {
        window.scrollTo(0, saved);
      } else {
        window.scrollTo(0, 0);
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [key, navType]);

  return null;
};

export default ScrollRestoration;
