import { Link } from 'react-router-dom';
import { Package, Trash2, Truck, LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui';
import { SERVICES } from '@/lib/constants';

const iconMap: Record<string, LucideIcon> = {
    Package,
    Trash2,
    Truck,
};

export function ServicesPreview() {
    return (
        <section id="services" className="py-20 bg-white scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
                        Our Services
                    </h2>
                    <p className="text-lg text-secondary-300 max-w-2xl mx-auto">
                        Comprehensive pallet solutions tailored to your business needs.
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {SERVICES.map((service) => {
                        const Icon = iconMap[service.icon];
                        return (
                            <Card key={service.id} padding="lg" className="group">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-secondary text-white mb-6 group-hover:bg-primary transition-colors duration-300">
                                    {Icon && <Icon size={28} strokeWidth={1.5} />}
                                </div>
                                <h3 className="text-xl font-bold text-secondary mb-3">
                                    {service.title}
                                </h3>
                                <p className="text-secondary-300 leading-relaxed mb-6">
                                    {service.description}
                                </p>
                                <Link
                                    to={service.href}
                                    className="inline-flex items-center text-primary font-semibold hover:text-primary-600 transition-colors group/link"
                                >
                                    Learn More
                                    <svg
                                        className="w-4 h-4 ml-2 transform group-hover/link:translate-x-1 transition-transform"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}