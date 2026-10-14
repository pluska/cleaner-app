import { useEffect, useRef } from 'react';

export function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusables = () => Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), [tabindex="0"]'));
    (focusables()[0] ?? dialog).focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); }
      if (event.key === 'Tab') {
        const elements = focusables(), first = elements[0], last = elements[elements.length-1];
        if (!first) {event.preventDefault();dialog.focus();}
        else if (event.shiftKey && (document.activeElement===first || !dialog.contains(document.activeElement))) {event.preventDefault();last.focus();}
        else if (!event.shiftKey && (document.activeElement===last || !dialog.contains(document.activeElement))) {event.preventDefault();first.focus();}
      }
    };
    document.addEventListener('keydown',keyboard);
    return () => {document.removeEventListener('keydown',keyboard);document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus();};
  }, [open]);
  return ref;
}
