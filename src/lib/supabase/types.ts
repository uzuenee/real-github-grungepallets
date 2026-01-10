export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Profile {
    id: string;
    company_name: string;
    contact_name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    is_admin: boolean;
    approved: boolean;
    created_at?: string;
}

export interface Product {
    id: string;
    name: string;
    category: 'grade-a' | 'grade-b' | 'heat-treated' | 'custom';
    size: string;
    dimensions: string;
    price: number;
    description: string;
    in_stock: boolean;
    image_url?: string;
}

export interface Order {
    id: string;
    user_id: string;
    status: OrderStatus;
    total: number;
    delivery_notes?: string;
    delivery_date?: string;
    created_at: string;
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
}

// Database table types for Supabase
export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, 'created_at'>;
                Update: Partial<Omit<Profile, 'id'>>;
            };
            products: {
                Row: Product;
                Insert: Omit<Product, 'id'>;
                Update: Partial<Omit<Product, 'id'>>;
            };
            orders: {
                Row: Order;
                Insert: Omit<Order, 'id' | 'created_at' | 'items'>;
                Update: Partial<Omit<Order, 'id' | 'user_id' | 'created_at'>>;
            };
            order_items: {
                Row: OrderItem;
                Insert: Omit<OrderItem, 'id'>;
                Update: Partial<Omit<OrderItem, 'id' | 'order_id'>>;
            };
        };
    };
};
