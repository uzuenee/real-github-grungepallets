// Wholesale product catalog with pricing for portal

export interface WholesaleProduct {
    id: string;
    name: string;
    category: 'grade-a' | 'grade-b' | 'heat-treated' | 'custom';
    size: string;
    dimensions: string;
    price: number;
    inStock: boolean;
    isHeatTreated: boolean;
}

export const WHOLESALE_PRODUCTS: WholesaleProduct[] = [
    {
        id: 'gma-48x40-grade-a',
        name: 'GMA 48x40 Grade A',
        category: 'grade-a',
        size: '48" x 40"',
        dimensions: '48" × 40" × 6"',
        price: 8.50,
        inStock: true,
        isHeatTreated: false,
    },
    {
        id: 'gma-48x40-grade-a-ht',
        name: 'GMA 48x40 Grade A (HT)',
        category: 'grade-a',
        size: '48" x 40"',
        dimensions: '48" × 40" × 6"',
        price: 10.00,
        inStock: true,
        isHeatTreated: true,
    },
    {
        id: 'gma-48x40-grade-b',
        name: 'GMA 48x40 Grade B',
        category: 'grade-b',
        size: '48" x 40"',
        dimensions: '48" × 40" × 6"',
        price: 6.00,
        inStock: true,
        isHeatTreated: false,
    },
    {
        id: 'gma-48x40-grade-b-ht',
        name: 'GMA 48x40 Grade B (HT)',
        category: 'grade-b',
        size: '48" x 40"',
        dimensions: '48" × 40" × 6"',
        price: 7.50,
        inStock: true,
        isHeatTreated: true,
    },
    {
        id: '42x42-grade-a',
        name: '42x42 Grade A',
        category: 'grade-a',
        size: '42" x 42"',
        dimensions: '42" × 42" × 6"',
        price: 9.00,
        inStock: true,
        isHeatTreated: false,
    },
    {
        id: '48x48-grade-a',
        name: '48x48 Grade A',
        category: 'grade-a',
        size: '48" x 48"',
        dimensions: '48" × 48" × 6"',
        price: 10.50,
        inStock: true,
        isHeatTreated: false,
    },
    {
        id: '48x40-block-ht',
        name: '48x40 Block Pallet (HT)',
        category: 'heat-treated',
        size: '48" x 40"',
        dimensions: '48" × 40" × 6"',
        price: 12.00,
        inStock: false,
        isHeatTreated: true,
    },
    {
        id: 'custom-pallet',
        name: 'Custom Size Pallet',
        category: 'custom',
        size: 'Custom',
        dimensions: 'Built to Spec',
        price: 15.00,
        inStock: false,
        isHeatTreated: false,
    },
];

// Helper function to get product by ID
export function getProductById(id: string): WholesaleProduct | undefined {
    return WHOLESALE_PRODUCTS.find(product => product.id === id);
}

// Helper to check if product is custom
export function isCustomProduct(product: WholesaleProduct): boolean {
    return product.category === 'custom' || product.id === 'custom-pallet';
}
