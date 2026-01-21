import Link from 'next/link';
import Image from 'next/image';
import { Badge, Button } from '@/components/ui';
import { Package } from 'lucide-react';

// Use database product type directly
interface DbProduct {
    id: string;
    name: string;
    size: string;
    dimensions: string;
    is_heat_treated: boolean;
    image_url?: string;
    category_label?: string;
}

interface ProductCardProps {
    product: DbProduct;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="bg-white rounded-xl border border-secondary-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
            {/* Image or Placeholder */}
            <div className="aspect-square bg-secondary-50 flex flex-col items-center justify-center relative">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                ) : (
                    <>
                        <Package size={48} className="text-secondary-200 mb-2" strokeWidth={1} />
                        <span className="text-secondary-300 text-sm font-medium">{product.dimensions}</span>
                    </>
                )}

                {/* Heat Treated Badge */}
                {product.is_heat_treated && (
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

                {/* Specs List - Only real database fields */}
                <ul className="space-y-2 mb-5 text-sm">
                    {product.category_label && (
                        <li className="flex justify-between text-secondary-400">
                            <span>Category:</span>
                            <span className="font-medium text-secondary">{product.category_label}</span>
                        </li>
                    )}
                    <li className="flex justify-between text-secondary-400">
                        <span>Dimensions:</span>
                        <span className="font-medium text-secondary">{product.dimensions}</span>
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