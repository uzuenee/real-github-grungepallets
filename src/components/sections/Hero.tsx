import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui';

export function Hero() {
    return (
        <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0" aria-hidden="true">
                <Image
                    src="/Hero page.png"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-secondary/80 to-secondary/70" />
                {/* Decorative elements */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
                {/* Badge */}
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-primary-300 text-sm font-medium mb-8">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
                    Serving Metro Atlanta Since 2010
                </div>

                {/* Headline */}
                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-wide text-white leading-none mb-6 uppercase">
                    Your Trusted Partner in{' '}
                    <span className="text-primary">Pallet Solutions</span>
                </h1>

                {/* Subheadline */}
                <p className="text-xl sm:text-2xl text-secondary-200 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Quality pallets, reliable recycling, and logistics services for Metro Atlanta businesses
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/quote?type=buy">
                        <Button variant="primary" size="lg">
                            I Need to Buy Pallets
                        </Button>
                    </Link>
                    <Link href="/quote?type=sell">
                        <Button variant="outline-white" size="lg">
                            I Need Pallets Removed
                        </Button>
                    </Link>
                </div>

                {/* Trust indicators */}
                <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-secondary-300 text-sm">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Same-Week Delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Quality Guaranteed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Free Quotes</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
