

const milestones = [
    {
        year: '2010',
        title: 'Founded in Atlanta',
        description: 'Started as a small family operation with a single truck and a commitment to quality.',
    },
    {
        year: '2015',
        title: 'Expanded Operations',
        description: 'Opened our first warehouse facility and grew our fleet to serve more Metro Atlanta businesses.',
    },
    {
        year: '2019',
        title: 'Sustainability Focus',
        description: 'Launched our comprehensive recycling program, diverting thousands of pallets from landfills.',
    },
    {
        year: '2024',
        title: 'Industry Leader',
        description: 'Now serving 500+ businesses across Metro Atlanta and West Georgia with same-week delivery.',
    },
];

export function AboutContent() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
                    {/* Text Content */}
                    <div>
                        <h2 className="section-heading text-secondary mb-6">
                            Built on Reliability
                        </h2>
                        <div className="space-y-4 text-secondary-400 leading-relaxed">
                            <p>
                                For over a decade, Grunge Pallets & Recycling Services has been the trusted partner
                                for businesses across Metro Atlanta seeking dependable pallet solutions. What started
                                as a small family operation has grown into one of the region&apos;s most respected
                                pallet suppliers.
                            </p>
                            <p>
                                Our success is built on a simple philosophy: treat every customer like a partner,
                                deliver quality products on time, and always go the extra mile. We understand that
                                your supply chain depends on reliable pallet solutions, and we take that responsibility
                                seriously.
                            </p>
                            <p>
                                Today, we serve over 500 businesses ranging from small warehouses to large distribution
                                centers, providing Grade A and B pallets, recycling services, and flexible logistics
                                solutions tailored to each client&apos;s unique needs.
                            </p>
                        </div>
                    </div>

                    {/* Company Image */}
                    <div className="relative">
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                            <img
                                src="/About_company_team.png"
                                alt="Grunge Pallets team at our warehouse facility"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Decorative accent */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-xl -z-10" />
                    </div>
                </div>

                {/* Timeline */}
                <div className="mt-20">
                    <h3 className="text-2xl font-bold text-secondary mb-12 text-center">Our Journey</h3>
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-secondary-100 transform md:-translate-x-1/2" />

                        <div className="space-y-12">
                            {milestones.map((milestone, index) => (
                                <div
                                    key={milestone.year}
                                    className={`relative flex items-start gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                        }`}
                                >
                                    {/* Dot */}
                                    <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-primary rounded-full transform -translate-x-1/2 mt-1.5 ring-4 ring-white" />

                                    {/* Content */}
                                    <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                                        <span className="inline-block text-primary font-bold text-lg mb-2">
                                            {milestone.year}
                                        </span>
                                        <h4 className="text-xl font-bold text-secondary mb-2">
                                            {milestone.title}
                                        </h4>
                                        <p className="text-secondary-400">
                                            {milestone.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
