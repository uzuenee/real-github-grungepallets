import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui';
import { Article } from '@/components/ui/ArticleCard';

interface ArticleLayoutProps {
    title: string;
    date: string;
    category: string;
    children: React.ReactNode;
    relatedArticles?: Article[];
}

export function ArticleLayout({
    title,
    date,
    category,
    children,
    relatedArticles = []
}: ArticleLayoutProps) {
    return (
        <div className="min-h-screen bg-light">
            {/* Header */}
            <div className="bg-secondary py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        to="/resources"
                        className="inline-flex items-center text-secondary-300 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Resources
                    </Link>

                    <div className="flex items-center gap-4 mb-4">
                        <Badge variant="info">{category}</Badge>
                        <span className="flex items-center text-secondary-300 text-sm">
                            <Calendar size={14} className="mr-2" />
                            {date}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                        {title}
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Article */}
                    <article className="lg:col-span-2">
                        <div className="bg-white rounded-xl p-8 shadow-sm">
                            <div className="prose prose-lg max-w-none prose-headings:text-secondary prose-p:text-secondary-400 prose-a:text-primary prose-strong:text-secondary">
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
                                                to={`/resources/${article.slug}`}
                                                className="block group"
                                            >
                                                <h4 className="font-medium text-secondary group-hover:text-primary transition-colors line-clamp-2">
                                                    {article.title}
                                                </h4>
                                                <p className="text-sm text-secondary-300 mt-1">{article.date}</p>
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
                                    to="/quote"
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