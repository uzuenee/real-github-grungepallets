import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CustomSpecs {
    length: string;
    width: string;
    height?: string;
    notes?: string;
    gradeType?: string;   // 'grade-a' | 'grade-b' | 'heat-treated'
    gradeLabel?: string;  // 'Grade A' | 'Grade B' | 'Heat Treated'
}

export interface CartItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    isCustom?: boolean;
    customSpecs?: CustomSpecs;
}

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    removeItem: (productId: string) => void;
    clearCart: () => void;
    getTotal: () => { subtotal: number; delivery: number | null; total: number };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'grunge-pallets-cart';

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse cart:', e);
            }
        }
        setIsHydrated(true);
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        }
    }, [items, isHydrated]);

    const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
        setItems(prev => {
            // Custom products always get added as new items (each has unique specs)
            if (item.isCustom) {
                const uniqueId = `${item.productId}-${Date.now()}`;
                return [...prev, { ...item, productId: uniqueId, quantity }];
            }

            // Regular products get merged by productId
            const existing = prev.find(i => i.productId === item.productId);
            if (existing) {
                return prev.map(i =>
                    i.productId === item.productId
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                );
            }
            return [...prev, { ...item, quantity }];
        });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(productId);
            return;
        }
        setItems(prev =>
            prev.map(i =>
                i.productId === productId ? { ...i, quantity } : i
            )
        );
    };

    const removeItem = (productId: string) => {
        setItems(prev => prev.filter(i => i.productId !== productId));
    };

    const clearCart = () => {
        setItems([]);
    };

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const getTotal = () => {
        // Delivery price is set by admin after order submission
        const delivery = null;
        return {
            subtotal,
            delivery,
            total: subtotal, // Total at checkout is just subtotal; delivery added by admin later
        };
    };

    return (
        <CartContext.Provider
            value={{
                items,
                itemCount,
                subtotal,
                addToCart,
                updateQuantity,
                removeItem,
                clearCart,
                getTotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}