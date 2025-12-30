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
} from 'lucide-react';
import { MOCK_USER, CART_ITEMS } from '@/lib/portal-data';

interface PortalLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/portal' },
    { icon: Grid3X3, label: 'Shop Catalog', href: '/portal/shop' },
    { icon: ClipboardList, label: 'Order History', href: '/portal/orders' },
    { icon: ShoppingCart, label: 'Cart', href: '/portal/cart', badge: CART_ITEMS.length },
    { icon: Settings, label: 'Account Settings', href: '/portal/settings' },
];

export function PortalLayout({ children }: PortalLayoutProps) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

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
                            Hi, <strong className="text-secondary">{MOCK_USER.companyName}</strong>
                        </span>
                        <Link
                            href="/login"
                            className="flex items-center gap-2 text-secondary-400 hover:text-primary transition-colors"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:inline">Logout</span>
                        </Link>
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
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
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
                                {item.badge && item.badge > 0 && (
                                    <span className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full ${isActive ? 'bg-white text-primary' : 'bg-primary text-white'
                                        }`}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
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
                                        {item.badge && item.badge > 0 && (
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
