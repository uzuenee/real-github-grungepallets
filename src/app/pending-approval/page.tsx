'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Clock, CheckCircle, LogOut } from 'lucide-react';

export default function PendingApprovalPage() {
    const { profile, signOut, user } = useAuth();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        await signOut();
        window.location.href = '/';
    };

    // If user is approved, redirect to portal
    useEffect(() => {
        if (profile?.approved) {
            window.location.href = '/portal';
        }
    }, [profile]);

    return (
        <AuthLayout>
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 text-yellow-600 mb-6">
                    <Clock size={40} />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-secondary mb-2">
                    Account Pending Approval
                </h1>

                {/* Email confirmed badge */}
                {user && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-4">
                        <CheckCircle size={16} />
                        Email verified
                    </div>
                )}

                {/* Message */}
                <p className="text-secondary-400 mb-6">
                    Thank you for confirming your email! Your account request is now being reviewed by our team.
                </p>

                <div className="bg-secondary-50 rounded-lg p-4 mb-6">
                    <p className="text-secondary-500 text-sm">
                        <strong>What happens next?</strong>
                        <br />
                        We typically review new accounts within 24 hours. You&apos;ll receive an email once your account has been approved.
                    </p>
                </div>

                {/* User info */}
                {profile && (
                    <div className="text-left bg-secondary-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-secondary-400 mb-1">Registered as:</p>
                        <p className="font-semibold text-secondary">{profile.company_name}</p>
                        <p className="text-sm text-secondary-400">{profile.contact_name}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    <Link href="/" className="block">
                        <Button variant="primary" className="w-full">
                            Return to Website
                        </Button>
                    </Link>

                    <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
                    >
                        <LogOut size={16} />
                        {isSigningOut ? 'Signing out...' : 'Sign out'}
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
}
