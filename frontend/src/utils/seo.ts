/**
 * SEO Utility for dynamic metadata and structured schemas injection
 */

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: string;
  structuredData?: Record<string, any>;
}

export const setSEOMetadata = ({
  title,
  description,
  keywords = 'coding practice, learn programming, code brainz, python practice, java compiler, online ide',
  canonicalUrl,
  ogType = 'website',
  structuredData,
}: SEOProps) => {
  // 1. Set Title
  document.title = `${title} | CodeBrainzX`;

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

  // 4. Set Open Graph Title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.setAttribute('content', title);

  // 5. Set Open Graph Description
  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (!ogDesc) {
    ogDesc = document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    document.head.appendChild(ogDesc);
  }
  ogDesc.setAttribute('content', description);

  // 6. Set Open Graph Type
  let ogTypeMeta = document.querySelector('meta[property="og:type"]');
  if (!ogTypeMeta) {
    ogTypeMeta = document.createElement('meta');
    ogTypeMeta.setAttribute('property', 'og:type');
    document.head.appendChild(ogTypeMeta);
  }
  ogTypeMeta.setAttribute('content', ogType);

  // 7. Canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (canonicalUrl) {
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);
  } else if (canonical) {
    canonical.remove();
  }

  // 8. Inject Structured Schema (JSON-LD)
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
      'name': 'CodeBrainzX',
      'sameAs': window.location.origin,
    },
    'url': url,
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
