/* eslint-disable react/no-danger */

import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NEON | Data Product',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
  <html lang="en">
    <head>
      <title>NEON | Data Product</title>
      <meta name="theme-color" content="#002c77" />
      <link rel="manifest" href="data-products/manifest.json" />
      <link rel="shortcut icon" href="data-products/favicon.ico?201912" />
      <link rel="preconnect" href="https://www.neonscience.org" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        data-meta="drupal-fonts"
        href="data-products/assets/css/drupal-fonts.css"
      />
      <link
        rel="stylesheet"
        data-meta="drupal-theme"
        href="data-products/assets/css/drupal-theme.c12ee9878c2546595e186d8f3917da9c.min.css"
      />
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      {/* <!-- jQuery needed for drupal header --> */}
      <script
        src="https://code.jquery.com/jquery-3.7.1.min.js"
        integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="
        crossOrigin="anonymous"
      ></script>
      {/* <!-- Google Tag Manager --> */}
      <script
        dangerouslySetInnerHTML={{
          __html: 'window.gtmDataLayer = [{ page_category: "Data Product Detail" }];',
        }}>
      </script>
      <script
        dangerouslySetInnerHTML={{
        __html: `(function (w, d, s, l, i) {
          w[l] = w[l] || [];
          w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
          var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s),
            dl = l != "dataLayer" ? "&l=" + l : "";
          j.async = true;
          j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
          f.parentNode.insertBefore(j, f);
        })(window, document, "script", "gtmDataLayer", "GTM-K4S83R2");`,
      }}>
      </script>
      {/* <!-- End Google Tag Manager --> */}
      <script
        dangerouslySetInnerHTML={{
          __html: 'window.NEON_SERVER_DATA = "__NEON_SERVER_DATA__";',
        }}
      ></script>
    </head>
    <body>
      <noscript> You need to enable JavaScript to run this app. </noscript>
      {/* <!-- Google Tag Manager (noscript) --> */}
      <noscript
        ><iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-K4S83R2"
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          title="GTM JavaScript Required"
        ></iframe>
      </noscript>
      {/* <!-- End Google Tag Manager (noscript) --> */}
      <div id="root">{children}</div>
    </body>
  </html>
  );
}
