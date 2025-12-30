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
    <MainLayout>
      <Hero />
      <ValueProps />
      <SustainabilityScore />
      <ServicesPreview />
      <ProductsPreview />
      <TrustLogos />
      <CtaBanner />
    </MainLayout>
  );
}
