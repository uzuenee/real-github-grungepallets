import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { PortalLayout } from '@/components/layout';
import { PortalProductCard, CartPreview } from '@/components/portal';
import { Card } from '@/components/ui';
import { Search, SlidersHorizontal } from 'lucide-react';
import { WHOLESALE_PRODUCTS } from '@/lib/wholesale-products';
import { CartProvider } from '@/lib/contexts/CartContext';

type SortOption = 'name' | 'price-asc' | 'price-desc';
type CategoryFilter = 'all' | 'grade-a' | 'grade-b' | 'heat-treated' | 'custom';

const categories = [
  { id: 'all', label: 'All Products' },
  { id: 'grade-a', label: 'Grade A' },
  { id: 'grade-b', label: 'Grade B' },
  { id: 'heat-treated', label: 'Heat Treated' },
  { id: 'custom', label: 'Custom' },
];

const sortOptions = [
  { id: 'name', label: 'Name (A-Z)' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
];

function ShopContent() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [sort, setSort] = useState<SortOption>('name');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    let products = [...WHOLESALE_PRODUCTS];
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(searchLower) || p.size.toLowerCase().includes(searchLower));
    }
    if (category !== 'all') {
      if (category === 'heat-treated') {
        products = products.filter(p => p.isHeatTreated);
      } else {
        products = products.filter(p => p.category === category);
      }
    }
    switch (sort) {
      case 'price-asc': products.sort((a, b) => a.price - b.price); break;
      case 'price-desc': products.sort((a, b) => b.price - a.price); break;
      default: products.sort((a, b) => a.name.localeCompare(b.name));
    }
    return products;
  }, [search, category, sort]);

  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary">Shop Catalog</h1>
        <p className="text-secondary-400 mt-1">Browse our wholesale pallet inventory</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Card padding="md" className="sticky top-24">
            <h2 className="font-bold text-secondary mb-4">Filters</h2>
            <div className="mb-6">
              <label className="text-sm font-medium text-secondary-500 mb-2 block">Search</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-300" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              </div>
            </div>
            <div className="mb-6">
              <label className="text-sm font-medium text-secondary-500 mb-2 block">Category</label>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => setCategory(cat.id as CategoryFilter)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === cat.id ? 'bg-primary text-white' : 'text-secondary-500 hover:bg-secondary-50'}`}>{cat.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-500 mb-2 block">Sort By</label>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="w-full px-3 py-2 rounded-lg border border-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                {sortOptions.map((opt) => (<option key={opt.id} value={opt.id}>{opt.label}</option>))}
              </select>
            </div>
          </Card>
        </aside>

        <div className="lg:hidden mb-4">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-secondary-500 font-medium">
            <SlidersHorizontal size={18} />{showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          {showFilters && (
            <Card padding="md" className="mt-4">
              <div className="relative mb-4">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-300" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary-100 text-sm" />
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((cat) => (<button key={cat.id} onClick={() => setCategory(cat.id as CategoryFilter)} className={`px-3 py-1.5 rounded-full text-sm ${category === cat.id ? 'bg-primary text-white' : 'bg-secondary-50 text-secondary-500'}`}>{cat.label}</button>))}
              </div>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="w-full px-3 py-2 rounded-lg border border-secondary-100 text-sm">
                {sortOptions.map((opt) => (<option key={opt.id} value={opt.id}>{opt.label}</option>))}
              </select>
            </Card>
          )}
        </div>

        <div className="flex-1">
          <p className="text-secondary-400 mb-6"><span className="font-semibold text-secondary">{filteredProducts.length}</span> products available</p>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (<PortalProductCard key={product.id} product={product} />))}
            </div>
          ) : (
            <div className="text-center py-16"><p className="text-secondary-400">No products found.</p></div>
          )}
        </div>
      </div>
      <CartPreview />
    </PortalLayout>
  );
}

export default function Shop() {
  return (
    <>
      <Helmet><title>Shop | Grunge Pallets Portal</title></Helmet>
      <CartProvider><ShopContent /></CartProvider>
    </>
  );
}
