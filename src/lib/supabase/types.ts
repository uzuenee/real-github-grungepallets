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

export interface Category {
    id: string;
    label: string;
    description?: string;
    color_class: string;
    sort_order: number;
    is_active: boolean;
    created_at?: string;
}

export interface Product {
    id: string;
    name: string;
    category_id: string;
    size: string;
    dimensions: string;
    price: number;
    in_stock: boolean;
    is_heat_treated: boolean;
    is_protected: boolean;
    sort_order: number;
    image_url?: string;
    created_at?: string;
    updated_at?: string;
    // Joined data
    category?: Category;
}

// Legacy category type for backwards compatibility
export type ProductCategory = 'grade-a' | 'grade-b' | 'heat-treated' | 'custom';

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
            categories: {
                Row: Category;
                Insert: Omit<Category, 'created_at'>;
                Update: Partial<Omit<Category, 'id'>>;
            };
            products: {
                Row: Product;
                Insert: Omit<Product, 'created_at' | 'updated_at' | 'category'>;
                Update: Partial<Omit<Product, 'id' | 'created_at' | 'category'>>;
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
