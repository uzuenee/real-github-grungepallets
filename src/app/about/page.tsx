import { MainLayout } from '@/components/layout';
import {
    PageHero,
    AboutContent,
    ValuesSection,
    ServiceAreaMap,
    CtaBanner,
} from '@/components/sections';

export const metadata = {
    title: 'About Us | Grunge Pallets & Recycling Services',
    description: 'Learn about Grunge Pallets, Metro Atlanta\'s trusted pallet supply and recycling partner since 2010. Our story, values, and commitment to sustainability.',
};

export default function AboutPage() {
    return (
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
    );
}
