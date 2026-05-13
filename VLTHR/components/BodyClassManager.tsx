'use client';

import { useEffect } from 'react';

export function BodyClassManager() {
  useEffect(() => {
    document.body.classList.add(
      'antialiased',
      'bg-black',
      'overflow-hidden',
      'touch-none',
      'select-none'
    );
  }, []);

  return null;
}
