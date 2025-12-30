import { MapPin } from 'lucide-react';

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
                    <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
                        Serving Metro Atlanta & West Georgia
                    </h2>
                    <p className="text-lg text-secondary-300 max-w-2xl mx-auto">
                        Same-week delivery to businesses throughout the greater Atlanta area
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Map Placeholder */}
                    <div className="aspect-[4/3] bg-secondary-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary-100 to-secondary-50" />
                        <div className="relative text-center">
                            <MapPin size={64} className="text-primary mx-auto mb-4" strokeWidth={1.5} />
                            <p className="text-secondary-400 font-medium">Service Area Map</p>
                        </div>
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
