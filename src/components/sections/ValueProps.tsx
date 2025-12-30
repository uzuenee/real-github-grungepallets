import { Shield, Truck, Leaf } from 'lucide-react';
import { Card } from '@/components/ui';

const valueProps = [
    {
        icon: Shield,
        title: 'Quality Guaranteed',
        description: 'Every pallet inspected and graded to meet your exact specifications. We stand behind every product we deliver.',
    },
    {
        icon: Truck,
        title: 'Fast & Reliable',
        description: 'Same-week delivery across Metro Atlanta and West Georgia. Flexible scheduling to meet your operational needs.',
    },
    {
        icon: Leaf,
        title: 'Eco-Friendly',
        description: 'Sustainable practices that help your business go green. Reduce waste and lower your environmental footprint.',
    },
];

export function ValueProps() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
                        Why Choose Grunge Pallets?
                    </h2>
                    <p className="text-lg text-secondary-300 max-w-2xl mx-auto">
                        We&apos;re more than just a pallet supplier. We&apos;re your partner in efficiency and sustainability.
                    </p>
                </div>

                {/* Value Props Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {valueProps.map((prop, index) => (
                        <Card key={index} padding="lg" className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                                <prop.icon size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-secondary mb-3">
                                {prop.title}
                            </h3>
                            <p className="text-secondary-300 leading-relaxed">
                                {prop.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
