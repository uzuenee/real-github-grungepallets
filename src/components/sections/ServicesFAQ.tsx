import { Accordion } from '@/components/ui/Accordion';

const faqItems = [
    {
        id: 'minimum-order',
        question: 'What is the minimum order quantity for pallets?',
        answer: 'We have no strict minimum order, but we typically recommend ordering at least 50 pallets to optimize delivery costs. For smaller quantities, we can discuss pickup options or combine with other deliveries in your area.',
    },
    {
        id: 'delivery-time',
        question: 'How quickly can you deliver pallets?',
        answer: 'We offer same-week delivery for most orders across Metro Atlanta and West Georgia. For urgent needs, we can often accommodate next-day or even same-day delivery depending on availability and location.',
    },
    {
        id: 'pallet-grades',
        question: 'What is the difference between Grade A and Grade B pallets?',
        answer: 'Grade A pallets are in excellent condition with minimal cosmetic wear and full structural integrity. Grade B pallets may have minor repairs or cosmetic issues but are fully functional for most warehouse and shipping applications. Grade B offers a more economical option without sacrificing reliability.',
    },
    {
        id: 'removal-cost',
        question: 'Is there a cost for pallet removal/pickup?',
        answer: 'In most cases, pallet removal is completely free! We recycle and repurpose the pallets we collect, which allows us to offer this service at no charge. Minimum quantities may apply depending on your location.',
    },
    {
        id: 'custom-pallets',
        question: 'Can you provide custom-sized pallets?',
        answer: 'Yes, we can manufacture custom pallets to your exact specifications. Lead times for custom orders are typically 1-2 weeks depending on the complexity and quantity. Contact us with your dimensions and requirements for a quote.',
    },
];

export function ServicesFAQ() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="section-heading text-secondary mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-lg text-secondary-300">
                        Common questions about our services
                    </p>
                </div>

                {/* FAQ Accordion */}
                <Accordion items={faqItems} />
            </div>
        </section>
    );
}
