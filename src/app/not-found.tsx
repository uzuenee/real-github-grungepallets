import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { Home, ArrowLeft, Search, Phone } from 'lucide-react';

export default function NotFound() {
    return (
        <MainLayout>
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="text-center max-w-lg">
                    {/* 404 Graphic */}
                    <div className="mb-8">
                        <span className="text-8xl sm:text-9xl font-black text-secondary-100">404</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-secondary mb-4">
                        Page Not Found
                    </h1>
                    <p className="text-secondary-400 mb-8">
                        Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
                        Let&apos;s get you back on track.
                    </p>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 p-4 rounded-lg border border-secondary-100 hover:border-primary hover:bg-primary/5 transition-colors"
                        >
                            <Home size={20} className="text-primary" />
                            <span className="font-medium text-secondary">Home</span>
                        </Link>
                        <Link
                            href="/products"
                            className="flex items-center justify-center gap-2 p-4 rounded-lg border border-secondary-100 hover:border-primary hover:bg-primary/5 transition-colors"
                        >
                            <Search size={20} className="text-primary" />
                            <span className="font-medium text-secondary">Products</span>
                        </Link>
                        <Link
                            href="/services"
                            className="flex items-center justify-center gap-2 p-4 rounded-lg border border-secondary-100 hover:border-primary hover:bg-primary/5 transition-colors"
                        >
                            <ArrowLeft size={20} className="text-primary" />
                            <span className="font-medium text-secondary">Services</span>
                        </Link>
                        <Link
                            href="/contact"
                            className="flex items-center justify-center gap-2 p-4 rounded-lg border border-secondary-100 hover:border-primary hover:bg-primary/5 transition-colors"
                        >
                            <Phone size={20} className="text-primary" />
                            <span className="font-medium text-secondary">Contact</span>
                        </Link>
                    </div>

                    {/* Primary Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/">
                            <Button variant="primary" size="lg">
                                Go to Homepage
                            </Button>
                        </Link>
                        <Link href="/quote">
                            <Button variant="outline" size="lg">
                                Get a Quote
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
