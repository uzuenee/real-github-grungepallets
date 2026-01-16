'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Grid3X3,
    ClipboardList,
    ShoppingCart,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    ChevronUp,
    Search,
} from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
    useShopFilter,
    categories as defaultCategories,
    sortOptions,
    SortOption,
} from '@/lib/contexts/ShopFilterContext';
import { Category } from '@/lib/supabase/types';

interface PortalLayoutProps {
    children: React.ReactNode;
}

export function PortalLayout({ children }: PortalLayoutProps) {
    const pathname = usePathname();
    const { profile, signOut } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [showFilters, setShowFilters] = useState(true);
    const [apiCategories, setApiCategories] = useState<Category[]>([]);

    // Check if we're on the shop page
    const isShopPage = pathname === '/portal/shop';

    // Get filter context - will throw if not wrapped, so we handle it
    let shopFilter: ReturnType<typeof useShopFilter> | null = null;
    try {
        shopFilter = useShopFilter();
    } catch {
        // Not wrapped in ShopFilterProvider, which is fine for non-shop pages
    }

    // Sync cart count and subtotal from localStorage
    const [cartSubtotal, setCartSubtotal] = useState(0);

    useEffect(() => {
        const updateCartData = () => {
            try {
                const saved = localStorage.getItem('grunge-pallets-cart');
                if (saved) {
                    const items = JSON.parse(saved);
                    const count = items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
                    const subtotal = items.reduce((sum: number, item: { quantity: number; price: number; isCustom?: boolean }) => {
                        if (item.isCustom) return sum;
                        return sum + (item.price * item.quantity);
                    }, 0);
                    setCartCount(count);
                    setCartSubtotal(subtotal);
                } else {
                    setCartCount(0);
                    setCartSubtotal(0);
                }
            } catch {
                setCartCount(0);
                setCartSubtotal(0);
            }
        };

        updateCartData();
        window.addEventListener('storage', updateCartData);
        const interval = setInterval(updateCartData, 1000);

        return () => {
            window.removeEventListener('storage', updateCartData);
            clearInterval(interval);
        };
    }, []);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/portal' },
        { icon: Grid3X3, label: 'Shop Catalog', href: '/portal/shop' },
        { icon: ClipboardList, label: 'Order History', href: '/portal/orders' },
        { icon: ShoppingCart, label: 'Cart', href: '/portal/cart', badge: cartCount },
        { icon: Settings, label: 'Account Settings', href: '/portal/settings' },
    ];

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fetch categories from API for sidebar filters
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) {
                    const data = await res.json();
                    setApiCategories(data.categories || []);
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            }
        };
        if (isShopPage) {
            fetchCategories();
        }
    }, [isShopPage]);

    // Build categories list for filters
    const categories = apiCategories.length > 0
        ? [{ id: 'all', label: 'All Products' }, ...apiCategories.map(c => ({ id: c.id, label: c.label }))]
        : defaultCategories;

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        // Redirect immediately to prevent flash of fallback text
        window.location.href = '/';
        // Sign out happens after redirect starts
        signOut();
    };

    return (
        <div className="min-h-screen bg-light">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-secondary-100">
                <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                    {/* Left: Logo + Mobile Menu */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden p-2 text-secondary-500 hover:text-primary"
                        >
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <Link href="/portal" className="flex items-center">
                            <span className="text-xl font-black text-secondary">
                                GRUNGE <span className="text-primary">PALLETS</span>
                            </span>
                        </Link>
                    </div>

                    {/* Right: User Info + Logout */}
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:block text-secondary-500">
                            Hi, <strong className="text-secondary">{profile?.company_name || profile?.contact_name || 'User'}</strong>
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-secondary-400 hover:text-primary transition-colors"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Sidebar Overlay (Mobile) */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white border-r border-secondary-100
                    transition-transform duration-300 ease-in-out
                    ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
                `}
            >
                <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)]">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const isShopItem = item.href === '/portal/shop';

                        return (
                            <div key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                                        ${isActive
                                            ? 'bg-primary text-white'
                                            : 'text-secondary-500 hover:bg-secondary-50 hover:text-primary'
                                        }
                                    `}
                                >
                                    <item.icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full ${isActive ? 'bg-white text-primary' : 'bg-primary text-white'
                                            }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                    {isShopItem && isShopPage && shopFilter && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowFilters(!showFilters);
                                            }}
                                            className="ml-auto"
                                        >
                                            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    )}
                                </Link>

                                {/* Shop Filters Dropdown */}
                                {isShopItem && isShopPage && shopFilter && showFilters && (
                                    <div className="mt-2 ml-4 p-3 bg-secondary-50 rounded-lg space-y-4">
                                        {/* Search */}
                                        <div>
                                            <label className="text-xs font-medium text-secondary-500 mb-1.5 block">Search</label>
                                            <div className="relative">
                                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary-300" />
                                                <input
                                                    type="text"
                                                    value={shopFilter.search}
                                                    onChange={(e) => shopFilter.setSearch(e.target.value)}
                                                    placeholder="Search..."
                                                    className="w-full pl-8 pr-3 py-1.5 rounded-md border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                                                />
                                            </div>
                                        </div>

                                        {/* Categories */}
                                        <div>
                                            <label className="text-xs font-medium text-secondary-500 mb-1.5 block">Category</label>
                                            <div className="space-y-1">
                                                {categories.map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => shopFilter.setCategory(cat.id)}
                                                        className={`
                                                            w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors
                                                            ${shopFilter.category === cat.id
                                                                ? 'bg-primary text-white'
                                                                : 'text-secondary-600 hover:bg-secondary-100'
                                                            }
                                                        `}
                                                    >
                                                        {cat.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Heat Treated Toggle */}
                                        <div>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={shopFilter.heatTreatedOnly}
                                                    onChange={(e) => shopFilter.setHeatTreatedOnly(e.target.checked)}
                                                    className="w-4 h-4 text-primary rounded border-secondary-300 focus:ring-primary"
                                                />
                                                <span className="text-xs font-medium text-secondary-600">Heat Treated Only</span>
                                            </label>
                                        </div>

                                        {/* Sort */}
                                        <div>
                                            <label className="text-xs font-medium text-secondary-500 mb-1.5 block">Sort By</label>
                                            <select
                                                value={shopFilter.sort}
                                                onChange={(e) => shopFilter.setSort(e.target.value as SortOption)}
                                                className="w-full px-2.5 py-1.5 rounded-md border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                                            >
                                                {sortOptions.map((opt) => (
                                                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Back to Website */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-100">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-secondary-400 hover:text-primary transition-colors text-sm"
                    >
                        ← Back to main website
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`pt-16 ${isMobile ? 'pl-0' : 'pl-64'}`}>
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            {isMobile && (
                <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-secondary-100 safe-area-pb">
                    <div className="flex items-center justify-around py-2">
                        {navItems.slice(0, 5).map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex flex-col items-center gap-1 px-3 py-2 ${isActive ? 'text-primary' : 'text-secondary-400'
                                        }`}
                                >
                                    <div className="relative">
                                        <item.icon size={20} />
                                        {item.badge !== undefined && item.badge > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs">{item.label.split(' ')[0]}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            )}
        </div>
    );
}