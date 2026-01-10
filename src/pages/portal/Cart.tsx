import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PortalLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { Trash2, ShoppingBag } from 'lucide-react';
import { CartProvider, useCart } from '@/lib/contexts/CartContext';

function CartContent() {
  const { items, updateQuantity, removeItem, getTotal } = useCart();
  const { subtotal, delivery, total } = getTotal();

  if (items.length === 0) {
    return (
      <PortalLayout>
        <div className="text-center py-16">
          <ShoppingBag size={64} className="text-secondary-200 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-secondary mb-2">Your cart is empty</h1>
          <p className="text-secondary-400 mb-8">Browse our catalog to add pallets to your order.</p>
          <Link to="/portal/shop"><Button variant="primary" size="lg">Shop Now</Button></Link>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary">Shopping Cart</h1>
        <p className="text-secondary-400 mt-1">Review your items before checkout</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card padding="none" className="overflow-hidden">
            <div className="divide-y divide-secondary-100">
              {items.map((item) => (
                <div key={item.productId} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-secondary">{item.productName}</p>
                    <p className="text-sm text-secondary-400">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <input type="number" min="1" value={item.quantity} onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)} className="w-16 text-center px-2 py-1 border border-secondary-100 rounded-lg" />
                    <p className="font-bold text-secondary w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                    <button onClick={() => removeItem(item.productId)} className="text-secondary-300 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Link to="/portal/shop" className="inline-block mt-4 text-primary hover:text-primary-600 font-medium">← Continue Shopping</Link>
        </div>
        <div className="lg:col-span-1">
          <Card padding="lg" className="sticky top-24">
            <h2 className="text-xl font-bold text-secondary mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-secondary-500"><span>Subtotal</span><span className="font-medium text-secondary">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-secondary-500"><span>Delivery</span><span className={delivery === 0 ? 'text-green-600' : 'text-secondary'}>{delivery === 0 ? 'FREE' : `$${delivery.toFixed(2)}`}</span></div>
            </div>
            <div className="border-t border-secondary-100 pt-4 mb-6">
              <div className="flex justify-between"><span className="text-lg font-bold text-secondary">Total</span><span className="text-lg font-bold text-primary">${total.toFixed(2)}</span></div>
            </div>
            <Link to="/portal/checkout"><Button variant="primary" size="lg" className="w-full">Proceed to Checkout</Button></Link>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}

export default function Cart() {
  return (<><Helmet><title>Cart | Grunge Pallets Portal</title></Helmet><CartProvider><CartContent /></CartProvider></>);
}
