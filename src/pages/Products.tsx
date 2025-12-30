import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout';
import { PageHero, ProductFilters, ProductGrid, CtaBanner } from '@/components/sections';
import { PRODUCTS } from '@/lib/constants';

export default function Products() {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <>
      <Helmet>
        <title>Our Products | Grunge Pallets & Recycling Services</title>
        <meta name="description" content="Browse our selection of Grade A and Grade B pallets. GMA 48x40, custom sizes, heat-treated options available with same-week delivery." />
      </Helmet>
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
    </>
  );
}
