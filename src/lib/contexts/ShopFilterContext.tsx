'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type SortOption = 'name' | 'category' | 'price-asc' | 'price-desc';
// Make category filter dynamic - can be 'all' or any string ID from database
export type CategoryFilter = string;

interface ShopFilterContextType {
    search: string;
    setSearch: (search: string) => void;
    category: CategoryFilter;
    setCategory: (category: CategoryFilter) => void;
    sort: SortOption;
    setSort: (sort: SortOption) => void;
    heatTreatedOnly: boolean;
    setHeatTreatedOnly: (value: boolean) => void;
}

const ShopFilterContext = createContext<ShopFilterContextType | undefined>(undefined);

// Default categories as fallback (will be overridden by API data in components)
export const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'grade-a', label: 'Grade A' },
    { id: 'grade-b', label: 'Grade B' },
    { id: 'custom', label: 'Custom' },
];

export const sortOptions = [
    { id: 'name', label: 'Name (A-Z)' },
    { id: 'category', label: 'Category' },
    { id: 'price-asc', label: 'Price: Low to High' },
    { id: 'price-desc', label: 'Price: High to Low' },
];

export function ShopFilterProvider({ children }: { children: ReactNode }) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<CategoryFilter>('all');
    const [sort, setSort] = useState<SortOption>('name');
    const [heatTreatedOnly, setHeatTreatedOnly] = useState(false);

    return (
        <ShopFilterContext.Provider
            value={{
                search,
                setSearch,
                category,
                setCategory,
                sort,
                setSort,
                heatTreatedOnly,
                setHeatTreatedOnly,
            }}
        >
            {children}
        </ShopFilterContext.Provider>
    );
}

export function useShopFilter() {
    const context = useContext(ShopFilterContext);
    if (!context) {
        throw new Error('useShopFilter must be used within a ShopFilterProvider');
    }
    return context;
}
