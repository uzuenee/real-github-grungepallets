import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Our Products',
    description: 'Browse our selection of quality wood pallets. Grade A & B pallets, heat treated options, and custom sizes available for Metro Atlanta businesses.',
    openGraph: {
        title: 'Our Products | Grunge Pallets',
        description: 'Quality wood pallets for every application. Browse our selection.',
    },
    twitter: {
        card: 'summary',
        title: 'Pallet Products | Grunge Pallets',
        description: 'Grade A & B pallets, heat treated options, and custom sizes.',
    },
};

export default function ProductsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
