import Link from 'next/link';
import { Badge, Button } from '@/components/ui';
import { Package } from 'lucide-react';
import { Product } from '@/lib/types';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="bg-white rounded-xl border border-secondary-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
            {/* Image Placeholder */}
            <div className="aspect-square bg-secondary-50 flex flex-col items-center justify-center relative">
                <Package size={48} className="text-secondary-200 mb-2" strokeWidth={1} />
                <span className="text-secondary-300 text-sm font-medium">{product.dimensions}</span>

                {/* Heat Treated Badge */}
                {product.isHeatTreated && (
                    <div className="absolute top-3 right-3">
                        <Badge variant="success">Heat Treated</Badge>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-lg font-bold text-secondary mb-3 group-hover:text-primary transition-colors">
                    {product.name}
                </h3>

                {/* Specs List */}
                <ul className="space-y-2 mb-5 text-sm">
                    <li className="flex justify-between text-secondary-400">
                        <span>Size:</span>
                        <span className="font-medium text-secondary">{product.size}</span>
                    </li>
                    <li className="flex justify-between text-secondary-400">
                        <span>Wood Type:</span>
                        <span className="font-medium text-secondary">{product.woodType}</span>
                    </li>
                    <li className="flex justify-between text-secondary-400">
                        <span>Load Capacity:</span>
                        <span className="font-medium text-secondary">{product.loadCapacity}</span>
                    </li>
                    <li className="flex justify-between text-secondary-400">
                        <span>Entry:</span>
                        <span className="font-medium text-secondary">{product.entryType}</span>
                    </li>
                </ul>

                <Link href={`/quote?product=${product.id}`}>
                    <Button variant="primary" className="w-full">
                        Request Quote
                    </Button>
                </Link>
            </div>
        </div>
    );
}
