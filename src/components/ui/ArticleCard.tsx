import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight, BookOpen, Leaf, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui';

export interface Article {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    readingTime?: number;
    author?: string;
    image?: string;
}

interface ArticleCardProps {
    article: Article;
    featured?: boolean;
}

// Category colors and icons
const categoryConfig: Record<string, { bg: string; icon: React.ReactNode }> = {
    Education: { bg: 'from-blue-500 to-blue-600', icon: <BookOpen size={32} className="text-white/80" /> },
    Sustainability: { bg: 'from-green-500 to-green-600', icon: <Leaf size={32} className="text-white/80" /> },
    Guide: { bg: 'from-amber-500 to-amber-600', icon: <Lightbulb size={32} className="text-white/80" /> },
};

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
    const config = categoryConfig[article.category] || categoryConfig.Education;

    if (featured) {
        return (
            <article className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
                <Link href={`/resources/${article.slug}`} className="block">
                    {/* Featured Image Area */}
                    <div className="h-64 relative overflow-hidden">
                        {article.image ? (
                            <Image
                                src={article.image}
                                alt={article.title}
                                fill
                                priority
                                sizes="(min-width: 1024px) 896px, 100vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${config.bg} flex items-center justify-center`}>
                                {config.icon}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Badge variant="info">{article.category}</Badge>
                            <span className="text-secondary-300 text-sm">{article.date}</span>
                            {article.readingTime && (
                                <span className="flex items-center text-secondary-300 text-sm">
                                    <Clock size={14} className="mr-1" />
                                    {article.readingTime} min read
                                </span>
                            )}
                        </div>

                        <h3 className="text-2xl font-bold text-secondary mb-3 group-hover:text-primary transition-colors">
                            {article.title}
                        </h3>

                        <p className="text-secondary-400 leading-relaxed mb-4">
                            {article.excerpt}
                        </p>

                        <span className="inline-flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                            Read Article
                            <ArrowRight size={18} className="ml-2" />
                        </span>
                    </div>
                </Link>
            </article>
        );
    }

    return (
        <article className="bg-white rounded-xl border border-secondary-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
            <Link href={`/resources/${article.slug}`} className="block">
                {/* Article Image */}
                <div className="aspect-video relative overflow-hidden">
                    {article.image ? (
                        <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${config.bg} flex items-center justify-center`}>
                            {config.icon}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Badge variant="info">{article.category}</Badge>
                        {article.readingTime && (
                            <span className="flex items-center text-secondary-300 text-sm">
                                <Clock size={14} className="mr-1" />
                                {article.readingTime} min
                            </span>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-secondary mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                    </h3>

                    <p className="text-secondary-400 text-sm leading-relaxed mb-4 line-clamp-2">
                        {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                        <span className="text-secondary-300 text-sm">{article.date}</span>
                        <span className="inline-flex items-center text-primary font-semibold text-sm">
                            Read More
                            <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </div>
                </div>
            </Link>
        </article>
    );
}
