import { MainLayout } from '@/components/layout';
import {
    PageHero,
    ServicesGrid,
    HowItWorks,
    ServicesFAQ,
    CtaBanner,
} from '@/components/sections';

export const metadata = {
    title: 'Our Services | Grunge Pallets & Recycling Services',
    description: 'Pallet supply, removal, recycling, and logistics services for Metro Atlanta businesses. Same-week delivery, free pickup, and flexible drop trailer options.',
};

export default function ServicesPage() {
    return (
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
    );
}
