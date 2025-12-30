import Link from 'next/link';
import { PortalLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { CheckCircle, Mail, Package, ArrowRight } from 'lucide-react';

export default function OrderConfirmationPage() {
    // Generate a random order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    return (
        <PortalLayout>
            <div className="max-w-2xl mx-auto py-8">
                <Card padding="lg" className="text-center">
                    {/* Success Icon */}
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 animate-[bounce_0.5s_ease-in-out]">
                            <CheckCircle size={48} strokeWidth={1.5} />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-secondary mb-2">
                        Order Submitted!
                    </h1>
                    <p className="text-xl text-primary font-semibold mb-6">
                        {orderNumber}
                    </p>

                    {/* Message */}
                    <div className="bg-secondary-50 rounded-xl p-6 mb-8 text-left">
                        <div className="flex items-start gap-4 mb-4">
                            <Mail className="text-primary flex-shrink-0 mt-1" size={20} />
                            <div>
                                <p className="font-semibold text-secondary">Confirmation Email Sent</p>
                                <p className="text-secondary-400 text-sm">
                                    We&apos;ve sent order details to your registered email address.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Package className="text-primary flex-shrink-0 mt-1" size={20} />
                            <div>
                                <p className="font-semibold text-secondary">What&apos;s Next?</p>
                                <p className="text-secondary-400 text-sm">
                                    Our team will process your order and contact you to confirm delivery details.
                                    Orders placed before 2 PM typically ship same day.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Placeholder */}
                    <div className="border-t border-secondary-100 pt-6 mb-8">
                        <h2 className="font-bold text-secondary mb-4">Order Summary</h2>
                        <div className="bg-secondary-50 rounded-lg p-4 text-sm text-secondary-500">
                            <p>Your order details have been saved.</p>
                            <p>View order history for full details.</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/portal/orders">
                            <Button variant="outline" size="lg">
                                View Order History
                            </Button>
                        </Link>
                        <Link href="/portal/shop">
                            <Button variant="primary" size="lg">
                                Continue Shopping
                                <ArrowRight size={18} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                </Card>

                {/* Help */}
                <p className="text-center text-secondary-400 text-sm mt-8">
                    Questions about your order?{' '}
                    <Link href="/contact" className="text-primary hover:text-primary-600 font-medium">
                        Contact us
                    </Link>
                    {' '}or call (404) 555-7255
                </p>
            </div>
        </PortalLayout>
    );
}
