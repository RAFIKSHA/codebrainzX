/**
 * SEO Utility for dynamic metadata and structured schemas injection
 */

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: string;
  noindex?: boolean;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

const CANONICAL_DOMAIN = 'https://codexpetra.com';

export const setSEOMetadata = ({
  title,
  description,
  keywords = 'coding practice, learn programming, codexpetra, python practice, java compiler, online ide, aptitude preparation, hackathons, test series, interview prep',
  canonicalUrl,
  ogType = 'website',
  noindex = false,
  structuredData,
}: SEOProps) => {
  // 1. Set Title with deduplication check
  if (title.toLowerCase().includes('codexpetra')) {
    document.title = title;
  } else {
    document.title = `${title} | CodexPetra`;
  }

  // 2. Set Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // 3. Set Keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute('content', keywords);

  // 4. Set Robots (Index / Noindex)
  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (!robotsMeta) {
    robotsMeta = document.createElement('meta');
    robotsMeta.setAttribute('name', 'robots');
    document.head.appendChild(robotsMeta);
  }
  robotsMeta.setAttribute('content', noindex ? 'noindex, follow' : 'index, follow');

  // 5. Set Open Graph Title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.setAttribute('content', title);

  // 6. Set Open Graph Description
  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (!ogDesc) {
    ogDesc = document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    document.head.appendChild(ogDesc);
  }
  ogDesc.setAttribute('content', description);

  // 7. Set Open Graph Type
  let ogTypeMeta = document.querySelector('meta[property="og:type"]');
  if (!ogTypeMeta) {
    ogTypeMeta = document.createElement('meta');
    ogTypeMeta.setAttribute('property', 'og:type');
    document.head.appendChild(ogTypeMeta);
  }
  ogTypeMeta.setAttribute('content', ogType);

  // 8. Canonical URL calculation
  const targetCanonical = canonicalUrl 
    ? canonicalUrl 
    : `${CANONICAL_DOMAIN}${window.location.pathname}`;

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', targetCanonical);

  // 9. Open Graph URL
  let ogUrlMeta = document.querySelector('meta[property="og:url"]');
  if (!ogUrlMeta) {
    ogUrlMeta = document.createElement('meta');
    ogUrlMeta.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrlMeta);
  }
  ogUrlMeta.setAttribute('content', targetCanonical);

  // 10. Inject Structured Schema (JSON-LD)
  const schemaId = 'seo-structured-data';
  const existingSchema = document.getElementById(schemaId);
  if (existingSchema) {
    existingSchema.remove();
  }

  if (structuredData) {
    const script = document.createElement('script');
    script.id = schemaId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }
};

/**
 * Generates BreadcrumbList Schema
 */
export const getBreadcrumbSchema = (items: BreadcrumbItem[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url.startsWith('http') ? item.url : `${CANONICAL_DOMAIN}${item.url}`,
    })),
  };
};

/**
 * Generates Course Schema for Topic lists
 */
export const getCourseSchema = (topicName: string, description: string, url: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    'name': topicName,
    'description': description,
    'provider': {
      '@type': 'Organization',
      'name': 'CodexPetra',
      'sameAs': CANONICAL_DOMAIN,
    },
    'url': url.startsWith('http') ? url : `${CANONICAL_DOMAIN}${url}`,
  };
};

/**
 * Generates Question Schema for individual coding exercises
 */
export const getQuestionSchema = (questionName: string, statement: string, topicName: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Question',
    'name': questionName,
    'text': statement,
    'about': {
      '@type': 'Thing',
      'name': topicName,
    },
  };
};

/**
 * Generates Organization Schema
 */
export const getOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'CodexPetra',
    'url': CANONICAL_DOMAIN,
    'logo': `${CANONICAL_DOMAIN}/android-chrome-512x512.png`,
    'sameAs': [
      'https://github.com',
      'https://twitter.com',
      'https://linkedin.com'
    ],
  };
};

/**
 * Generates ContactPage Schema
 */
export const getContactPageSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    'name': 'Contact CodexPetra',
    'description': 'Get in touch with the CodexPetra support and developer relations team.',
    'url': `${CANONICAL_DOMAIN}/contact`,
  };
};
