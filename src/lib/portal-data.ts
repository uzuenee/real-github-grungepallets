// Mock user data for client portal

export interface PortalUser {
    id: string;
    email: string;
    companyName: string;
    contactName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
}

export interface Order {
    id: string;
    date: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    items: OrderItem[];
    total: string;
    deliveryDate?: string;
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: string;
}

export const MOCK_USER: PortalUser = {
    id: 'user-1',
    email: 'orders@abclogistics.com',
    companyName: 'ABC Logistics',
    contactName: 'Sarah Johnson',
    phone: '(404) 555-9876',
    address: '4500 Industrial Way',
    city: 'Atlanta',
    state: 'GA',
    zip: '30318',
};

export const MOCK_ORDERS: Order[] = [
    {
        id: 'ORD-2024-001',
        date: 'December 20, 2024',
        status: 'delivered',
        items: [
            { productId: 'gma-48x40-a', productName: 'GMA 48x40 Grade A', quantity: 100, price: '$8.50' },
        ],
        total: '$850.00',
        deliveryDate: 'December 22, 2024',
    },
    {
        id: 'ORD-2024-002',
        date: 'December 18, 2024',
        status: 'delivered',
        items: [
            { productId: 'gma-48x40-b', productName: 'GMA 48x40 Grade B', quantity: 200, price: '$6.00' },
            { productId: '48x40-ht', productName: '48x40 Heat Treated', quantity: 50, price: '$10.00' },
        ],
        total: '$1,700.00',
        deliveryDate: 'December 19, 2024',
    },
    {
        id: 'ORD-2024-003',
        date: 'December 15, 2024',
        status: 'delivered',
        items: [
            { productId: 'gma-48x40-a', productName: 'GMA 48x40 Grade A', quantity: 150, price: '$8.50' },
        ],
        total: '$1,275.00',
        deliveryDate: 'December 17, 2024',
    },
    {
        id: 'ORD-2024-004',
        date: 'December 10, 2024',
        status: 'delivered',
        items: [
            { productId: '42x42-a', productName: '42x42 Grade A', quantity: 75, price: '$9.00' },
        ],
        total: '$675.00',
        deliveryDate: 'December 12, 2024',
    },
    {
        id: 'ORD-2024-005',
        date: 'December 26, 2024',
        status: 'pending',
        items: [
            { productId: 'gma-48x40-a', productName: 'GMA 48x40 Grade A', quantity: 100, price: '$8.50' },
            { productId: 'gma-48x40-b', productName: 'GMA 48x40 Grade B', quantity: 100, price: '$6.00' },
        ],
        total: '$1,450.00',
    },
];

export const CART_ITEMS = [
    { productId: 'gma-48x40-a', productName: 'GMA 48x40 Grade A', quantity: 50, price: '$8.50' },
];

export function getOrderStats() {
    const totalOrders = MOCK_ORDERS.length;
    const pendingOrders = MOCK_ORDERS.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const lastOrder = MOCK_ORDERS[0];

    return {
        totalOrders,
        pendingOrders,
        lastOrderDate: lastOrder?.date || 'No orders yet',
    };
}
