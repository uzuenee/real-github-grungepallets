import { MainLayout } from '@/components/layout';
import { PageHero } from '@/components/sections';
import { ArticleCard } from '@/components/ui';
import { ARTICLES } from '@/lib/articles';

export const metadata = {
    title: 'Industry Resources | Grunge Pallets & Recycling Services',
    description: 'Expert guides, sustainability reports, and industry insights about pallets, recycling, and supply chain optimization.',
};

export default function ResourcesPage() {
    return (
        <MainLayout>
            <PageHero
                title="Industry Resources"
                subtitle="Guides, insights, and best practices for pallet management"
            />

            <section className="py-16 bg-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Articles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {ARTICLES.map((article) => (
                            <ArticleCard key={article.slug} article={article} />
                        ))}
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
