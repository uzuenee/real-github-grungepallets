import Link from 'next/link';
import { Button } from './Button';
import { Package, ShoppingCart, FileText, Search } from 'lucide-react';

type EmptyStateType = 'products' | 'orders' | 'cart' | 'search' | 'generic';

interface EmptyStateProps {
    type?: EmptyStateType;
    title?: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

const defaultContent: Record<EmptyStateType, { icon: React.ReactNode; title: string; description: string; actionLabel?: string; actionHref?: string }> = {
    products: {
        icon: <Package size={48} />,
        title: 'No Products Found',
        description: 'We couldn\'t find any products matching your criteria. Try adjusting your filters.',
        actionLabel: 'Clear Filters',
    },
    orders: {
        icon: <FileText size={48} />,
        title: 'No Orders Yet',
        description: 'You haven\'t placed any orders yet. Browse our catalog to get started.',
        actionLabel: 'Shop Now',
        actionHref: '/portal/shop',
    },
    cart: {
        icon: <ShoppingCart size={48} />,
        title: 'Your Cart is Empty',
        description: 'Add some items to your cart to get started.',
        actionLabel: 'Browse Products',
        actionHref: '/portal/shop',
    },
    search: {
        icon: <Search size={48} />,
        title: 'No Results Found',
        description: 'We couldn\'t find anything matching your search. Try different keywords.',
    },
    generic: {
        icon: <Package size={48} />,
        title: 'Nothing Here',
        description: 'There\'s nothing to display at the moment.',
    },
};

export function EmptyState({
    type = 'generic',
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
}: EmptyStateProps) {
    const content = defaultContent[type];

    const displayTitle = title || content.title;
    const displayDescription = description || content.description;
    const displayActionLabel = actionLabel || content.actionLabel;
    const displayActionHref = actionHref || content.actionHref;

    return (
        <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary-50 text-secondary-300 mb-6">
                {content.icon}
            </div>
            <h3 className="text-xl font-bold text-secondary mb-2">{displayTitle}</h3>
            <p className="text-secondary-400 max-w-md mx-auto mb-6">{displayDescription}</p>

            {(displayActionLabel && displayActionHref) && (
                <Link href={displayActionHref}>
                    <Button variant="primary">{displayActionLabel}</Button>
                </Link>
            )}

            {(displayActionLabel && onAction && !displayActionHref) && (
                <Button variant="primary" onClick={onAction}>{displayActionLabel}</Button>
            )}
        </div>
    );
}