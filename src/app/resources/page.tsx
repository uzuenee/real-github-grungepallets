'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { PageHero } from '@/components/sections';
import { ArticleCard } from '@/components/ui';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ARTICLES, ARTICLE_CATEGORIES } from '@/lib/articles';
import { FileText, Filter } from 'lucide-react';

export default function ResourcesPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Filter articles based on selected category
    const filteredArticles = selectedCategory === 'All'
        ? ARTICLES
        : ARTICLES.filter(a => a.category === selectedCategory);

    // Get featured article (most recent)
    const featuredArticle = ARTICLES[0];
    const remainingArticles = selectedCategory === 'All'
        ? ARTICLES.slice(1)
        : filteredArticles.filter(a => a.slug !== featuredArticle.slug);

    return (
        <MainLayout>
            {/* Hero Section */}
            <div className="bg-secondary pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    <div className="mb-8">
                        <Breadcrumbs items={[{ label: 'Resources' }]} />
                    </div>

                    <div className="max-w-3xl">
                        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
                            Industry Resources
                        </h1>
                        <p className="text-xl text-secondary-300">
                            Expert guides, sustainability reports, and insights to help you
                            make informed decisions about pallet management and recycling.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <section className="py-12 bg-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Category Filters */}
                    <div className="flex flex-wrap items-center gap-3 mb-10">
                        <Filter size={18} className="text-secondary-400" />
                        {ARTICLE_CATEGORIES.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-white text-secondary-500 hover:bg-secondary-50 border border-secondary-100'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Featured Article (only when showing All) */}
                    {selectedCategory === 'All' && (
                        <div className="mb-12">
                            <h2 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-primary" />
                                Featured Article
                            </h2>
                            <ArticleCard article={featuredArticle} featured />
                        </div>
                    )}

                    {/* Articles Grid */}
                    <div>
                        <h2 className="text-lg font-semibold text-secondary mb-4">
                            {selectedCategory === 'All' ? 'More Articles' : `${selectedCategory} Articles`}
                        </h2>

                        {remainingArticles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {remainingArticles.map((article) => (
                                    <ArticleCard key={article.slug} article={article} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-secondary-100">
                                <FileText size={48} className="mx-auto text-secondary-200 mb-4" />
                                <p className="text-secondary-400">No articles in this category yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Stats Section */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl p-6 text-center border border-secondary-100">
                            <div className="text-3xl font-bold text-primary mb-1">{ARTICLES.length}</div>
                            <div className="text-sm text-secondary-400">Articles</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 text-center border border-secondary-100">
                            <div className="text-3xl font-bold text-primary mb-1">{ARTICLE_CATEGORIES.length - 1}</div>
                            <div className="text-sm text-secondary-400">Categories</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 text-center border border-secondary-100">
                            <div className="text-3xl font-bold text-primary mb-1">
                                {ARTICLES.reduce((acc, a) => acc + (a.readingTime || 0), 0)}
                            </div>
                            <div className="text-sm text-secondary-400">Minutes of Reading</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 text-center border border-secondary-100">
                            <div className="text-3xl font-bold text-primary mb-1">Weekly</div>
                            <div className="text-sm text-secondary-400">New Content</div>
                        </div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
