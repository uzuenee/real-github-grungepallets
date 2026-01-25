import { Metadata } from 'next';
import { MainLayout, ArticleLayout } from '@/components/layout';
import { ARTICLES } from '@/lib/articles';
import { ArticleJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
    title: 'Pallet Grades Explained: Grade A vs B vs C | Grunge Pallets',
    description: 'Learn the differences between Grade A, Grade B, and Grade C pallets. Understand which pallet grade is right for your business needs and budget.',
    openGraph: {
        title: 'Pallet Grades Explained: Grade A vs B vs C',
        description: 'Understanding pallet grades helps you choose the right option for your business. Learn about Grade A, B, and C differences.',
        type: 'article',
        publishedTime: '2024-12-15',
        authors: ['Grunge Pallets Team'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Pallet Grades Explained',
        description: 'Learn the differences between Grade A, Grade B, and Grade C pallets.',
    },
};

export default function PalletGradesExplainedPage() {
    const article = ARTICLES.find(a => a.slug === 'pallet-grades-explained')!;
    const relatedArticles = ARTICLES.filter(a => a.slug !== 'pallet-grades-explained').slice(0, 3);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://grungepallets.com';

    return (
        <MainLayout>
            <ArticleJsonLd
                article={article}
                url={`${siteUrl}/resources/pallet-grades-explained`}
            />
            <ArticleLayout
                title="Pallet Grades Explained: Grade A vs Grade B vs Grade C"
                date="December 15, 2024"
                category="Education"
                readingTime={5}
                author="Grunge Pallets Team"
                image={article.image}
                relatedArticles={relatedArticles}
            >
                <p className="text-xl text-secondary-400 mb-8">
                    When sourcing pallets for your business, understanding the grading system is essential
                    for making cost-effective decisions without compromising on quality. Here&apos;s everything
                    you need to know about pallet grades.
                </p>

                <h2>What is Pallet Grading?</h2>
                <p>
                    Pallet grading is an industry-standard system used to categorize pallets based on their
                    physical condition, structural integrity, and overall appearance. While grading criteria
                    can vary slightly between suppliers, most follow similar guidelines established by
                    industry organizations.
                </p>

                <h2>Grade A Pallets</h2>
                <p>
                    <strong>Grade A pallets</strong> are the highest quality option available. These pallets
                    are in excellent condition with minimal signs of wear and no broken or missing boards.
                    They&apos;ve typically only been used once or twice and maintain their original structural
                    integrity.
                </p>
                <p><strong>Best for:</strong></p>
                <ul>
                    <li>Retail displays and customer-facing applications</li>
                    <li>Export shipments requiring pristine presentation</li>
                    <li>Food and pharmaceutical industries with strict standards</li>
                    <li>Automated warehousing systems requiring consistent dimensions</li>
                </ul>

                <h2>Grade B Pallets</h2>
                <p>
                    <strong>Grade B pallets</strong> show moderate signs of use but remain fully functional.
                    They may have minor cosmetic imperfections, slight discoloration, or repaired boards.
                    However, all structural elements are sound, and they meet standard load capacity requirements.
                </p>
                <p><strong>Best for:</strong></p>
                <ul>
                    <li>Warehouse storage and internal logistics</li>
                    <li>B2B shipments where appearance is secondary</li>
                    <li>Manufacturing facilities with standard pallet requirements</li>
                    <li>Cost-conscious operations without compromising safety</li>
                </ul>

                <h2>Grade C Pallets</h2>
                <p>
                    <strong>Grade C pallets</strong> show significant wear but are still structurally sound
                    for lighter loads. They may have multiple repairs, staining, or weathering. These pallets
                    are ideal for single-use applications or situations where appearance doesn&apos;t matter.
                </p>
                <p><strong>Best for:</strong></p>
                <ul>
                    <li>One-way shipments</li>
                    <li>Internal facility transfers</li>
                    <li>Storage of non-perishable goods</li>
                    <li>Budget-constrained operations</li>
                </ul>

                <h2>Load Capacity by Grade</h2>
                <p>
                    Generally speaking, load capacities decrease as you move down the grading scale:
                </p>
                <ul>
                    <li><strong>Grade A:</strong> 2,500 lbs or higher dynamic load</li>
                    <li><strong>Grade B:</strong> 2,000-2,500 lbs dynamic load</li>
                    <li><strong>Grade C:</strong> 1,500-2,000 lbs dynamic load</li>
                </ul>

                <h2>Making the Right Choice</h2>
                <p>
                    The best grade for your business depends on your specific application, industry requirements,
                    and budget. Many businesses use a combination—Grade A for customer-facing shipments and
                    Grade B for internal operations.
                </p>
                <p>
                    At Grunge Pallets, we offer both Grade A and Grade B pallets with same-week delivery across
                    Metro Atlanta. Contact us to discuss which option is right for your needs.
                </p>
            </ArticleLayout>
        </MainLayout>
    );
}
