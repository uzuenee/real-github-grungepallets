export function TrustLogos() {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <p className="text-secondary-400 font-medium uppercase tracking-wider text-sm">
                        Trusted by Atlanta&apos;s Leading Businesses
                    </p>
                </div>

                {/* Logo Grid */}
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                    {[...Array(6)].map((_, index) => (
                        <div
                            key={index}
                            className="w-[120px] h-[60px] bg-secondary-50 rounded-lg flex items-center justify-center text-secondary-300 text-xs font-medium"
                        >
                            Partner {index + 1}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
