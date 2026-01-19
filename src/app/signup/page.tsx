'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout';
import { Input, Button } from '@/components/ui';
import { useAuth } from '@/lib/contexts/AuthContext';
import { formatPhoneNumber } from '@/lib/utils/phoneFormat';

interface FormData {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
}

interface FormErrors {
    [key: string]: string | undefined;
}

export default function SignupPage() {
    const { signUp } = useAuth();

    const [formData, setFormData] = useState<FormData>({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.companyName) newErrors.companyName = 'Company name is required';
        if (!formData.contactName) newErrors.contactName = 'Contact name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors({});

        const { error } = await signUp(formData.email, formData.password, {
            company_name: formData.companyName,
            contact_name: formData.contactName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
        });

        if (error) {
            setErrors({ general: error.message || 'Failed to create account' });
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const formattedValue = name === 'phone' ? formatPhoneNumber(value) : value;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : formattedValue,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    if (isSubmitted) {
        return (
            <AuthLayout>
                <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-secondary mb-2">Check Your Email</h2>
                    <p className="text-secondary-400 mb-6">
                        We&apos;ve sent a verification email to <strong>{formData.email}</strong>.
                        Please click the link in the email to verify your address.
                    </p>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                        <p className="text-yellow-800 text-sm">
                            <strong>What happens next?</strong>
                            <br />
                            1. Verify your email by clicking the link
                            <br />
                            2. Your account will be reviewed by our team
                            <br />
                            3. You&apos;ll receive approval within 24 hours
                        </p>
                    </div>

                    <Link href="/">
                        <Button variant="primary">Return to Website</Button>
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="bg-white rounded-2xl shadow-2xl p-8">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <span className="text-2xl font-black text-secondary">
                            GRUNGE <span className="text-primary">PALLETS</span>
                        </span>
                    </Link>
                    <p className="text-secondary-400 mt-2">Request a client account</p>
                </div>

                {/* Error Message */}
                {errors.general && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{errors.general}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Company Name *"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        error={errors.companyName}
                        placeholder="Your Company Name"
                    />

                    <Input
                        label="Contact Name *"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        error={errors.contactName}
                        placeholder="John Smith"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Email *"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="you@company.com"
                        />
                        <Input
                            label="Phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(404) 555-1234"
                        />
                    </div>

                    <Input
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="123 Business St"
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Input
                            label="City"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Atlanta"
                        />
                        <Input
                            label="State"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="GA"
                        />
                        <Input
                            label="ZIP"
                            name="zip"
                            value={formData.zip}
                            onChange={handleChange}
                            placeholder="30318"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Password *"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder="••••••••"
                        />
                        <Input
                            label="Confirm Password *"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-2">
                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="acceptTerms"
                                checked={formData.acceptTerms}
                                onChange={handleChange}
                                className="w-4 h-4 mt-1 rounded border-secondary-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-secondary-400">
                                I agree to the{' '}
                                <Link href="/terms" className="text-primary hover:text-primary-600">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="text-primary hover:text-primary-600">
                                    Privacy Policy
                                </Link>
                            </span>
                        </label>
                        {errors.acceptTerms && (
                            <p className="mt-1 text-sm text-red-500">{errors.acceptTerms}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Request Account'}
                    </Button>
                </form>

                {/* Note */}
                <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
                    <p className="text-secondary-500 text-sm text-center">
                        <strong>Note:</strong> Accounts are verified within 24 hours.
                        You&apos;ll receive an email once approved.
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-secondary-400 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:text-primary-600 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
