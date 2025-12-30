import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui';

export interface Article {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    image?: string;
}

interface ArticleCardProps {
    article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
    return (
        <article className="bg-white rounded-xl border border-secondary-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
            {/* Image Placeholder */}
            <div className="aspect-video bg-secondary-50 flex items-center justify-center">
                <FileText size={48} className="text-secondary-200" strokeWidth={1} />
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                    <Badge variant="info">{article.category}</Badge>
                    <span className="text-secondary-300 text-sm">{article.date}</span>
                </div>

                <h3 className="text-xl font-bold text-secondary mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                </h3>

                <p className="text-secondary-400 text-sm leading-relaxed mb-4 line-clamp-2">
                    {article.excerpt}
                </p>

                <Link
                    href={`/resources/${article.slug}`}
                    className="inline-flex items-center text-primary font-semibold hover:text-primary-600 transition-colors group/link"
                >
                    Read More
                    <svg
                        className="w-4 h-4 ml-2 transform group-hover/link:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </article>
    );
}
