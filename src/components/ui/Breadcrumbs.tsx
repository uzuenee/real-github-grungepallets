import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://grungepallets.com';

    // Build full URLs for JSON-LD
    const jsonLdItems = [
        { name: 'Home', url: siteUrl },
        ...items.map(item => ({
            name: item.label,
            url: item.href ? `${siteUrl}${item.href}` : siteUrl,
        })),
    ];

    return (
        <>
            <BreadcrumbJsonLd items={jsonLdItems} />
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
                <Link
                    href="/"
                    className="flex items-center text-secondary-400 hover:text-primary transition-colors"
                >
                    <Home size={16} />
                </Link>

                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <ChevronRight size={14} className="text-secondary-300" />
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="text-secondary-400 hover:text-primary transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-secondary-500 font-medium">{item.label}</span>
                        )}
                    </div>
                ))}
            </nav>
        </>
    );
}
