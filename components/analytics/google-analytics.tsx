import Script from "next/script";

/**
 * Google Analytics 4 with Consent Mode v2 defaults.
 *
 * Defaults: analytics granted, advertising signals denied. A future cookie
 * banner can call `gtag('consent', 'update', { ad_storage: 'granted', ... })`
 * to flip the ad consents on user opt-in.
 *
 * Reads NEXT_PUBLIC_GA_ID at build time. Renders nothing if unset, so
 * preview/local environments without GA stay clean.
 */
export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          // Consent Mode v2 defaults — analytics allowed, ads denied until
          // the user opts in via a future cookie banner.
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'granted',
            wait_for_update: 500
          });
          gtag('js', new Date());
          gtag('config', '${gaId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
