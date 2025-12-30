import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout';
import {
  PageHero,
  ServicesGrid,
  HowItWorks,
  ServicesFAQ,
  CtaBanner,
} from '@/components/sections';

export default function Services() {
  return (
    <>
      <Helmet>
        <title>Our Services | Grunge Pallets & Recycling Services</title>
        <meta name="description" content="Pallet supply, removal, recycling, and logistics services for Metro Atlanta businesses. Same-week delivery, free pickup, and flexible drop trailer options." />
      </Helmet>
      <MainLayout>
        <PageHero
          title="Our Services"
          subtitle="Complete pallet solutions for your business"
        />
        <ServicesGrid />
        <HowItWorks />
        <ServicesFAQ />
        <CtaBanner />
      </MainLayout>
    </>
  );
}
