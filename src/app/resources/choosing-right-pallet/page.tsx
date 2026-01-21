import { Metadata } from 'next';
import { MainLayout, ArticleLayout } from '@/components/layout';
import { ARTICLES } from '@/lib/articles';
import { ArticleJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
    title: 'How to Choose the Right Pallet | Grunge Pallets Guide',
    description: 'Expert guide on selecting the perfect pallet for your products. Learn about load capacity, wood types, entry points, and more.',
    openGraph: {
        title: 'How to Choose the Right Pallet for Your Products',
        description: 'From load capacity to wood type, learn the key factors for selecting pallets for your shipping needs.',
        type: 'article',
        publishedTime: '2024-12-05',
        authors: ['Grunge Pallets Team'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'How to Choose the Right Pallet',
        description: 'Expert guide to selecting the perfect pallet for your business needs.',
    },
};

export default function ChoosingRightPalletPage() {
    const article = ARTICLES.find(a => a.slug === 'choosing-right-pallet')!;
    const relatedArticles = ARTICLES.filter(a => a.slug !== 'choosing-right-pallet').slice(0, 3);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://grungepallets.com';

    return (
        <MainLayout>
            <ArticleJsonLd
                article={article}
                url={`${siteUrl}/resources/choosing-right-pallet`}
            />
            <ArticleLayout
                title="How to Choose the Right Pallet for Your Products"
                date="December 5, 2024"
                category="Guide"
                readingTime={6}
                author="Grunge Pallets Team"
                relatedArticles={relatedArticles}
            >
                <p className="text-xl text-secondary-400 mb-8">
                    Selecting the right pallet might seem straightforward, but the wrong choice can lead
                    to product damage, shipping delays, and unnecessary costs. Here&apos;s your complete
                    guide to choosing pallets that work for your business.
                </p>

                <h2>Understanding Your Load Requirements</h2>
                <p>
                    The most critical factor in pallet selection is understanding your load requirements:
                </p>
                <ul>
                    <li><strong>Static load:</strong> Weight when stationary (on floor or in racking)</li>
                    <li><strong>Dynamic load:</strong> Weight during movement (on forklifts or pallet jacks)</li>
                    <li><strong>Racking load:</strong> Weight when supported only at the edges</li>
                </ul>
                <p>
                    Always select pallets rated above your maximum load to ensure safety margins.
                </p>

                <h2>Standard Pallet Sizes</h2>
                <p>
                    While custom sizes are available, standard dimensions offer the best availability and pricing:
                </p>
                <ul>
                    <li><strong>GMA/Grocery (48&quot; x 40&quot;):</strong> Most common in North America</li>
                    <li><strong>Drum (48&quot; x 48&quot;):</strong> Ideal for drums and bulk containers</li>
                    <li><strong>Automotive (48&quot; x 45&quot;):</strong> Standard in automotive supply chains</li>
                    <li><strong>Chemical (42&quot; x 42&quot;):</strong> Common in chemical and paint industries</li>
                </ul>

                <h2>Entry Point Considerations</h2>
                <p>
                    Pallets come with different entry configurations:
                </p>
                <ul>
                    <li><strong>4-way entry:</strong> Forklifts can access from all four sides</li>
                    <li><strong>2-way entry:</strong> Access only from two sides (front and back)</li>
                </ul>
                <p>
                    For maximum warehouse flexibility, 4-way entry pallets are generally preferred, even
                    though they cost slightly more.
                </p>

                <h2>Wood Type Selection</h2>
                <p>
                    The type of wood affects durability, weight, and cost:
                </p>
                <ul>
                    <li><strong>Hardwood:</strong> More durable, higher load capacity, heavier</li>
                    <li><strong>Softwood:</strong> Lighter weight, lower cost, good for lighter loads</li>
                    <li><strong>Combo/Mixed:</strong> Balance of strength and cost-effectiveness</li>
                </ul>

                <h2>Heat Treatment (ISPM-15)</h2>
                <p>
                    If you&apos;re shipping internationally, you may need heat-treated pallets that comply
                    with ISPM-15 regulations. These pallets are:
                </p>
                <ul>
                    <li>Heat treated to 56°C for 30 minutes minimum</li>
                    <li>Stamped with the IPPC certification mark</li>
                    <li>Required for most international shipments</li>
                </ul>
                <p>
                    At Grunge Pallets, we offer ISPM-15 certified pallets with same-week availability.
                </p>

                <h2>New vs. Recycled Pallets</h2>
                <p>
                    Both options have their place:
                </p>
                <ul>
                    <li><strong>New pallets:</strong> Consistent quality, ideal for automated systems</li>
                    <li><strong>Recycled pallets:</strong> Cost-effective, environmentally friendly</li>
                </ul>
                <p>
                    Many businesses use new pallets for customer-facing shipments and recycled pallets
                    for internal operations.
                </p>

                <h2>Get Expert Advice</h2>
                <p>
                    Still unsure which pallet is right for your application? Contact our team at
                    Grunge Pallets. With decades of experience serving Metro Atlanta businesses,
                    we can recommend the perfect solution for your specific needs.
                </p>
            </ArticleLayout>
        </MainLayout>
    );
}
