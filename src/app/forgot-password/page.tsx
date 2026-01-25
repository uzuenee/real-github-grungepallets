'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/layout';
import { Input, Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

function ForgotPasswordContent() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Check for error params on mount
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam === 'no_session') {
            setError('Please request a password reset link first.');
        } else if (errorParam === 'link_expired') {
            setError('Your reset link has expired. Please request a new one.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email');
            return;
        }

        setIsSubmitting(true);
        setError('');

        const supabase = createClient();
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${siteUrl}/reset-password`,
        });

        if (resetError) {
            setError(resetError.message || 'Failed to send reset email');
            setIsSubmitting(false);
            return;
        }

        setIsSubmitted(true);
        setIsSubmitting(false);
    };

    if (isSubmitted) {
        return (
            <AuthLayout>
                <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-secondary mb-2">Check Your Email</h2>
                    <p className="text-secondary-400 mb-6">
                        We&apos;ve sent a password reset link to <strong>{email}</strong>.
                        Click the link in the email to reset your password.
                    </p>
                    <Link href="/login">
                        <Button variant="outline">Back to Login</Button>
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <Image src="/logo.jpg" alt="Grunge Pallets" width={160} height={48} className="h-12 w-auto mx-auto" />
                    </Link>
                    <p className="text-secondary-400 mt-2">Reset your password</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <p className="text-secondary-400 text-sm mb-4">
                        Enter your email address and we&apos;ll send you a link to reset your password.
                    </p>

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <Link href="/login" className="text-primary hover:text-primary-600 font-medium text-sm">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={
            <AuthLayout>
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                </div>
            </AuthLayout>
        }>
            <ForgotPasswordContent />
        </Suspense>
    );
}
