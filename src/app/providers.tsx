'use client';

import React from 'react';

import { Analytics } from '@vercel/analytics/react';

import { ThemeProvider } from '@/components/theme-provider';

export const Providers: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
      <Analytics />
    </ThemeProvider>
  );
};
