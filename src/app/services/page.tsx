import { Metadata } from 'next';
import { MainLayout } from '@/components/layout';
import {
    PageHero,
    ServicesGrid,
    HowItWorks,
    ServicesFAQ,
    CtaBanner,
} from '@/components/sections';

export const metadata: Metadata = {
    title: 'Our Services',
    description: 'Pallet supply, removal, recycling, and logistics services for Metro Atlanta businesses. Same-week delivery, free pickup, and flexible drop trailer options.',
    openGraph: {
        title: 'Our Services | Grunge Pallets',
        description: 'Complete pallet solutions: supply, removal, recycling, and logistics for Metro Atlanta.',
    },
    twitter: {
        card: 'summary',
        title: 'Pallet Services | Grunge Pallets',
        description: 'Same-week delivery, free pickup, and flexible logistics options.',
    },
};

export default function ServicesPage() {
    return (
        <MainLayout>
            <PageHero
                title="Our Services"
                subtitle="Complete pallet solutions for your business"
                backgroundImage="/services_hero.png"
            />
            <ServicesGrid />
            <HowItWorks />
            <ServicesFAQ />
            <CtaBanner />
        </MainLayout>
    );
}
