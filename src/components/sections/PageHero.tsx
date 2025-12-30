interface PageHeroProps {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
}

export function PageHero({ title, subtitle, backgroundImage }: PageHeroProps) {
    return (
        <section className="relative py-24 md:py-32 overflow-hidden">
            {/* Background */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary-600 to-secondary-400"
                aria-hidden="true"
            >
                {backgroundImage && (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-20"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                )}
                {/* Decorative elements */}
                <div className="absolute top-10 left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-xl sm:text-2xl text-secondary-200 max-w-2xl mx-auto leading-relaxed">
                        {subtitle}
                    </p>
                )}
            </div>
        </section>
    );
}
