'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layout';
import { Input, Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user has a valid recovery session
    useEffect(() => {
        const checkSession = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                // No session - redirect to forgot-password
                router.replace('/forgot-password?error=no_session');
                return;
            }

            setIsValidSession(true);
            setIsLoading(false);
        };

        checkSession();
    }, [router]);

    // Show loading state while checking session
    if (isLoading) {
        return (
            <AuthLayout>
                <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-secondary-400">Verifying your reset link...</p>
                </div>
            </AuthLayout>
        );
    }

    // If no valid session, don't render anything (will redirect)
    if (!isValidSession) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();


        if (!password) {
            setError('Password is required');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsSubmitting(true);
        setError('');

        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({
            password: password
        });

        if (updateError) {
            setError(updateError.message || 'Failed to reset password');
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-secondary mb-2">Password Reset!</h2>
                    <p className="text-secondary-400 mb-6">
                        Your password has been successfully reset. You can now log in with your new password.
                    </p>
                    <Link href="/login">
                        <Button variant="primary">Go to Login</Button>
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
                        <span className="text-2xl font-black text-secondary">
                            GRUNGE <span className="text-primary">PALLETS</span>
                        </span>
                    </Link>
                    <p className="text-secondary-400 mt-2">Create a new password</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                        {error.includes('expired') && (
                            <Link href="/forgot-password" className="text-primary text-sm hover:underline mt-2 inline-block">
                                Request a new reset link
                            </Link>
                        )}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <Input
                            label="New Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-9 text-secondary-400 hover:text-secondary"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="relative">
                        <Input
                            label="Confirm Password"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-9 text-secondary-400 hover:text-secondary"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </form>
            </div>
        </AuthLayout>
    );
}
