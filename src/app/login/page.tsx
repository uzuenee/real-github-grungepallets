'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layout';
import { Input, Button } from '@/components/ui';
import { useAuth } from '@/lib/contexts/AuthContext';

interface FormErrors {
    email?: string;
    password?: string;
    general?: string;
}

export default function LoginPage() {
    const router = useRouter();
    const { signIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!email) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email';
        if (!password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors({});

        const { error } = await signIn(email, password);

        if (error) {
            setErrors({ general: error.message || 'Invalid email or password' });
            setIsSubmitting(false);
            return;
        }

        // The middleware will handle redirecting to appropriate page based on approval status
        // We just need to trigger a navigation to let middleware do its job
        router.push('/portal');
        router.refresh();
    };

    return (
        <AuthLayout>
            <div className="bg-white rounded-2xl shadow-2xl p-8">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <img src="/logo.jpg" alt="Grunge Pallets" className="h-12 w-auto mx-auto" />
                    </Link>
                    <p className="text-secondary-400 mt-2">Sign in to your account</p>
                </div>

                {/* Error Message */}
                {errors.general && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{errors.general}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                        placeholder="you@company.com"
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                        placeholder="••••••••"
                    />

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-secondary-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-secondary-400">Remember me</span>
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-sm text-primary hover:text-primary-600 font-medium"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-secondary-400 text-sm">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-primary hover:text-primary-600 font-medium">
                            Request access
                        </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
