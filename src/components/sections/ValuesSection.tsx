import { Shield, Leaf, Handshake } from 'lucide-react';
import { Card } from '@/components/ui';

const values = [
    {
        icon: Shield,
        title: 'Integrity',
        description: 'We stand behind every pallet we deliver. Honest pricing, accurate grading, and transparent communication are the foundation of every customer relationship.',
    },
    {
        icon: Leaf,
        title: 'Sustainability',
        description: 'Environmental responsibility isn\'t just good business—it\'s our obligation. We recycle over 89,000 pallets annually, keeping them out of landfills.',
    },
    {
        icon: Handshake,
        title: 'Partnership',
        description: 'We don\'t just sell pallets; we become part of your supply chain. Your success is our success, and we work tirelessly to help you achieve it.',
    },
];

export function ValuesSection() {
    return (
        <section className="py-20 bg-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
                        Our Core Values
                    </h2>
                    <p className="text-lg text-secondary-300 max-w-2xl mx-auto">
                        The principles that guide everything we do
                    </p>
                </div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {values.map((value) => (
                        <Card key={value.title} padding="lg" className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                                <value.icon size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-secondary mb-3">
                                {value.title}
                            </h3>
                            <p className="text-secondary-300 leading-relaxed">
                                {value.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
