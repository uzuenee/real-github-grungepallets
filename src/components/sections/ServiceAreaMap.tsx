const serviceAreas = [
    'Atlanta',
    'Marietta',
    'Alpharetta',
    'Roswell',
    'Sandy Springs',
    'Decatur',
    'Kennesaw',
    'Douglasville',
    'Carrollton',
    'Newnan',
    'Peachtree City',
    'Lawrenceville',
];

export function ServiceAreaMap() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="section-heading text-secondary mb-4">
                        Serving Metro Atlanta & West Georgia
                    </h2>
                    <p className="text-lg text-secondary-300 max-w-2xl mx-auto">
                        Same-week delivery to businesses throughout the greater Atlanta area
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Google Maps Embed */}
                    <div className="aspect-[4/3] bg-secondary-50 rounded-2xl overflow-hidden shadow-lg">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3322.7689!2d-84.8434!3d33.7296!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88f4e1c4c4c4c4c4%3A0x0!2s1925%20Jason%20Industrial%20Pkwy%2C%20Winston%2C%20GA%2030187!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Grunge Pallets Location - 1925 Jason Industrial Parkway, Winston, GA 30187"
                        />
                    </div>

                    {/* Service Areas List */}
                    <div>
                        <h3 className="text-xl font-bold text-secondary mb-6">
                            Areas We Serve
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {serviceAreas.map((area) => (
                                <div
                                    key={area}
                                    className="flex items-center gap-2 text-secondary-400"
                                >
                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                    <span>{area}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <p className="text-secondary-500 text-sm">
                                <strong className="text-secondary">Don&apos;t see your area?</strong> Contact us—we may still be able to serve you.
                                We&apos;re always expanding our coverage to meet customer demand.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
