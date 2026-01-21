import Link from 'next/link';
import { COMPANY_INFO, NAV_LINKS, SERVICES } from '@/lib/constants';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-secondary text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Column 1: Company Info */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="inline-block mb-4">
                            <img src="/logo.jpg" alt="Grunge Pallets" className="h-12 w-auto" />
                        </Link>
                        <p className="text-secondary-200 leading-relaxed">
                            {COMPANY_INFO.tagline}
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            {NAV_LINKS.slice(0, 4).map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-secondary-200 hover:text-primary transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Services */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Services</h3>
                        <ul className="space-y-3">
                            {SERVICES.map((service) => (
                                <li key={service.id}>
                                    <Link
                                        href={service.href}
                                        className="text-secondary-200 hover:text-primary transition-colors duration-200"
                                    >
                                        {service.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Contact */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Contact Us</h3>
                        <address className="not-italic text-secondary-200 space-y-3">
                            <p>
                                {COMPANY_INFO.address}<br />
                                {COMPANY_INFO.city}, {COMPANY_INFO.state} {COMPANY_INFO.zip}
                            </p>
                            <p>
                                <span>{COMPANY_INFO.phone}</span>
                            </p>
                            <p>
                                <span>{COMPANY_INFO.email}</span>
                            </p>
                        </address>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-secondary-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-secondary-300 text-sm">
                        <p>© {currentYear} {COMPANY_INFO.name}. All rights reserved.</p>
                        <p className="text-center md:text-right">
                            Proudly Serving Metro Atlanta & West Georgia
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}