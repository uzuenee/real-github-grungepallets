import { MainLayout } from '@/components/layout';
import { PageHero } from '@/components/sections';
import { QuoteForm } from '@/components/forms';

export const metadata = {
    title: 'Get a Quote | Grunge Pallets & Recycling Services',
    description: 'Request a custom quote for pallet supply or schedule a free pickup for pallet recycling. Same-week delivery across Metro Atlanta.',
};

export default function QuotePage() {
    return (
        <MainLayout>
            <PageHero
                title="Get a Quote"
                subtitle="Tell us about your pallet needs and we'll provide a custom quote"
            />

            <section className="py-16 bg-light">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <QuoteForm />
                </div>
            </section>
        </MainLayout>
    );
}
