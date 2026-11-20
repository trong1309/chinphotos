import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSettings } from '../../hooks/useSettings';

export interface SeoProps {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  type?: 'website' | 'article';
  noindex?: boolean;
}

export const Seo: React.FC<SeoProps> = ({
  title,
  description,
  ogImage,
  canonical,
  jsonLd,
  type = 'website',
  noindex = false,
}) => {
  const { data: settings } = useSettings();

  const siteName = settings?.siteName || 'chinphotos';
  const pageTitle = title
    ? title.toLowerCase().includes(siteName.toLowerCase())
      ? title
      : `${title} | ${siteName}`
    : siteName;
  const pageDescription =
    description ||
    settings?.defaultSeo?.description ||
    settings?.tagline ||
    'Editorial and storytelling photography.';
  const pageOgImage = ogImage || settings?.defaultSeo?.ogImage || settings?.heroImages?.[0] || '/og-default.jpg';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const canonicalUrl = canonical || currentUrl;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* OpenGraph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      {pageOgImage && <meta property="og:image" content={pageOgImage} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {pageOgImage && <meta name="twitter:image" content={pageOgImage} />}

      {/* Structured Data (JSON-LD) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default Seo;
