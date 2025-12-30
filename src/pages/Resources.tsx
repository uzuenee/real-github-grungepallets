import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout';
import { PageHero } from '@/components/sections';
import { ArticleCard } from '@/components/ui';
import { ARTICLES } from '@/lib/articles';

export default function Resources() {
  return (
    <>
      <Helmet>
        <title>Industry Resources | Grunge Pallets & Recycling Services</title>
        <meta name="description" content="Expert guides, sustainability reports, and industry insights about pallets, recycling, and supply chain optimization." />
      </Helmet>
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
    </>
  );
}
