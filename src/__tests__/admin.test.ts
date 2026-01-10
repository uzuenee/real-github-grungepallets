/**
 * Admin Panel Tests
 * Tests for admin functionality including user and order management
 */

describe('Admin Panel', () => {
    describe('User Management', () => {
        interface User {
            id: string;
            company_name: string;
            contact_name: string;
            is_approved: boolean;
            is_admin: boolean;
        }

        const canModifyUser = (currentUserId: string, targetUser: User): boolean => {
            // Cannot modify your own account
            return currentUserId !== targetUser.id;
        };

        const canDeleteUser = (currentUserId: string, targetUserId: string): boolean => {
            // Cannot delete yourself
            return currentUserId !== targetUserId;
        };

        const toggleApproval = (user: User): User => {
            return { ...user, is_approved: !user.is_approved };
        };

        const toggleAdmin = (user: User): User => {
            return { ...user, is_admin: !user.is_admin };
        };

        it('should not allow admin to modify their own account', () => {
            const currentUserId = 'admin-123';
            const self: User = {
                id: 'admin-123',
                company_name: 'Admin Corp',
                contact_name: 'Admin User',
                is_approved: true,
                is_admin: true,
            };
            const otherUser: User = {
                id: 'user-456',
                company_name: 'Other Corp',
                contact_name: 'Other User',
                is_approved: true,
                is_admin: false,
            };

            expect(canModifyUser(currentUserId, self)).toBe(false);
            expect(canModifyUser(currentUserId, otherUser)).toBe(true);
        });

        it('should not allow admin to delete themselves', () => {
            const currentUserId = 'admin-123';
            expect(canDeleteUser(currentUserId, 'admin-123')).toBe(false);
            expect(canDeleteUser(currentUserId, 'user-456')).toBe(true);
        });

        it('should toggle user approval status', () => {
            const user: User = {
                id: '1',
                company_name: 'Test',
                contact_name: 'Test User',
                is_approved: false,
                is_admin: false,
            };

            const toggled = toggleApproval(user);
            expect(toggled.is_approved).toBe(true);
            expect(toggleApproval(toggled).is_approved).toBe(false);
        });

        it('should toggle admin status', () => {
            const user: User = {
                id: '1',
                company_name: 'Test',
                contact_name: 'Test User',
                is_approved: true,
                is_admin: false,
            };

            const toggled = toggleAdmin(user);
            expect(toggled.is_admin).toBe(true);
            expect(toggleAdmin(toggled).is_admin).toBe(false);
        });
    });

    describe('Order Statistics', () => {
        interface Order {
            id: string;
            status: string;
            total: number;
        }

        const calculateStats = (orders: Order[]): {
            pending: number;
            processing: number;
            completed: number;
            totalRevenue: number;
        } => {
            const pending = orders.filter(o => o.status === 'pending').length;
            const processing = orders.filter(o =>
                ['confirmed', 'processing', 'shipped'].includes(o.status)
            ).length;
            const completed = orders.filter(o => o.status === 'delivered').length;
            const totalRevenue = orders
                .filter(o => o.status === 'delivered')
                .reduce((sum, o) => sum + o.total, 0);

            return { pending, processing, completed, totalRevenue };
        };

        const sampleOrders: Order[] = [
            { id: '1', status: 'pending', total: 100 },
            { id: '2', status: 'pending', total: 150 },
            { id: '3', status: 'confirmed', total: 200 },
            { id: '4', status: 'processing', total: 250 },
            { id: '5', status: 'shipped', total: 300 },
            { id: '6', status: 'delivered', total: 400 },
            { id: '7', status: 'delivered', total: 500 },
            { id: '8', status: 'cancelled', total: 175 },
        ];

        it('should count pending orders correctly', () => {
            const stats = calculateStats(sampleOrders);
            expect(stats.pending).toBe(2);
        });

        it('should count processing orders (confirmed, processing, shipped)', () => {
            const stats = calculateStats(sampleOrders);
            expect(stats.processing).toBe(3);
        });

        it('should count delivered orders', () => {
            const stats = calculateStats(sampleOrders);
            expect(stats.completed).toBe(2);
        });

        it('should calculate total revenue from delivered orders only', () => {
            const stats = calculateStats(sampleOrders);
            expect(stats.totalRevenue).toBe(900); // 400 + 500
        });
    });

    describe('Custom Pallet Price Management', () => {
        interface OrderItem {
            id: string;
            product_name: string;
            quantity: number;
            unit_price: number;
            is_custom: boolean;
            custom_specs: string | null;
        }

        interface CustomSpecs {
            length: string;
            width: string;
            height?: string;
            notes?: string;
        }

        const parseCustomSpecs = (specsJson: string | null): CustomSpecs | null => {
            if (!specsJson) return null;
            try {
                return JSON.parse(specsJson);
            } catch {
                return null;
            }
        };

        const needsPricing = (item: OrderItem): boolean => {
            return item.is_custom && item.unit_price === 0;
        };

        const setItemPrice = (item: OrderItem, price: number): OrderItem => {
            return { ...item, unit_price: price };
        };

        const recalculateOrderTotal = (items: OrderItem[]): number => {
            return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        };

        it('should parse custom specs JSON correctly', () => {
            const json = '{"length":"48","width":"40","height":"6","notes":"Heavy duty"}';
            const specs = parseCustomSpecs(json);

            expect(specs).not.toBeNull();
            expect(specs?.length).toBe('48');
            expect(specs?.width).toBe('40');
            expect(specs?.height).toBe('6');
            expect(specs?.notes).toBe('Heavy duty');
        });

        it('should handle null custom specs', () => {
            expect(parseCustomSpecs(null)).toBeNull();
        });

        it('should handle invalid JSON gracefully', () => {
            expect(parseCustomSpecs('not valid json')).toBeNull();
        });

        it('should identify items needing pricing', () => {
            const customNeedsPrice: OrderItem = {
                id: '1',
                product_name: 'Custom Pallet',
                quantity: 5,
                unit_price: 0,
                is_custom: true,
                custom_specs: '{"length":"48","width":"40"}',
            };
            const customHasPrice: OrderItem = {
                id: '2',
                product_name: 'Custom Pallet',
                quantity: 5,
                unit_price: 25,
                is_custom: true,
                custom_specs: '{"length":"36","width":"36"}',
            };
            const regularItem: OrderItem = {
                id: '3',
                product_name: 'GMA 48x40',
                quantity: 10,
                unit_price: 8.5,
                is_custom: false,
                custom_specs: null,
            };

            expect(needsPricing(customNeedsPrice)).toBe(true);
            expect(needsPricing(customHasPrice)).toBe(false);
            expect(needsPricing(regularItem)).toBe(false);
        });

        it('should update item price correctly', () => {
            const item: OrderItem = {
                id: '1',
                product_name: 'Custom Pallet',
                quantity: 5,
                unit_price: 0,
                is_custom: true,
                custom_specs: '{"length":"48","width":"40"}',
            };

            const updated = setItemPrice(item, 25.50);
            expect(updated.unit_price).toBe(25.50);
            expect(updated.id).toBe(item.id); // Original properties preserved
        });

        it('should recalculate order total after price change', () => {
            const items: OrderItem[] = [
                { id: '1', product_name: 'Regular', quantity: 10, unit_price: 10, is_custom: false, custom_specs: null },
                { id: '2', product_name: 'Custom', quantity: 5, unit_price: 0, is_custom: true, custom_specs: '{}' },
            ];

            // Before pricing: 100 + 0 = 100
            expect(recalculateOrderTotal(items)).toBe(100);

            // Set price for custom item
            items[1] = setItemPrice(items[1], 20);

            // After pricing: 100 + 100 = 200
            expect(recalculateOrderTotal(items)).toBe(200);
        });
    });

    describe('Status Badge Display', () => {
        type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

        interface StatusConfig {
            label: string;
            color: string;
        }

        const getStatusConfig = (status: OrderStatus): StatusConfig => {
            const configs: Record<OrderStatus, StatusConfig> = {
                pending: { label: 'Pending', color: 'amber' },
                confirmed: { label: 'Confirmed', color: 'blue' },
                processing: { label: 'Processing', color: 'purple' },
                shipped: { label: 'Shipped', color: 'cyan' },
                delivered: { label: 'Delivered', color: 'green' },
                cancelled: { label: 'Cancelled', color: 'red' },
            };
            return configs[status];
        };

        it('should return correct config for each status', () => {
            expect(getStatusConfig('pending').color).toBe('amber');
            expect(getStatusConfig('confirmed').color).toBe('blue');
            expect(getStatusConfig('processing').color).toBe('purple');
            expect(getStatusConfig('shipped').color).toBe('cyan');
            expect(getStatusConfig('delivered').color).toBe('green');
            expect(getStatusConfig('cancelled').color).toBe('red');
        });

        it('should have readable labels', () => {
            expect(getStatusConfig('pending').label).toBe('Pending');
            expect(getStatusConfig('processing').label).toBe('Processing');
            expect(getStatusConfig('delivered').label).toBe('Delivered');
        });
    });
});
