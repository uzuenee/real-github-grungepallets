// Skeleton loading components for UI placeholders

export function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-secondary-100 overflow-hidden animate-pulse">
            {/* Image placeholder */}
            <div className="aspect-[4/3] bg-secondary-100" />

            {/* Content */}
            <div className="p-5 space-y-3">
                <div className="h-5 bg-secondary-100 rounded w-3/4" />
                <div className="h-4 bg-secondary-100 rounded w-1/2" />
                <div className="h-8 bg-secondary-100 rounded w-1/3" />
                <div className="h-10 bg-secondary-100 rounded w-full mt-4" />
            </div>
        </div>
    );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="animate-pulse">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-6 py-4">
                    <div className="h-4 bg-secondary-100 rounded w-full" />
                </td>
            ))}
        </tr>
    );
}

export function DashboardStatSkeleton() {
    return (
        <div className="bg-white rounded-xl p-6 border border-secondary-100 animate-pulse">
            <div className="h-10 bg-secondary-100 rounded w-16 mx-auto mb-2" />
            <div className="h-4 bg-secondary-100 rounded w-24 mx-auto" />
        </div>
    );
}

export function OrderCardSkeleton() {
    return (
        <div className="bg-white rounded-xl p-6 border border-secondary-100 animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="h-5 bg-secondary-100 rounded w-32" />
                <div className="h-6 bg-secondary-100 rounded-full w-20" />
            </div>
            <div className="h-4 bg-secondary-100 rounded w-24 mb-4" />
            <div className="space-y-2 mb-4">
                <div className="h-3 bg-secondary-100 rounded w-full" />
                <div className="h-3 bg-secondary-100 rounded w-3/4" />
            </div>
            <div className="h-8 bg-secondary-100 rounded w-1/3" />
        </div>
    );
}

export function ArticleCardSkeleton() {
    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
            <div className="aspect-video bg-secondary-100" />
            <div className="p-6 space-y-3">
                <div className="h-5 bg-secondary-100 rounded-full w-20" />
                <div className="h-6 bg-secondary-100 rounded w-3/4" />
                <div className="h-4 bg-secondary-100 rounded w-full" />
                <div className="h-4 bg-secondary-100 rounded w-2/3" />
                <div className="flex justify-between mt-4">
                    <div className="h-3 bg-secondary-100 rounded w-24" />
                    <div className="h-3 bg-secondary-100 rounded w-20" />
                </div>
            </div>
        </div>
    );
}

export function FormSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div>
                <div className="h-4 bg-secondary-100 rounded w-20 mb-2" />
                <div className="h-10 bg-secondary-100 rounded w-full" />
            </div>
            <div>
                <div className="h-4 bg-secondary-100 rounded w-24 mb-2" />
                <div className="h-10 bg-secondary-100 rounded w-full" />
            </div>
            <div>
                <div className="h-4 bg-secondary-100 rounded w-16 mb-2" />
                <div className="h-24 bg-secondary-100 rounded w-full" />
            </div>
            <div className="h-12 bg-secondary-100 rounded w-32" />
        </div>
    );
}
