interface Category {
    id: string;
    label: string;
}

interface ProductFiltersProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    categories?: Category[];
}

export function ProductFilters({ activeFilter, onFilterChange, categories = [] }: ProductFiltersProps) {
    // Build filters from categories, with "All Products" first
    const filters = [
        { id: 'all', label: 'All Products' },
        ...categories.map(c => ({ id: c.id, label: c.label })),
    ];

    return (
        <section className="py-8 bg-white border-b border-secondary-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => onFilterChange(filter.id)}
                            className={`
                px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200
                ${activeFilter === filter.id
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-secondary-50 text-secondary-500 hover:bg-secondary-100'
                                }
              `}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}