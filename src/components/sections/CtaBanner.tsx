import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

export function CtaBanner() {
    return (
        <section className="py-20 bg-primary">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                    Ready to Optimize Your Pallet Supply Chain?
                </h2>
                <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                    Get a customized quote tailored to your business needs. No obligation, no hassle.
                </p>
                <Link to="/quote">
                    <Button variant="outline-white" size="lg">
                        Get Your Custom Quote
                    </Button>
                </Link>
            </div>
        </section>
    );
}