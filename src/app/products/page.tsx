'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { PageHero, ProductFilters, ProductGrid, CtaBanner } from '@/components/sections';
import { PRODUCTS } from '@/lib/constants';

export default function ProductsPage() {
    const [activeFilter, setActiveFilter] = useState('all');

    return (
        <MainLayout>
            <PageHero
                title="Our Products"
                subtitle="Quality pallets for every application"
            />
            <ProductFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />
            <ProductGrid products={PRODUCTS} filter={activeFilter} />
            <CtaBanner />
        </MainLayout>
    );
}
