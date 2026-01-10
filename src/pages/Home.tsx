import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout';
import {
  Hero,
  ValueProps,
  SustainabilityScore,
  ServicesPreview,
  ProductsPreview,
  TrustLogos,
  CtaBanner,
} from '@/components/sections';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Grunge Pallets & Recycling Services | Metro Atlanta Pallet Solutions</title>
        <meta name="description" content="Quality pallet supply, recycling, and logistics services for Metro Atlanta businesses. Grade A & B pallets with same-week delivery. Get your free quote today." />
      </Helmet>
      <MainLayout>
        <Hero />
        <ValueProps />
        <SustainabilityScore />
        <ServicesPreview />
        <ProductsPreview />
        <TrustLogos />
        <CtaBanner />
      </MainLayout>
    </>
  );
}
