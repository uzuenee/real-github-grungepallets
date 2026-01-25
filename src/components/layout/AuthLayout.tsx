import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    maxWidth?: 'md' | 'lg' | 'xl';
}

export function AuthLayout({ children, maxWidth = 'lg' }: AuthLayoutProps) {
    const maxWidthClass = {
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    }[maxWidth];

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary via-secondary-600 to-secondary-500 flex flex-col">
            {/* Back Link */}
            <div className="p-6">
                <Link
                    href="/"
                    className="inline-flex items-center text-secondary-300 hover:text-white transition-colors"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Back to website
                </Link>
            </div>

            {/* Centered Content */}
            <div className="flex-1 flex items-center justify-center px-4 pb-12">
                <div className={`w-full ${maxWidthClass}`}>
                    {children}
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="fixed top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}