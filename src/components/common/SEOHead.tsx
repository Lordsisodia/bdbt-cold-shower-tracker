import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'article',
  publishedTime,
  modifiedTime,
  author = 'BDBT Team',
  section,
  tags = []
}) => {
  // Default values
  const siteTitle = 'BDBT - Better Days, Better Tomorrow';
  const fullTitle = title.includes('BDBT') ? title : `${title} | ${siteTitle}`;
  const defaultImage = '/assets/bdbt-social-preview.png'; // Fallback image
  const currentUrl = url || window.location.href;
  const finalImage = image || defaultImage;
  
  // Clean description (limit to 160 characters for SEO)
  const cleanDescription = description.length > 160 
    ? description.substring(0, 157) + '...' 
    : description;

  // Generate keywords string
  const keywordString = keywords.length > 0 
    ? keywords.join(', ')
    : `${section || 'tips'}, BDBT, better days, better tomorrow, ${tags.join(', ')}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={cleanDescription} />
      <meta name="keywords" content={keywordString} />
      <meta name="author" content={author} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={cleanDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={cleanDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:site" content="@BDBT" />
      <meta name="twitter:creator" content="@BDBT" />

      {/* Article-specific Meta Tags */}
      {type === 'article' && (
        <>
          <meta property="article:author" content={author} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === 'article' ? 'Article' : 'WebPage',
          "headline": title,
          "description": cleanDescription,
          "image": finalImage,
          "url": currentUrl,
          "datePublished": publishedTime,
          "dateModified": modifiedTime || publishedTime,
          "author": {
            "@type": "Organization",
            "name": author,
            "url": "https://bdbt.com"
          },
          "publisher": {
            "@type": "Organization",
            "name": siteTitle,
            "logo": {
              "@type": "ImageObject",
              "url": "/assets/bdbt-logo.png"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": currentUrl
          },
          ...(tags.length > 0 && { "keywords": tags.join(', ') }),
          ...(section && { "articleSection": section })
        })}
      </script>

      {/* Additional Meta Tags for Performance */}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="googlebot" content="index, follow" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    </Helmet>
  );
};

export default SEOHead;