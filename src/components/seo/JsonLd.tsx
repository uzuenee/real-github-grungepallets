// JSON-LD structured data components for SEO
import { Article } from '@/components/ui/ArticleCard';

interface ArticleJsonLdProps {
    article: Article;
    url: string;
}

export function ArticleJsonLd({ article, url }: ArticleJsonLdProps) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        datePublished: article.date,
        dateModified: article.date,
        author: {
            '@type': 'Organization',
            name: article.author || 'Grunge Pallets Team',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Grunge Pallets & Recycling Services',
            logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://grungepallets.com'}/logo.png`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

interface BreadcrumbJsonLdProps {
    items: { name: string; url: string }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

interface OrganizationJsonLdProps {
    name?: string;
    url?: string;
}

export function OrganizationJsonLd({
    name = 'Grunge Pallets & Recycling Services',
    url = 'https://grungepallets.com'
}: OrganizationJsonLdProps) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name,
        url,
        logo: `${url}/logo.png`,
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+1-770-934-8248',
            contactType: 'customer service',
        },
        sameAs: [],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
