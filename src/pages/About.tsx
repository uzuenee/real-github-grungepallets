import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout';
import {
  PageHero,
  AboutContent,
  ValuesSection,
  ServiceAreaMap,
  CtaBanner,
} from '@/components/sections';

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us | Grunge Pallets & Recycling Services</title>
        <meta name="description" content="Learn about Grunge Pallets, Metro Atlanta's trusted pallet supply and recycling partner since 2010. Our story, values, and commitment to sustainability." />
      </Helmet>
      <MainLayout>
        <PageHero
          title="About Us"
          subtitle="Your trusted partner in pallet solutions since 2010"
        />
        <AboutContent />
        <ValuesSection />
        <ServiceAreaMap />
        <CtaBanner />
      </MainLayout>
    </>
  );
}
