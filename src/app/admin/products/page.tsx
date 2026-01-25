'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, Button } from '@/components/ui';
import {
    Package,
    LogOut,
    Plus,
    Pencil,
    Trash2,
    ArrowLeft,
    Tag,
    DollarSign,
    Ruler,
    CheckCircle,
    XCircle,
    Flame,
    Filter,
    Search,
    X,
    Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Product, Category } from '@/lib/supabase/types';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type AdminProductsTab = 'products' | 'categories';

interface ProductFormData {
    id: string;
    name: string;
    category_id: string;
    length: string;
    width: string;
    height: string;
    price: number;
    in_stock: boolean;
    is_heat_treated: boolean;
    is_protected: boolean;
    sort_order: number;
    image_url: string;
}

interface CategoryFormData {
    id: string;
    label: string;
    description: string;
    color_class: string;
    sort_order: number;
    is_active: boolean;
}

const defaultProductForm: ProductFormData = {
    id: '',
    name: '',
    category_id: '',
    length: '',
    width: '',
    height: '6',
    price: 0,
    in_stock: true,
    is_heat_treated: false,
    is_protected: false,
    sort_order: 0,
    image_url: '',
};

const defaultCategoryForm: CategoryFormData = {
    id: '',
    label: '',
    description: '',
    color_class: 'bg-secondary-100 text-secondary-700 border-secondary-200',
    sort_order: 0,
    is_active: true,
};

const colorOptions = [
    { value: 'bg-green-100 text-green-700 border-green-200', label: 'Green' },
    { value: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Blue' },
    { value: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Orange' },
    { value: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Purple' },
    { value: 'bg-red-100 text-red-700 border-red-200', label: 'Red' },
    { value: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Yellow' },
    { value: 'bg-cyan-100 text-cyan-700 border-cyan-200', label: 'Cyan' },
    { value: 'bg-secondary-100 text-secondary-700 border-secondary-200', label: 'Gray' },
];

// Sortable Category Card Component
interface SortableCategoryProps {
    category: Category;
    productCount: number;
    onEdit: () => void;
    onDelete: () => void;
}

function SortableCategoryItem({ category, productCount, onEdit, onDelete }: SortableCategoryProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto' as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-white rounded-xl border p-4 relative group transition-shadow select-none ${isDragging ? 'shadow-2xl ring-2 ring-primary border-primary' : 'border-secondary-100 hover:shadow-lg'
                }`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg border ${category.color_class}`}>
                    <Tag size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                        title="Edit category"
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        onPointerDown={(e) => e.stopPropagation()}
                        disabled={productCount > 0}
                        className={`p-1.5 rounded transition-colors ${productCount > 0
                            ? 'text-secondary-300 cursor-not-allowed'
                            : 'text-red-500 hover:bg-red-50'
                            }`}
                        title={productCount > 0 ? 'Category has products' : 'Delete category'}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
            <h3 className="font-semibold text-secondary text-lg mb-1">{category.label}</h3>
            {category.description && (
                <p className="text-sm text-secondary-400 mb-2">{category.description}</p>
            )}
            <p className="text-sm text-secondary-500">
                {productCount} product{productCount !== 1 ? 's' : ''}
            </p>
            <div className="mt-3 pt-3 border-t border-secondary-100 flex items-center justify-between">
                <p className="text-xs text-secondary-400 font-mono">ID: {category.id}</p>
                {!category.is_active && (
                    <span className="text-xs text-red-500">Inactive</span>
                )}
            </div>
        </div>
    );
}

export default function AdminProductsPage() {
    const { signOut, profile } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminProductsTab>('products');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'name' | 'category' | 'price-asc' | 'price-desc'>('name');

    // Data state
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [showProductModal, setShowProductModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [productForm, setProductForm] = useState<ProductFormData>(defaultProductForm);
    const [categoryForm, setCategoryForm] = useState<CategoryFormData>(defaultCategoryForm);
    const [saving, setSaving] = useState(false);

    // Fetch data - use public APIs for reading (they have fallback)
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/categories'),
            ]);

            const productsData = await productsRes.json();
            const categoriesData = await categoriesRes.json();

            // Handle potential errors in response
            if (productsData.error) {
                console.error('Products error:', productsData.error);
            }
            if (categoriesData.error) {
                console.error('Categories error:', categoriesData.error);
            }

            setProducts(productsData.products || []);
            setCategories(categoriesData.categories || []);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load data. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // DnD Kit sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Handle category reorder via drag-and-drop
    const handleCategoryDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = categories.findIndex((c) => c.id === active.id);
            const newIndex = categories.findIndex((c) => c.id === over.id);

            // Optimistically update UI
            const newCategories = arrayMove(categories, oldIndex, newIndex);
            setCategories(newCategories);

            // Save new order to database
            try {
                const updates = newCategories.map((cat, index) => ({
                    id: cat.id,
                    sort_order: index,
                }));

                await Promise.all(
                    updates.map((update) =>
                        fetch(`/api/admin/categories/${update.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sort_order: update.sort_order }),
                        })
                    )
                );
            } catch (err) {
                console.error('Failed to save category order:', err);
                // Revert on error
                fetchData();
            }
        }
    }, [categories]);

    // Filter and sort products
    const filteredProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            // Protected products always at bottom
            if (a.is_protected && !b.is_protected) return 1;
            if (!a.is_protected && b.is_protected) return -1;

            switch (sortOrder) {
                case 'category':
                    return a.category_id.localeCompare(b.category_id);
                case 'price-asc':
                    return Number(a.price) - Number(b.price);
                case 'price-desc':
                    return Number(b.price) - Number(a.price);
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

    // Stats
    const totalProducts = products.length;
    const inStockCount = products.filter(p => p.in_stock).length;
    const outOfStockCount = products.filter(p => !p.in_stock).length;
    const heatTreatedCount = products.filter(p => p.is_heat_treated).length;

    const getCategoryColor = (categoryId: string) => {
        const cat = categories.find(c => c.id === categoryId);
        return cat?.color_class || 'bg-secondary-100 text-secondary-700 border-secondary-200';
    };

    const getCategoryLabel = (categoryId: string) => {
        const cat = categories.find(c => c.id === categoryId);
        return cat?.label || categoryId;
    };

    // Product CRUD
    const openAddProduct = () => {
        setEditingProduct(null);
        setProductForm(defaultProductForm);
        setShowProductModal(true);
    };

    const openEditProduct = (product: Product) => {
        setEditingProduct(product);
        // Parse existing dimensions (format: 48" × 40" × 6" or similar)
        let length = '', width = '', height = '6';
        if (product.dimensions) {
            const parts = product.dimensions.replace(/["″'']/g, '').split(/[×xX\s]+/).map(s => s.trim()).filter(Boolean);
            if (parts.length >= 2) {
                length = parts[0];
                width = parts[1];
                if (parts.length >= 3) height = parts[2];
            }
        } else if (product.size) {
            const parts = product.size.replace(/["″'']/g, '').split(/[×xX\s]+/).map(s => s.trim()).filter(Boolean);
            if (parts.length >= 2) {
                length = parts[0];
                width = parts[1];
            }
        }
        setProductForm({
            id: product.id,
            name: product.name,
            category_id: product.category_id || '',
            length,
            width,
            height,
            price: product.price,
            in_stock: product.in_stock,
            is_heat_treated: product.is_heat_treated,
            is_protected: product.is_protected,
            sort_order: product.sort_order,
            image_url: product.image_url || '',
        });
        setShowProductModal(true);
    };

    const saveProduct = async () => {
        setSaving(true);
        try {
            const url = editingProduct
                ? `/api/admin/products/${editingProduct.id}`
                : '/api/admin/products';
            const method = editingProduct ? 'PATCH' : 'POST';

            // Generate size and dimensions strings from L×W×H
            const size = `${productForm.length}" x ${productForm.width}"`;
            const dimensions = `${productForm.length}" × ${productForm.width}" × ${productForm.height}"`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...productForm,
                    size,
                    dimensions,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Failed to save product');
                return;
            }

            await fetchData();
            setShowProductModal(false);
        } catch (err) {
            console.error('Save error:', err);
            alert('Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const deleteProduct = async (product: Product) => {
        if (product.is_protected) {
            alert('This product is protected and cannot be deleted.');
            return;
        }

        if (!confirm(`Delete "${product.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/products/${product.id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Failed to delete product');
                return;
            }

            await fetchData();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete product');
        }
    };

    // Category CRUD
    const openAddCategory = () => {
        setEditingCategory(null);
        setCategoryForm(defaultCategoryForm);
        setShowCategoryModal(true);
    };

    const openEditCategory = (category: Category) => {
        setEditingCategory(category);
        setCategoryForm({
            id: category.id,
            label: category.label,
            description: category.description || '',
            color_class: category.color_class,
            sort_order: category.sort_order,
            is_active: category.is_active,
        });
        setShowCategoryModal(true);
    };

    const saveCategory = async () => {
        setSaving(true);
        try {
            const url = editingCategory
                ? `/api/admin/categories/${editingCategory.id}`
                : '/api/admin/categories';
            const method = editingCategory ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryForm),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Failed to save category');
                return;
            }

            await fetchData();
            setShowCategoryModal(false);
        } catch (err) {
            console.error('Save error:', err);
            alert('Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    const deleteCategory = async (category: Category) => {
        const productCount = products.filter(p => p.category_id === category.id).length;
        if (productCount > 0) {
            alert(`Cannot delete: ${productCount} product(s) are using this category.`);
            return;
        }

        if (!confirm(`Delete category "${category.label}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/categories/${category.id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Failed to delete category');
                return;
            }

            await fetchData();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete category');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto mb-4" />
                    <p className="text-secondary-500">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-secondary-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="text-secondary-400 hover:text-primary transition-colors">
                                <ArrowLeft size={20} />
                            </Link>
                            <Link href="/" className="flex items-center">
                                <Image src="/logo.jpg" alt="Grunge Pallets" width={140} height={40} className="h-10 w-auto" />
                            </Link>
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded">
                                ADMIN
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-secondary-500">
                                {profile?.contact_name}
                            </span>
                            <Button variant="outline" size="sm" onClick={() => {
                                window.location.href = '/login';
                                signOut();
                            }}>
                                <LogOut size={16} className="mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* Page Title */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Product Management</h1>
                        <p className="text-secondary-400 mt-1">Manage your product catalog, pricing, and categories</p>
                    </div>
                    <Button variant="primary" onClick={activeTab === 'products' ? openAddProduct : openAddCategory}>
                        <Plus size={18} className="mr-2" />
                        Add {activeTab === 'products' ? 'Product' : 'Category'}
                    </Button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'products'
                            ? 'bg-primary text-white'
                            : 'bg-white text-secondary-500 hover:bg-secondary-100'
                            }`}
                    >
                        <Package size={20} />
                        Products
                        <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${activeTab === 'products' ? 'bg-white/20' : 'bg-secondary-200'}`}>
                            {totalProducts}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'categories'
                            ? 'bg-primary text-white'
                            : 'bg-white text-secondary-500 hover:bg-secondary-100'
                            }`}
                    >
                        <Tag size={20} />
                        Categories
                        <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${activeTab === 'categories' ? 'bg-white/20' : 'bg-secondary-200'}`}>
                            {categories.length}
                        </span>
                    </button>
                </div>

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card padding="md">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <Package size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-secondary">{totalProducts}</p>
                                        <p className="text-sm text-secondary-400">Total Products</p>
                                    </div>
                                </div>
                            </Card>
                            <Card padding="md">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <CheckCircle size={24} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-secondary">{inStockCount}</p>
                                        <p className="text-sm text-secondary-400">In Stock</p>
                                    </div>
                                </div>
                            </Card>
                            <Card padding="md">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-100 rounded-lg">
                                        <XCircle size={24} className="text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-secondary">{outOfStockCount}</p>
                                        <p className="text-sm text-secondary-400">Out of Stock</p>
                                    </div>
                                </div>
                            </Card>
                            <Card padding="md">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <Flame size={24} className="text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-secondary">{heatTreatedCount}</p>
                                        <p className="text-sm text-secondary-400">Heat Treated</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Filters */}
                        <Card padding="md" className="mb-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-300" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search products by name or ID..."
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter size={18} className="text-secondary-400" />
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="px-4 py-2 pr-8 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm appearance-none bg-white bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                                        className="px-4 py-2 pr-8 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm appearance-none bg-white bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat"
                                    >
                                        <option value="name">Sort: Name (A-Z)</option>
                                        <option value="category">Sort: Category</option>
                                        <option value="price-asc">Sort: Price ↑</option>
                                        <option value="price-desc">Sort: Price ↓</option>
                                    </select>
                                </div>
                            </div>
                        </Card>

                        {/* Products Table */}
                        <Card padding="none" className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-secondary-50">
                                        <tr>
                                            <th className="text-left text-sm font-semibold text-secondary px-6 py-4">Product</th>
                                            <th className="text-left text-sm font-semibold text-secondary px-4 py-4">Category</th>
                                            <th className="text-left text-sm font-semibold text-secondary px-4 py-4">Dimensions</th>
                                            <th className="text-right text-sm font-semibold text-secondary px-4 py-4">Price</th>
                                            <th className="text-center text-sm font-semibold text-secondary px-4 py-4">Stock</th>
                                            <th className="text-center text-sm font-semibold text-secondary px-4 py-4">Flags</th>
                                            <th className="text-center text-sm font-semibold text-secondary px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-secondary-100">
                                        {filteredProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-secondary-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* Product Image Thumbnail */}
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary-100 flex-shrink-0 flex items-center justify-center">
                                                            {product.image_url ? (
                                                                <Image
                                                                    src={product.image_url}
                                                                    alt={product.name}
                                                                    width={40}
                                                                    height={40}
                                                                    className="w-full h-full object-cover"
                                                                    sizes="40px"
                                                                />
                                                            ) : (
                                                                <Package size={18} className="text-secondary-300" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-secondary">{product.name}</p>
                                                            <p className="text-xs text-secondary-400 font-mono">{product.id.slice(0, 8)}...</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-lg border ${getCategoryColor(product.category_id)}`}>
                                                        {getCategoryLabel(product.category_id)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-secondary-500">
                                                    <div className="flex items-center gap-1">
                                                        <Ruler size={14} className="text-secondary-300" />
                                                        {product.dimensions}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <DollarSign size={14} className="text-green-500" />
                                                        <span className="font-semibold text-secondary">{Number(product.price).toFixed(2)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    {product.in_stock ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg">
                                                            <CheckCircle size={12} />
                                                            In Stock
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-lg">
                                                            <XCircle size={12} />
                                                            Out
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {product.is_heat_treated && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-lg" title="Heat Treated">
                                                                <Flame size={12} />
                                                            </span>
                                                        )}
                                                        {!product.is_heat_treated && <span className="text-secondary-300">—</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {!product.is_protected && (
                                                            <button
                                                                onClick={() => openEditProduct(product)}
                                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                                                title="Edit product"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteProduct(product)}
                                                            disabled={product.is_protected}
                                                            className={`p-2 rounded-full transition-colors ${product.is_protected
                                                                ? 'text-secondary-300 cursor-not-allowed'
                                                                : 'text-red-500 hover:bg-red-50'
                                                                }`}
                                                            title={product.is_protected ? 'Protected product' : 'Delete product'}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredProducts.length === 0 && (
                                <div className="text-center py-16">
                                    <Package size={48} className="text-secondary-200 mx-auto mb-4" />
                                    <p className="text-secondary-400">No products found</p>
                                </div>
                            )}
                        </Card>
                        <p className="text-sm text-secondary-400 text-center mt-4">
                            Showing {filteredProducts.length} of {totalProducts} products
                        </p>
                    </>
                )}

                {/* Categories Tab */}
                {activeTab === 'categories' && (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-secondary-500">
                                    Manage product categories that appear in shop filters
                                </p>
                                <p className="text-xs text-secondary-400 mt-1">
                                    Drag and drop to reorder • Order is saved automatically
                                </p>
                            </div>
                        </div>

                        {/* Sortable Categories Grid */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleCategoryDragEnd}
                        >
                            <SortableContext
                                items={categories.map(c => c.id)}
                                strategy={rectSortingStrategy}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {categories.map((category) => {
                                        const productCount = products.filter(p => p.category_id === category.id).length;
                                        return (
                                            <SortableCategoryItem
                                                key={category.id}
                                                category={category}
                                                productCount={productCount}
                                                onEdit={() => openEditCategory(category)}
                                                onDelete={() => deleteCategory(category)}
                                            />
                                        );
                                    })}
                                </div>
                            </SortableContext>
                        </DndContext>

                        <Card padding="md" className="mt-8">
                            <h3 className="font-semibold text-secondary mb-4">Shop Filter Preview</h3>
                            <p className="text-sm text-secondary-400 mb-4">
                                This is how categories appear in the shop catalog filters:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary text-white">
                                    All Products
                                </span>
                                {categories.filter(c => c.is_active).map((cat) => (
                                    <span
                                        key={cat.id}
                                        className="px-3 py-1.5 rounded-full text-sm font-medium bg-secondary-100 text-secondary-600"
                                    >
                                        {cat.label}
                                    </span>
                                ))}
                            </div>
                        </Card>
                    </>
                )}
            </main>

            {/* Product Modal */}
            {
                showProductModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-secondary-100 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-secondary">
                                    {editingProduct ? 'Edit Product' : 'Add Product'}
                                </h2>
                                <button onClick={() => setShowProductModal(false)} className="p-2 hover:bg-secondary-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                {editingProduct && (
                                    <div className="text-xs text-secondary-400 bg-secondary-50 p-2 rounded">
                                        ID: <span className="font-mono">{editingProduct.id}</span>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                        placeholder="Product name"
                                        className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">Category</label>
                                    <select
                                        value={productForm.category_id}
                                        onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">Select category...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">Dimensions (inches)</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs text-secondary-400 mb-1">Length</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={productForm.length}
                                                onChange={(e) => setProductForm({ ...productForm, length: e.target.value })}
                                                placeholder="48"
                                                className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-secondary-400 mb-1">Width</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={productForm.width}
                                                onChange={(e) => setProductForm({ ...productForm, width: e.target.value })}
                                                placeholder="40"
                                                className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-secondary-400 mb-1">Height</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={productForm.height}
                                                onChange={(e) => setProductForm({ ...productForm, height: e.target.value })}
                                                placeholder="6"
                                                className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                    </div>
                                    {productForm.length && productForm.width && (
                                        <p className="text-xs text-secondary-400 mt-2">
                                            Preview:{' '}
                                            <span className="font-medium text-secondary">
                                                {productForm.length}&quot; × {productForm.width}&quot; × {productForm.height || '6'}&quot;
                                            </span>
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">Product Image</label>
                                    <div className="flex items-start gap-4">
                                        {productForm.image_url ? (
                                            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-secondary-200">
                                                <Image
                                                    src={productForm.image_url}
                                                    alt="Product preview"
                                                    fill
                                                    className="object-cover"
                                                    sizes="96px"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setProductForm({ ...productForm, image_url: '' })}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-secondary-200 flex items-center justify-center">
                                                <Package size={24} className="text-secondary-300" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="product-image-upload"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    const formData = new FormData();
                                                    formData.append('file', file);
                                                    formData.append('productId', productForm.id || 'new');

                                                    try {
                                                        const res = await fetch('/api/admin/upload', {
                                                            method: 'POST',
                                                            body: formData,
                                                        });
                                                        const data = await res.json();
                                                        if (res.ok && data.url) {
                                                            setProductForm({ ...productForm, image_url: data.url });
                                                        } else {
                                                            alert(data.error || 'Failed to upload image');
                                                        }
                                                    } catch (err) {
                                                        console.error('Upload error:', err);
                                                        alert('Failed to upload image');
                                                    }
                                                    e.target.value = '';
                                                }}
                                            />
                                            <label
                                                htmlFor="product-image-upload"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg cursor-pointer hover:bg-secondary-200 transition-colors text-sm"
                                            >
                                                <Plus size={16} />
                                                Upload Image
                                            </label>
                                            <p className="text-xs text-secondary-400 mt-2">Max 5MB. JPEG, PNG, WebP, or GIF</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={productForm.in_stock}
                                            onChange={(e) => setProductForm({ ...productForm, in_stock: e.target.checked })}
                                            className="w-4 h-4 text-primary rounded"
                                        />
                                        <span className="text-sm text-secondary">In Stock</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={productForm.is_heat_treated}
                                            onChange={(e) => setProductForm({ ...productForm, is_heat_treated: e.target.checked })}
                                            className="w-4 h-4 text-primary rounded"
                                        />
                                        <span className="text-sm text-secondary">Heat Treated</span>
                                    </label>
                                </div>
                            </div>
                            <div className="border-t border-secondary-100 px-6 py-4 flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowProductModal(false)}>Cancel</Button>
                                <Button variant="primary" onClick={saveProduct} disabled={saving}>
                                    {saving && <Loader2 className="animate-spin mr-2" size={16} />}
                                    {editingProduct ? 'Save Changes' : 'Add Product'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Category Modal */}
            {
                showCategoryModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                            <div className="border-b border-secondary-100 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-secondary">
                                    {editingCategory ? 'Edit Category' : 'Add Category'}
                                </h2>
                                <button onClick={() => setShowCategoryModal(false)} className="p-2 hover:bg-secondary-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">Category ID</label>
                                    <input
                                        type="text"
                                        value={categoryForm.id}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        disabled={!!editingCategory}
                                        placeholder="e.g., economy"
                                        className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary disabled:bg-secondary-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">Label</label>
                                    <input
                                        type="text"
                                        value={categoryForm.label}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, label: e.target.value })}
                                        placeholder="Display name"
                                        className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">Description</label>
                                    <textarea
                                        value={categoryForm.description}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                        placeholder="Optional description"
                                        rows={2}
                                        className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">Color</label>
                                    <select
                                        value={categoryForm.color_class}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, color_class: e.target.value })}
                                        className="w-full px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary"
                                    >
                                        {colorOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <div className={`mt-2 p-2 rounded-lg border text-center text-sm ${categoryForm.color_class}`}>
                                        Preview: {categoryForm.label || 'Category'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={categoryForm.is_active}
                                            onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                                            className="w-4 h-4 text-primary rounded"
                                        />
                                        <span className="text-sm text-secondary">Active (visible in shop)</span>
                                    </label>
                                </div>
                            </div>
                            <div className="border-t border-secondary-100 px-6 py-4 flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
                                <Button variant="primary" onClick={saveCategory} disabled={saving}>
                                    {saving && <Loader2 className="animate-spin mr-2" size={16} />}
                                    {editingCategory ? 'Save Changes' : 'Add Category'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
