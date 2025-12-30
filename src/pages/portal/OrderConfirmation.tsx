import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PortalLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function OrderConfirmation() {
  const orderNumber = `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  return (
    <>
      <Helmet><title>Order Confirmed | Grunge Pallets Portal</title></Helmet>
      <PortalLayout>
        <div className="max-w-2xl mx-auto py-8">
          <Card padding="lg" className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600">
                <CheckCircle size={48} strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-secondary mb-2">Order Submitted!</h1>
            <p className="text-xl text-primary font-semibold mb-6">{orderNumber}</p>
            <div className="bg-secondary-50 rounded-xl p-6 mb-8 text-left">
              <p className="text-secondary-500">We've sent order details to your email. Our team will process your order and contact you to confirm delivery.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/portal/orders"><Button variant="outline" size="lg">View Order History</Button></Link>
              <Link to="/portal/shop"><Button variant="primary" size="lg">Continue Shopping<ArrowRight size={18} className="ml-2" /></Button></Link>
            </div>
          </Card>
        </div>
      </PortalLayout>
    </>
  );
}
