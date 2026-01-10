import { MainLayout, ArticleLayout } from '@/components/layout';
import { ARTICLES } from '@/lib/articles';

export const metadata = {
    title: '2024 Sustainability Report | Grunge Pallets & Recycling',
    description: 'Explore our 2024 environmental impact report. See how Grunge Pallets is leading sustainable pallet solutions in Metro Atlanta.',
};

export default function SustainabilityReport2024Page() {
    const relatedArticles = ARTICLES.filter(a => a.slug !== 'sustainability-report-2024').slice(0, 3);

    return (
        <MainLayout>
            <ArticleLayout
                title="2024 Sustainability Report: Our Environmental Impact"
                date="December 10, 2024"
                category="Sustainability"
                relatedArticles={relatedArticles}
            >
                <p className="text-xl text-secondary-400 mb-8">
                    At Grunge Pallets & Recycling Services, sustainability isn&apos;t just a buzzword—it&apos;s
                    the foundation of our business. Here&apos;s a comprehensive look at our environmental
                    impact over the past year.
                </p>

                <h2>2024 By the Numbers</h2>
                <p>
                    Our commitment to sustainable pallet solutions has delivered measurable results:
                </p>
                <ul>
                    <li><strong>89,000+ pallets</strong> recycled and diverted from landfills</li>
                    <li><strong>12,450 trees</strong> saved through our recycling programs</li>
                    <li><strong>234 tons</strong> of CO2 emissions prevented</li>
                    <li><strong>500+ businesses</strong> partnered in our sustainability initiatives</li>
                </ul>

                <h2>Our Recycling Process</h2>
                <p>
                    Every pallet that enters our facility goes through a comprehensive assessment process:
                </p>
                <ol>
                    <li><strong>Inspection:</strong> Each pallet is evaluated for structural integrity</li>
                    <li><strong>Repair:</strong> Pallets with minor damage are repaired and returned to service</li>
                    <li><strong>Recycling:</strong> Non-repairable pallets are broken down for component reuse</li>
                    <li><strong>Mulching:</strong> Remaining wood is converted to mulch and biomass fuel</li>
                </ol>
                <p>
                    This zero-waste approach ensures that 100% of the materials we collect are put to
                    productive use.
                </p>

                <h2>Carbon Footprint Reduction</h2>
                <p>
                    The pallet industry has a significant environmental footprint, but recycling dramatically
                    reduces impact. According to industry studies:
                </p>
                <ul>
                    <li>Recycling one pallet saves approximately 3.5 board feet of lumber</li>
                    <li>Each recycled pallet prevents roughly 5.8 lbs of CO2 emissions</li>
                    <li>Pallet repair uses 85% less energy than manufacturing new pallets</li>
                </ul>

                <h2>Supporting Local Sustainability</h2>
                <p>
                    As a Metro Atlanta-based company, we&apos;re proud to contribute to our community&apos;s
                    environmental goals. Our initiatives include:
                </p>
                <ul>
                    <li>Partnering with local businesses on pallet recycling programs</li>
                    <li>Providing free pickup services to reduce transportation emissions</li>
                    <li>Converting biomass to local mulch and landscaping products</li>
                    <li>Supporting Atlanta&apos;s waste diversion targets</li>
                </ul>

                <h2>Looking Ahead: 2025 Goals</h2>
                <p>
                    We&apos;re committed to continuously improving our environmental performance.
                    Our goals for 2025 include:
                </p>
                <ul>
                    <li>Increase pallet recycling volume by 25%</li>
                    <li>Expand heat treatment capacity for export-ready pallets</li>
                    <li>Introduce electric vehicles to our delivery fleet</li>
                    <li>Launch a customer sustainability certification program</li>
                </ul>

                <h2>Partner With Us</h2>
                <p>
                    Ready to enhance your company&apos;s sustainability credentials? Our pallet recycling
                    and supply programs help businesses reduce waste while optimizing their supply chain.
                    Contact us today to learn how we can help you achieve your environmental goals.
                </p>
            </ArticleLayout>
        </MainLayout>
    );
}
