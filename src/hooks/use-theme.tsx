
'use client';

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';
import { useEffect } from 'react';

function AutoThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme, setTheme } = useNextTheme();

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;

        const checkTime = () => {
             if (theme === 'auto') {
                const hour = new Date().getHours();
                // 7 PM to 7 AM is dark mode
                if (hour >= 19 || hour < 7) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                }
            } else {
                 document.documentElement.classList.remove('light', 'dark');
            }
        };

        if (theme === 'auto') {
            checkTime();
            // Check every minute
            interval = setInterval(checkTime, 60000); 
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [theme, setTheme]);

    return <>{children}</>;
}


export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
        <AutoThemeProvider>
            {children}
        </AutoThemeProvider>
    </NextThemesProvider>
  );
}
