import { RefObject, useEffect } from 'react';

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: () => void,
) {
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [ref, handler]);
}
