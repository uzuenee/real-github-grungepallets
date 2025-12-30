import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PortalLayout } from '@/components/layout';
import { Card, Button, Badge, ToastProvider, useToast } from '@/components/ui';
import { ArrowLeft, RefreshCw, Package } from 'lucide-react';
import { CartProvider, useCart } from '@/lib/contexts/CartContext';
import { MOCK_ORDERS, MOCK_USER } from '@/lib/portal-data';

function OrderDetailContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const order = MOCK_ORDERS.find(o => o.id === id);

  const getStatusColor = (status: string) => { switch (status) { case 'pending': return 'warning'; case 'delivered': return 'success'; default: return 'info'; } };

  const handleReorderAll = () => {
    if (!order) return;
    order.items.forEach(item => { addToCart({ productId: item.productId, productName: item.productName, price: parseFloat(item.price.replace('$', '')) }, item.quantity); });
    showToast(`${order.items.length} item(s) added to cart`, 'success');
    setTimeout(() => navigate('/portal/cart'), 500);
  };

  if (!order) {
    return (<PortalLayout><div className="text-center py-16"><Package size={64} className="text-secondary-200 mx-auto mb-6" /><h1 className="text-2xl font-bold text-secondary mb-2">Order Not Found</h1><Link to="/portal/orders"><Button variant="primary">View All Orders</Button></Link></div></PortalLayout>);
  }

  const subtotal = order.items.reduce((sum, item) => sum + parseFloat(item.price.replace('$', '')) * item.quantity, 0);

  return (
    <PortalLayout>
      <Link to="/portal/orders" className="inline-flex items-center text-secondary-400 hover:text-primary mb-6"><ArrowLeft size={18} className="mr-2" />Back to Order History</Link>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-secondary">{order.id}</h1><p className="text-secondary-400 mt-1">Placed on {order.date}</p></div>
        <Badge variant={getStatusColor(order.status) as 'success' | 'warning' | 'info'}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</Badge>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card padding="none" className="overflow-hidden">
            <div className="bg-secondary-50 px-6 py-4"><h2 className="font-bold text-secondary">Order Items</h2></div>
            <div className="divide-y divide-secondary-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-6 flex items-center gap-4">
                  <div className="w-16 h-16 bg-secondary-50 rounded-lg flex items-center justify-center"><Package size={28} className="text-secondary-300" /></div>
                  <div className="flex-1"><h3 className="font-semibold text-secondary">{item.productName}</h3><p className="text-sm text-secondary-400">SKU: {item.productId.toUpperCase()}</p></div>
                  <div className="text-right"><p className="text-secondary-500">{item.quantity} × {item.price}</p><p className="font-bold text-secondary">${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}</p></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card padding="lg">
            <h2 className="font-bold text-secondary mb-4">Order Summary</h2>
            <div className="space-y-3"><div className="flex justify-between text-secondary-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div><div className="flex justify-between text-secondary-500"><span>Delivery</span><span>{subtotal >= 500 ? 'FREE' : '$75.00'}</span></div></div>
            <div className="border-t border-secondary-100 pt-4 mt-4"><div className="flex justify-between"><span className="font-bold text-secondary">Total</span><span className="font-bold text-primary">{order.total}</span></div></div>
          </Card>
          <Card padding="lg">
            <h2 className="font-bold text-secondary mb-4">Delivery Address</h2>
            <div className="text-secondary-500 text-sm space-y-1"><p className="font-medium text-secondary">{MOCK_USER.companyName}</p><p>{MOCK_USER.address}</p><p>{MOCK_USER.city}, {MOCK_USER.state} {MOCK_USER.zip}</p></div>
          </Card>
        </div>
      </div>
      <div className="mt-8 flex justify-center gap-4">
        <Button variant="primary" size="lg" onClick={handleReorderAll}><RefreshCw size={18} className="mr-2" />Reorder All Items</Button>
        <Link to="/portal/orders"><Button variant="outline" size="lg">Back to Orders</Button></Link>
      </div>
    </PortalLayout>
  );
}

export default function OrderDetail() {
  return (<><Helmet><title>Order Details | Grunge Pallets Portal</title></Helmet><CartProvider><ToastProvider><OrderDetailContent /></ToastProvider></CartProvider></>);
}
