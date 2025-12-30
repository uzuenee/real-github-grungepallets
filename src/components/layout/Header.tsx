'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { NAV_LINKS } from '@/lib/constants';

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when resizing to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    return (
        <>
            <header
                className={`
          sticky top-0 z-50 bg-white transition-shadow duration-300
          ${isScrolled ? 'shadow-lg' : 'shadow-none'}
        `}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center">
                            <span className="text-2xl font-black text-secondary tracking-tight">
                                GRUNGE <span className="text-primary">PALLETS</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-8">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-secondary-400 hover:text-primary font-medium transition-colors duration-200"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Desktop CTAs */}
                        <div className="hidden lg:flex items-center gap-4">
                            <Link
                                href="/login"
                                className="text-secondary-400 hover:text-primary font-medium transition-colors duration-200"
                            >
                                Client Login
                            </Link>
                            <Link href="/quote">
                                <Button variant="primary" size="md">
                                    Get a Quote
                                </Button>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-secondary-500 hover:text-primary transition-colors"
                            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                        >
                            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                className={`
          fixed inset-0 z-40 bg-black/50 lg:hidden
          transition-opacity duration-300
          ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Drawer */}
            <div
                className={`
          fixed top-0 right-0 z-50 h-full w-80 max-w-full bg-white shadow-2xl lg:hidden
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between p-4 border-b border-secondary-100">
                        <span className="text-xl font-black text-secondary">
                            GRUNGE <span className="text-primary">PALLETS</span>
                        </span>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 text-secondary-500 hover:text-primary transition-colors"
                            aria-label="Close menu"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Drawer Navigation */}
                    <nav className="flex-1 overflow-y-auto py-6">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-6 py-4 text-lg text-secondary-500 hover:text-primary hover:bg-light transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Drawer CTAs */}
                    <div className="p-6 border-t border-secondary-100 space-y-4">
                        <Link
                            href="/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-center text-secondary-400 hover:text-primary font-medium py-3"
                        >
                            Client Login
                        </Link>
                        <Link href="/quote" onClick={() => setIsMobileMenuOpen(false)} className="block">
                            <Button variant="primary" size="lg" className="w-full">
                                Get a Quote
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
