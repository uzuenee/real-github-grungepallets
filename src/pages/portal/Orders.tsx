import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PortalLayout } from '@/components/layout';
import { Card, Button, Badge, ToastProvider, useToast } from '@/components/ui';
import { RefreshCw, Filter, ChevronDown } from 'lucide-react';
import { CartProvider, useCart } from '@/lib/contexts/CartContext';
import { MOCK_ORDERS, Order } from '@/lib/portal-data';

type StatusFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered';
const statusOptions = [{ id: 'all', label: 'All Orders' }, { id: 'pending', label: 'Pending' }, { id: 'processing', label: 'Processing' }, { id: 'shipped', label: 'Shipped' }, { id: 'delivered', label: 'Delivered' }];

function OrdersContent() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredOrders = useMemo(() => {
    let orders = [...MOCK_ORDERS];
    if (statusFilter !== 'all') orders = orders.filter(o => o.status === statusFilter);
    return orders;
  }, [statusFilter]);

  const getStatusColor = (status: string) => { switch (status) { case 'pending': return 'warning'; case 'delivered': return 'success'; default: return 'info'; } };

  const handleReorder = (order: Order) => {
    order.items.forEach(item => { addToCart({ productId: item.productId, productName: item.productName, price: parseFloat(item.price.replace('$', '')) }, item.quantity); });
    showToast(`${order.items.length} item(s) added to cart`, 'success');
    setTimeout(() => navigate('/portal/cart'), 500);
  };

  return (
    <PortalLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-secondary">Order History</h1><p className="text-secondary-400 mt-1">View and reorder from your past orders</p></div>
        <Link to="/portal/shop"><Button variant="primary">Place New Order</Button></Link>
      </div>
      <Card padding="md" className="mb-6">
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-secondary font-medium"><Filter size={18} />Filter Orders<ChevronDown size={16} className={showFilters ? 'rotate-180' : ''} /></button>
        {showFilters && (<div className="mt-4 pt-4 border-t border-secondary-100 flex flex-wrap gap-2">{statusOptions.map((opt) => (<button key={opt.id} onClick={() => setStatusFilter(opt.id as StatusFilter)} className={`px-4 py-2 rounded-full text-sm font-medium ${statusFilter === opt.id ? 'bg-primary text-white' : 'bg-secondary-50 text-secondary-500'}`}>{opt.label}</button>))}</div>)}
      </Card>
      <Card padding="none" className="overflow-hidden">
        <div className="divide-y divide-secondary-100">
          {filteredOrders.map((order) => (
            <div key={order.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div><Link to={`/portal/orders/${order.id}`} className="font-semibold text-primary hover:text-primary-600">{order.id}</Link><p className="text-sm text-secondary-400">{order.date}</p></div>
              <div className="flex items-center gap-4">
                <Badge variant={getStatusColor(order.status) as 'success' | 'warning' | 'info'}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</Badge>
                <span className="font-semibold text-secondary">{order.total}</span>
                <Button variant="outline" size="sm" onClick={() => handleReorder(order)}><RefreshCw size={14} className="mr-1" />Reorder</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PortalLayout>
  );
}

export default function Orders() {
  return (<><Helmet><title>Orders | Grunge Pallets Portal</title></Helmet><CartProvider><ToastProvider><OrdersContent /></ToastProvider></CartProvider></>);
}
