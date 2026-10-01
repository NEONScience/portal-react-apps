'use client';

import React from 'react';

import NeonErrorPage from '@neonscience/portal-core-components/components/NeonPage/NeonErrorPage';
import NeonThemeProvider from '@neonscience/portal-core-components/components/Theme/NeonThemeProvider';

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const props = {
    error: {
      message: 'An error occurred. That\'s all we know.',
      stack: error.stack,
    },
    resetErrorBoundary: () => { window.location.reload(); },
  };
  return (
    <html lang="en">
      <head>
        <title>NEON | Error</title>
        <meta name="theme-color" content="#002c77" />
        <link rel="manifest" href="/prototype-datasets/manifest.json" />
        <link rel="shortcut icon" href="/prototype-datasets/favicon.ico?v=201912" />
      </head>
      <body>
        <noscript> You need to enable JavaScript to run this app. </noscript>
        <NeonThemeProvider>
          <NeonErrorPage {...props} />
        </NeonThemeProvider>
      </body>
    </html>
  );
}
