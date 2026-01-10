'use client';

import Link from 'next/link';
import { PortalLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { CheckCircle, ShoppingBag, ClipboardList } from 'lucide-react';

export default function OrderConfirmationPage() {
    return (
        <PortalLayout>
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
                        <CheckCircle size={48} />
                    </div>
                    <h1 className="text-3xl font-bold text-secondary mb-3">
                        Order Submitted Successfully!
                    </h1>
                    <p className="text-secondary-400 text-lg">
                        Thank you for your order. We&apos;ve received it and will process it shortly.
                    </p>
                </div>

                <Card padding="lg" className="mb-8 text-left">
                    <h2 className="font-bold text-secondary mb-4">What happens next?</h2>
                    <ul className="space-y-3 text-secondary-500">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">1</span>
                            <span>You&apos;ll receive an email confirmation with your order details.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">2</span>
                            <span>Our team will review and confirm your order within 1 business day.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">3</span>
                            <span>We&apos;ll schedule delivery and keep you updated on the status.</span>
                        </li>
                    </ul>
                </Card>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/portal/orders">
                        <Button variant="primary" size="lg" className="w-full sm:w-auto">
                            <ClipboardList size={20} className="mr-2" />
                            View My Orders
                        </Button>
                    </Link>
                    <Link href="/portal/shop">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto">
                            <ShoppingBag size={20} className="mr-2" />
                            Continue Shopping
                        </Button>
                    </Link>
                </div>
            </div>
        </PortalLayout>
    );
}
