import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout';
import { PageHero } from '@/components/sections';
import { QuoteForm } from '@/components/forms';

export default function Quote() {
  return (
    <>
      <Helmet>
        <title>Get a Quote | Grunge Pallets & Recycling Services</title>
        <meta name="description" content="Request a custom quote for pallet supply or schedule a free pickup for pallet recycling. Same-week delivery across Metro Atlanta." />
      </Helmet>
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
    </>
  );
}
