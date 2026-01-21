import Link from 'next/link';
import { Calendar, Clock, User, BookOpen, Leaf, Lightbulb } from 'lucide-react';
import { Badge, Breadcrumbs } from '@/components/ui';
import { Article } from '@/components/ui/ArticleCard';

interface ArticleLayoutProps {
    title: string;
    date: string;
    category: string;
    readingTime?: number;
    author?: string;
    image?: string;
    children: React.ReactNode;
    relatedArticles?: Article[];
}

// Category colors (same as ArticleCard)
const categoryConfig: Record<string, { bg: string; icon: React.ReactNode }> = {
    Education: { bg: 'from-blue-500 to-blue-600', icon: <BookOpen size={64} className="text-white/30" /> },
    Sustainability: { bg: 'from-green-500 to-green-600', icon: <Leaf size={64} className="text-white/30" /> },
    Guide: { bg: 'from-amber-500 to-amber-600', icon: <Lightbulb size={64} className="text-white/30" /> },
};

export function ArticleLayout({
    title,
    date,
    category,
    readingTime,
    author = 'Grunge Pallets Team',
    image,
    children,
    relatedArticles = []
}: ArticleLayoutProps) {
    const config = categoryConfig[category] || categoryConfig.Education;

    return (
        <div className="min-h-screen bg-light">
            {/* Hero Header */}
            <div className={`relative h-72 sm:h-80 ${!image ? `bg-gradient-to-br ${config.bg}` : 'bg-secondary'}`}>
                {image && (
                    <>
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${image})` }}
                        />
                        <div className="absolute inset-0 bg-secondary/70" />
                    </>
                )}

                {/* Content positioned at bottom */}
                <div className="absolute inset-x-0 bottom-0">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">

                        {/* Breadcrumbs */}
                        <div className="mb-4">
                            <Breadcrumbs
                                items={[
                                    { label: 'Resources', href: '/resources' },
                                    { label: title.length > 40 ? title.substring(0, 40) + '...' : title }
                                ]}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <Badge variant="info">{category}</Badge>
                            <span className="flex items-center text-white/80 text-sm">
                                <Calendar size={14} className="mr-2" />
                                {date}
                            </span>
                            {readingTime && (
                                <span className="flex items-center text-white/80 text-sm">
                                    <Clock size={14} className="mr-2" />
                                    {readingTime} min read
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3 drop-shadow-lg">
                            {title}
                        </h1>

                        {/* Author */}
                        <div className="flex items-center text-white/80 text-sm">
                            <User size={14} className="mr-2" />
                            <span>By {author}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Article */}
                    <article className="lg:col-span-2">
                        <div className="bg-white rounded-xl p-8 shadow-sm">
                            <div className="article-content">
                                {children}
                            </div>
                        </div>
                    </article>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24">
                            {/* Related Articles */}
                            {relatedArticles.length > 0 && (
                                <div className="bg-white rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-secondary mb-4">Related Articles</h3>
                                    <div className="space-y-4">
                                        {relatedArticles.map((article) => (
                                            <Link
                                                key={article.slug}
                                                href={`/resources/${article.slug}`}
                                                className="block group"
                                            >
                                                <h4 className="font-medium text-secondary group-hover:text-primary transition-colors line-clamp-2">
                                                    {article.title}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm text-secondary-300">{article.date}</span>
                                                    {article.readingTime && (
                                                        <span className="text-sm text-secondary-300">• {article.readingTime} min</span>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CTA */}
                            <div className="bg-primary rounded-xl p-6 mt-6 text-white">
                                <h3 className="text-lg font-bold mb-2">Need Pallets?</h3>
                                <p className="text-white/80 text-sm mb-4">
                                    Get a free quote for your pallet needs today.
                                </p>
                                <Link
                                    href="/quote"
                                    className="inline-block bg-white text-primary font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
                                >
                                    Request Quote
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}