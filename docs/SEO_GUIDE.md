# SEO Implementation Guide

## Overview

NextRole implements SEO using Next.js 15's built-in Metadata API, dynamic sitemap generation, and structured data.

## Implementation

### 1. Metadata Management

#### Global Metadata ([src/app/layout.tsx](../src/app/layout.tsx))

Root layout defines site-wide metadata using Next.js Metadata API:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'NextRole - AI Career Strategy Copilot',
    template: '%s | NextRole',
  },
  description: '...',
  keywords: [...],
  robots: {
    index: true,
    follow: true,
    googleBot: { ... },
  },
  openGraph: { ... },
  twitter: { ... },
  alternates: {
    canonical: siteUrl,
  },
};
```

**Key Features:**
- Template-based titles for consistent branding
- Open Graph and Twitter Card metadata for social sharing
- Canonical URLs for duplicate content prevention
- Robot directives for crawl control

#### Page-Specific Metadata

Each route extends or overrides global metadata:

**Home Page ([src/app/page.tsx](../src/app/page.tsx)):**
```typescript
export const metadata: Metadata = {
  title: 'NextRole - AI Career Strategy Copilot',
  description: '...',
  openGraph: {
    title: 'NextRole - AI Career Strategy Copilot',
    description: '...',
  },
};
```

**Upload Page ([src/app/upload/page.tsx](../src/app/upload/page.tsx)):**
```typescript
export const metadata: Metadata = {
  title: 'Upload Resume - NextRole',
  description: '...',
  openGraph: {
    title: 'Upload Resume - NextRole',
    description: '...',
  },
};
```

**Dashboard ([src/app/dashboard/layout.tsx](../src/app/dashboard/layout.tsx)):**
```typescript
export const metadata: Metadata = {
  title: 'Career Dashboard - NextRole',
  description: '...',
  openGraph: {
    title: 'Career Dashboard - NextRole',
    description: '...',
  },
  robots: {
    index: false,
    follow: true,
  },
};
```

**Important:** Title and OpenGraph title must match for consistency across social sharing platforms.

### 2. Structured Data (JSON-LD)

#### Implementation

Reusable JsonLd component ([src/components/JsonLd.tsx](../src/components/JsonLd.tsx)):

```tsx
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

**Usage (Home Page):**
```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'NextRole',
  applicationCategory: 'BusinessApplication',
  description: '...',
  featureList: [...],
};

<JsonLd data={jsonLd} />
```

**Schema Type:** WebApplication (describes the application to search engines)

### 3. Sitemap Generation

#### Dynamic Sitemap ([src/app/sitemap.ts](../src/app/sitemap.ts))

Next.js automatically generates `/sitemap.xml`:

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${siteUrl}/upload`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/dashboard`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];
}
```

**Configuration:**
- `priority`: 1.0 (home) > 0.9 (dashboard) > 0.8 (upload)
- `changeFrequency`: Informs crawlers of update patterns
- Dynamic generation ensures consistency with routes

### 4. Robots.txt

Static file at [public/robots.txt](../public/robots.txt):

```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://my-next-role.vercel.app/sitemap.xml
```

**Purpose:**
- Allow all search engines
- Block API routes from indexing
- Direct crawlers to sitemap

### 5. Semantic HTML

#### Navigation
```tsx
<nav role="navigation" aria-label="Main navigation">
```

#### Main Content
```tsx
<main className="min-h-screen">
```

#### Heading Hierarchy
- One `<h1>` per page
- Logical progression: H1 → H2 → H3 → H4

### 6. Social Sharing

#### Open Graph Tags
- `og:title`, `og:description`, `og:image`
- Defined in page metadata
- Optimized for Facebook, LinkedIn

#### Twitter Cards
- `twitter:card` type: `summary_large_image`
- Platform-specific titles and images
- `twitter:creator` for attribution

## Vercel Deployment

### Security Headers ([vercel.json](../vercel.json))

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "frame-ancestors 'self' https://vishwajeetkondi.vercel.app;" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/sitemap.xml",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=86400, s-maxage=86400" }
      ]
    },
    {
      "source": "/robots.txt",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=86400, s-maxage=86400" }
      ]
    }
  ]
}
```

**Headers Explained:**
- **Content-Security-Policy:** Controls iframe embedding (allows only self and vishwajeetkondi.vercel.app)
- **X-Content-Type-Options:** Prevents MIME-type sniffing attacks
- **X-XSS-Protection:** Enables browser XSS protection
- **Referrer-Policy:** Controls referrer information sent with requests
- **Permissions-Policy:** Disables camera, microphone, and geolocation access
- **Cache-Control:** Optimized caching for static assets (1 year) and SEO files (24 hours)

### Automatic Features

Vercel provides out-of-the-box:
- HTTPS with automatic SSL certificates
- HTTP/2 and HTTP/3 support
- Global Edge CDN
- Image optimization
- Gzip/Brotli compression
- Static asset caching

### Environment Setup

Set in Vercel dashboard:
- `NEXT_PUBLIC_SITE_URL`: Production URL (see [CONFIGURATION.md](./CONFIGURATION.md))
- Redeploy after setting variables

### Verification

Post-deployment checks:
1. `/sitemap.xml` accessible and contains production URLs
2. `/robots.txt` references correct sitemap URL
3. View page source to verify meta tags
4. Test social previews with platform debuggers

## Files Modified

**Source Code:**
- `src/app/layout.tsx` - Global metadata
- `src/app/page.tsx` - Home page metadata + JSON-LD
- `src/app/upload/page.tsx` - Upload page metadata
- `src/app/dashboard/layout.tsx` - Dashboard metadata (noindex)
- `src/app/sitemap.ts` - Dynamic sitemap
- `src/components/JsonLd.tsx` - Structured data component

**Configuration:**
- `public/robots.txt` - Crawler directives
- `vercel.json` - Security headers and caching

**Documentation:**
- `docs/CONFIGURATION.md` - Environment variables
- `docs/TECHNICAL_DETAILS.md` - SEO architecture overview

---

**Configuration:** See [CONFIGURATION.md](./CONFIGURATION.md) for environment variables  
**Architecture:** See [TECHNICAL_DETAILS.md](./TECHNICAL_DETAILS.md) for implementation details
