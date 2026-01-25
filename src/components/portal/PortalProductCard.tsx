'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Package, ShoppingCart, Check } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { useCart, CustomSpecs } from '@/lib/contexts/CartContext';

interface PortalProduct {
    id: string;
    name: string;
    size: string;
    dimensions: string;
    price: number;
    inStock: boolean;
    isHeatTreated?: boolean;
    category?: string;
    categoryLabel?: string;
    categoryColor?: string;
    imageUrl?: string;
}

interface PortalProductCardProps {
    product: PortalProduct;
}

// Grade options for custom pallets - fetched from API or defaults
const DEFAULT_GRADE_OPTIONS = [
    { id: 'grade-a', label: 'Grade A' },
    { id: 'grade-b', label: 'Grade B' },
    { id: 'heat-treated', label: 'Heat Treated' },
];

export function PortalProductCard({ product }: PortalProductCardProps) {
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const { addToCart } = useCart();
    const [gradeOptions, setGradeOptions] = useState(DEFAULT_GRADE_OPTIONS);

    const isCustom = product.category === 'custom' || product.id === 'custom-pallet';

    // Fetch grade options from API for custom products
    useEffect(() => {
        if (isCustom) {
            fetch('/api/categories')
                .then(res => res.json())
                .then(data => {
                    if (data.categories) {
                        // Filter out 'custom' category since that's not a grade option
                        const grades = data.categories
                            .filter((c: { id: string }) => c.id !== 'custom')
                            .map((c: { id: string; label: string }) => ({ id: c.id, label: c.label }));
                        if (grades.length > 0) {
                            setGradeOptions(grades);
                        }
                    }
                })
                .catch(() => {
                    // Keep defaults on error
                });
        }
    }, [isCustom]);

    // Custom specs state with grade selection
    const [customSpecs, setCustomSpecs] = useState<CustomSpecs>({
        length: '',
        width: '',
        height: '',
        notes: '',
        gradeType: 'grade-a',
        gradeLabel: 'Grade A',
    });
    const [customError, setCustomError] = useState('');

    const handleAddToCart = () => {
        // Validate custom specs if it's a custom product
        if (isCustom) {
            if (!customSpecs.length || !customSpecs.width) {
                setCustomError('Please enter length and width');
                return;
            }
            if (!customSpecs.gradeType) {
                setCustomError('Please select a grade type');
                return;
            }
            setCustomError('');
        }

        const gradeLabel = customSpecs.gradeLabel || gradeOptions.find(g => g.id === customSpecs.gradeType)?.label || '';

        addToCart(
            {
                productId: product.id,
                productName: isCustom
                    ? `Custom ${gradeLabel} (${customSpecs.length}" × ${customSpecs.width}"${customSpecs.height ? ` × ${customSpecs.height}"` : ''})`
                    : product.name,
                price: isCustom ? 0 : product.price, // TBD pricing for custom
                isCustom,
                customSpecs: isCustom ? customSpecs : undefined,
            },
            quantity
        );
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
        setQuantity(1);
        if (isCustom) {
            setCustomSpecs({
                length: '',
                width: '',
                height: '',
                notes: '',
                gradeType: 'grade-a',
                gradeLabel: 'Grade A',
            });
        }
    };

    const handleGradeChange = (gradeId: string) => {
        const grade = gradeOptions.find(g => g.id === gradeId);
        setCustomSpecs(prev => ({
            ...prev,
            gradeType: gradeId,
            gradeLabel: grade?.label || gradeId,
        }));
    };

    return (
        <div className="bg-white rounded-xl border border-secondary-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
            {/* Product Image */}
            <div className="aspect-[4/3] bg-secondary-50 flex flex-col items-center justify-center relative overflow-hidden">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <>
                        <Package size={48} className="text-secondary-200" strokeWidth={1} />
                        <span className="text-secondary-300 text-sm mt-2">{product.dimensions}</span>
                    </>
                )}

                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <Badge variant={product.inStock ? 'success' : 'warning'}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                    {product.isHeatTreated && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                            🔥 Heat Treated
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="font-bold text-secondary mb-1 group-hover:text-primary transition-colors">
                    {product.name}
                </h3>

                {/* Info Row: Category and Dimensions */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    {product.categoryLabel && (
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded border ${product.categoryColor || 'bg-secondary-100 text-secondary-600 border-secondary-200'}`}>
                            {product.categoryLabel}
                        </span>
                    )}
                    <span className="text-xs text-secondary-400">{product.dimensions}</span>
                </div>

                {/* Price - show TBD for custom */}
                <div className="flex items-baseline gap-1 mb-4">
                    {isCustom ? (
                        <span className="text-lg font-bold text-amber-600">Quote Required</span>
                    ) : (
                        <>
                            <span className="text-2xl font-bold text-primary">
                                ${product.price.toFixed(2)}
                            </span>
                            <span className="text-secondary-400 text-sm">/ unit</span>
                        </>
                    )}
                </div>

                {/* Custom Dimensions Form - only for custom products */}
                {isCustom && (
                    <div className="space-y-3 mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-xs font-medium text-amber-700 mb-2">Configure Your Custom Pallet</p>

                        {/* Grade/Type Selection */}
                        <div>
                            <label className="text-xs text-secondary-500 block mb-1.5">Grade Type *</label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {gradeOptions.map((grade) => (
                                    <button
                                        key={grade.id}
                                        type="button"
                                        onClick={() => handleGradeChange(grade.id)}
                                        className={`
                                            px-2 py-1.5 text-xs rounded-md transition-colors font-medium
                                            ${customSpecs.gradeType === grade.id
                                                ? 'bg-primary text-white'
                                                : 'bg-white border border-secondary-200 text-secondary-600 hover:border-primary'
                                            }
                                        `}
                                    >
                                        {grade.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dimensions */}
                        <div>
                            <label className="text-xs text-secondary-500 block mb-1.5">Dimensions (inches) *</label>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Length"
                                        value={customSpecs.length}
                                        onChange={(e) => setCustomSpecs(prev => ({ ...prev, length: e.target.value }))}
                                        className="w-full px-2 py-1.5 text-sm rounded border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Width"
                                        value={customSpecs.width}
                                        onChange={(e) => setCustomSpecs(prev => ({ ...prev, width: e.target.value }))}
                                        className="w-full px-2 py-1.5 text-sm rounded border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Height"
                                        value={customSpecs.height}
                                        onChange={(e) => setCustomSpecs(prev => ({ ...prev, height: e.target.value }))}
                                        className="w-full px-2 py-1.5 text-sm rounded border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="text-xs text-secondary-500 block mb-1">Special Notes (optional)</label>
                            <textarea
                                placeholder="Any special requirements..."
                                value={customSpecs.notes}
                                onChange={(e) => setCustomSpecs(prev => ({ ...prev, notes: e.target.value }))}
                                rows={2}
                                className="w-full px-2 py-1.5 text-sm rounded border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                        </div>

                        {customError && (
                            <p className="text-xs text-red-500">{customError}</p>
                        )}
                    </div>
                )}

                {/* Quantity Input */}
                <div className="flex items-center gap-3 mb-4">
                    <label className="text-sm text-secondary-400">Qty:</label>
                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-3 py-2 rounded-lg border border-secondary-100 text-center font-medium text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                </div>

                {/* Add to Order Button */}
                <Button
                    variant={isAdded ? 'secondary' : 'primary'}
                    className="w-full"
                    onClick={handleAddToCart}
                >
                    {isAdded ? (
                        <>
                            <Check size={18} className="mr-2" />
                            Added to Order
                        </>
                    ) : (
                        <>
                            <ShoppingCart size={18} className="mr-2" />
                            {isCustom ? 'Request Quote' : 'Add to Order'}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
