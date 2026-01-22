'use client';

import { MainLayout } from '@/components/layout';
import {
    Hero,
    ValueProps,
    SustainabilityScore,
    ServicesPreview,
    ProductsPreview,
    // TrustLogos, // Temporarily hidden
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
            {/* <TrustLogos /> */}
            <CtaBanner />
        </MainLayout>
    );
}
