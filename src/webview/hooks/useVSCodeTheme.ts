import { useState, useEffect } from 'react';

type VSCodeTheme = 'light' | 'dark' | 'high-contrast';

export function useVSCodeTheme(): VSCodeTheme {
  const [theme, setTheme] = useState<VSCodeTheme>(() => {
    // Initial detection
    if (document.body.classList.contains('vscode-light')) {
      return 'light';
    }
    if (document.body.classList.contains('vscode-high-contrast')) {
      return 'high-contrast';
    }
    return 'dark';
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const body = document.body;
          if (body.classList.contains('vscode-light')) {
            setTheme('light');
          } else if (body.classList.contains('vscode-high-contrast')) {
            setTheme('high-contrast');
          } else {
            setTheme('dark');
          }
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return theme;
}
