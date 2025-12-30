import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PortalLayout } from '@/components/layout';
import { Card, Button, Badge } from '@/components/ui';
import { ShoppingBag, ClipboardList, Phone } from 'lucide-react';
import { MOCK_USER, MOCK_ORDERS, getOrderStats } from '@/lib/portal-data';

export default function Dashboard() {
  const stats = getOrderStats();
  const recentOrders = MOCK_ORDERS.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'warning';
      default: return 'info';
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | Grunge Pallets Portal</title>
      </Helmet>
      <PortalLayout>
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary">
            Welcome back, {MOCK_USER.companyName}!
          </h1>
          <p className="text-secondary-400 mt-1">Here's an overview of your account activity.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card padding="md" className="text-center">
            <p className="text-4xl font-bold text-primary mb-1">{stats.totalOrders}</p>
            <p className="text-secondary-400">Total Orders</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-4xl font-bold text-primary mb-1">{stats.pendingOrders}</p>
            <p className="text-secondary-400">Pending Orders</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-sm font-bold text-secondary mb-1">{stats.lastOrderDate}</p>
            <p className="text-secondary-400">Last Order Date</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card padding="lg" className="flex items-center gap-6">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShoppingBag size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-secondary mb-1">Need more pallets?</h3>
              <p className="text-secondary-400 text-sm mb-3">Browse our catalog and place an order.</p>
              <Link to="/portal/shop">
                <Button variant="primary" size="sm">Shop Now</Button>
              </Link>
            </div>
          </Card>

          <Card padding="lg" className="flex items-center gap-6">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ClipboardList size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-secondary mb-1">Track your orders</h3>
              <p className="text-secondary-400 text-sm mb-3">View order status and history.</p>
              <Link to="/portal/orders">
                <Button variant="outline" size="sm">View Orders</Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-secondary">Recent Orders</h2>
            <Link to="/portal/orders" className="text-primary hover:text-primary-600 text-sm font-medium">View All →</Link>
          </div>

          <Card padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="text-left text-sm font-semibold text-secondary px-6 py-3">Order ID</th>
                    <th className="text-left text-sm font-semibold text-secondary px-6 py-3">Date</th>
                    <th className="text-left text-sm font-semibold text-secondary px-6 py-3">Status</th>
                    <th className="text-right text-sm font-semibold text-secondary px-6 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-secondary-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/portal/orders/${order.id}`} className="font-medium text-primary hover:text-primary-600">{order.id}</Link>
                      </td>
                      <td className="px-6 py-4 text-secondary-400">{order.date}</td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusColor(order.status) as 'success' | 'warning' | 'info'}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-secondary">{order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <Card padding="lg" className="bg-secondary text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
              <Phone size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-1">Need Help?</h3>
              <p className="text-secondary-200 mb-4 md:mb-0">Our team is here to assist you with orders, questions, or special requests.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/contact">
                <Button variant="outline-white">Contact Us</Button>
              </Link>
              <a href="tel:4045557255">
                <Button variant="primary">(404) 555-7255</Button>
              </a>
            </div>
          </div>
        </Card>
      </PortalLayout>
    </>
  );
}
