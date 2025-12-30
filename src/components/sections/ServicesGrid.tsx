import { Link } from 'react-router-dom';
import { Package, Recycle, Truck } from 'lucide-react';
import { Card, Button } from '@/components/ui';

const services = [
    {
        icon: Package,
        title: 'Pallet Supply',
        description: 'High-quality new and recycled pallets to meet your warehouse and shipping needs. All pallets are inspected and graded for reliability.',
        features: [
            'GMA 48x40 Grade A & B pallets',
            'Heat-treated (ISPM-15) options',
            'Custom sizes available',
            'Volume discounts',
        ],
        buttonText: 'View Products',
        buttonHref: '/products',
    },
    {
        icon: Recycle,
        title: 'Pallet Removal & Recycling',
        description: 'Free pickup of unwanted pallets from your facility. We handle the recycling so you can focus on your core business.',
        features: [
            'Free scheduled pickups',
            'Same-week service available',
            'Environmentally responsible',
            'Reduces your disposal costs',
        ],
        buttonText: 'Schedule Pickup',
        buttonHref: '/contact?service=removal',
    },
    {
        icon: Truck,
        title: 'Logistics & Drop Trailers',
        description: 'Flexible logistics solutions including drop trailer service for high-volume operations requiring continuous pallet supply.',
        features: [
            '53ft drop trailers available',
            'Up to 600 pallet capacity',
            'Flexible swap schedules',
            'Metro Atlanta coverage',
        ],
        buttonText: 'Learn More',
        buttonHref: '/contact?service=logistics',
    },
];

export function ServicesGrid() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
                        What We Offer
                    </h2>
                    <p className="text-lg text-secondary-300 max-w-2xl mx-auto">
                        Comprehensive pallet solutions from supply to recycling
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <Card key={service.title} padding="lg" className="flex flex-col">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary text-white mb-6">
                                <service.icon size={28} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-secondary mb-3">
                                {service.title}
                            </h3>
                            <p className="text-secondary-400 leading-relaxed mb-6">
                                {service.description}
                            </p>
                            <ul className="space-y-3 mb-8 flex-1">
                                {service.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-secondary-400">
                                        <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link to={service.buttonHref}>
                                <Button variant="outline" className="w-full">
                                    {service.buttonText}
                                </Button>
                            </Link>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}