import { Phone, FileText, Calendar, Truck } from 'lucide-react';

const steps = [
    {
        number: 1,
        icon: Phone,
        title: 'Contact Us',
        description: 'Reach out by phone, email, or our online form. Tell us about your pallet needs.',
    },
    {
        number: 2,
        icon: FileText,
        title: 'Get a Quote',
        description: 'We\'ll provide a customized quote based on your requirements and volume.',
    },
    {
        number: 3,
        icon: Calendar,
        title: 'Schedule',
        description: 'Choose a delivery or pickup time that works for your operations.',
    },
    {
        number: 4,
        icon: Truck,
        title: 'Delivery / Pickup',
        description: 'We handle the logistics. Pallets delivered to your dock or picked up on schedule.',
    },
];

export function HowItWorks() {
    return (
        <section className="py-20 bg-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="section-heading text-secondary mb-4">
                        How It Works
                    </h2>
                    <p className="text-lg text-secondary-300 max-w-2xl mx-auto">
                        Getting started with Grunge Pallets is simple
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={step.number} className="relative text-center">
                            {/* Connector line (hidden on mobile and last item) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-secondary-100" />
                            )}

                            {/* Number circle */}
                            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary text-white text-2xl font-bold mb-6 shadow-lg">
                                {step.number}
                            </div>

                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                                <step.icon size={28} className="text-secondary-400" strokeWidth={1.5} />
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-bold text-secondary mb-2">
                                {step.title}
                            </h3>
                            <p className="text-secondary-400 text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
