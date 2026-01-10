import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PortalLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { CartProvider, useCart } from '@/lib/contexts/CartContext';
import { MOCK_USER } from '@/lib/portal-data';
import { ShoppingBag, CreditCard, FileText } from 'lucide-react';

function CheckoutContent() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCart();
  const { subtotal, delivery, total } = getTotal();
  const [paymentMethod, setPaymentMethod] = useState<'invoice' | 'card'>('invoice');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (items.length === 0) {
    return (<PortalLayout><div className="text-center py-16"><ShoppingBag size={64} className="text-secondary-200 mx-auto mb-6" /><h1 className="text-2xl font-bold text-secondary mb-2">Your cart is empty</h1><Link to="/portal/shop"><Button variant="primary" size="lg">Shop Now</Button></Link></div></PortalLayout>);
  }

  const handleSubmitOrder = async () => {
    if (!acceptTerms) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    clearCart();
    navigate('/portal/order-confirmation');
  };

  return (
    <PortalLayout>
      <div className="mb-8"><h1 className="text-2xl sm:text-3xl font-bold text-secondary">Checkout</h1></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <h2 className="text-xl font-bold text-secondary mb-4">Delivery Address</h2>
            <div className="bg-secondary-50 rounded-lg p-4"><p className="font-semibold text-secondary">{MOCK_USER.companyName}</p><p className="text-secondary-500">{MOCK_USER.address}</p><p className="text-secondary-500">{MOCK_USER.city}, {MOCK_USER.state} {MOCK_USER.zip}</p></div>
          </Card>
          <Card padding="lg">
            <h2 className="text-xl font-bold text-secondary mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer ${paymentMethod === 'invoice' ? 'border-primary bg-primary/5' : 'border-secondary-100'}`}>
                <input type="radio" checked={paymentMethod === 'invoice'} onChange={() => setPaymentMethod('invoice')} className="w-5 h-5 text-primary" />
                <FileText size={24} className={paymentMethod === 'invoice' ? 'text-primary' : 'text-secondary-400'} />
                <div><p className="font-semibold text-secondary">Pay by Invoice (Net 30)</p></div>
              </label>
              <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-secondary-100'}`}>
                <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-5 h-5 text-primary" />
                <CreditCard size={24} className={paymentMethod === 'card' ? 'text-primary' : 'text-secondary-400'} />
                <div><p className="font-semibold text-secondary">Credit Card</p></div>
              </label>
            </div>
          </Card>
          <Card padding="lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="w-5 h-5 mt-0.5 rounded text-primary" />
              <span className="text-secondary-500">I agree to the Terms of Service and Privacy Policy.</span>
            </label>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card padding="lg" className="sticky top-24">
            <h2 className="text-xl font-bold text-secondary mb-4">Order Summary</h2>
            <div className="space-y-2 mb-6">{items.map((item) => (<div key={item.productId} className="flex justify-between text-sm"><span>{item.productName} x{item.quantity}</span><span>${(item.price * item.quantity).toFixed(2)}</span></div>))}</div>
            <div className="border-t border-secondary-100 pt-4 space-y-2 mb-6">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{delivery === 0 ? 'FREE' : `$${delivery.toFixed(2)}`}</span></div>
            </div>
            <div className="border-t border-secondary-100 pt-4 mb-6"><div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">${total.toFixed(2)}</span></div></div>
            <Button variant="primary" size="lg" className="w-full" onClick={handleSubmitOrder} disabled={isSubmitting || !acceptTerms}>{isSubmitting ? 'Submitting...' : 'Submit Order'}</Button>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}

export default function Checkout() {
  return (<><Helmet><title>Checkout | Grunge Pallets Portal</title></Helmet><CartProvider><CheckoutContent /></CartProvider></>);
}
