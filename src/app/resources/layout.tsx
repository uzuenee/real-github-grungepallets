import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Industry Resources | Grunge Pallets & Recycling Services',
    description: 'Expert guides, sustainability reports, and industry insights about pallets, recycling, and supply chain optimization.',
    openGraph: {
        title: 'Industry Resources | Grunge Pallets',
        description: 'Expert guides, sustainability reports, and industry insights about pallets, recycling, and supply chain optimization.',
        type: 'website',
    },
};

export default function ResourcesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
