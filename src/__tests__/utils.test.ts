/**
 * Utility Function Tests
 * Tests for common utility functions used across the app
 */

describe('Utility Functions', () => {
    describe('Currency Formatting', () => {
        const formatCurrency = (amount: number): string => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(amount);
        };

        it('should format currency correctly', () => {
            expect(formatCurrency(100)).toBe('$100.00');
            expect(formatCurrency(1234.56)).toBe('$1,234.56');
            expect(formatCurrency(0)).toBe('$0.00');
        });

        it('should handle large numbers', () => {
            expect(formatCurrency(1000000)).toBe('$1,000,000.00');
        });

        it('should handle negative numbers', () => {
            expect(formatCurrency(-50)).toBe('-$50.00');
        });
    });

    describe('Date Formatting', () => {
        const formatDate = (dateString: string): string => {
            return new Date(dateString).toLocaleDateString('en-US');
        };

        const formatDateTime = (dateString: string): string => {
            return new Date(dateString).toLocaleString('en-US');
        };

        it('should format dates', () => {
            const formatted = formatDate('2026-01-15T10:30:00Z');
            expect(formatted).toContain('1');
            expect(formatted).toContain('15');
            expect(formatted).toContain('2026');
        });

        it('should include time in datetime format', () => {
            const formatted = formatDateTime('2026-01-15T10:30:00Z');
            expect(formatted.length).toBeGreaterThan(formatDate('2026-01-15').length);
        });
    });

    describe('String Utilities', () => {
        const truncate = (str: string, maxLength: number): string => {
            if (str.length <= maxLength) return str;
            return str.slice(0, maxLength - 3) + '...';
        };

        const capitalize = (str: string): string => {
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        };

        const toTitleCase = (str: string): string => {
            return str.split(' ').map(capitalize).join(' ');
        };

        const slugify = (str: string): string => {
            return str
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
        };

        it('should truncate long strings', () => {
            expect(truncate('Hello World', 20)).toBe('Hello World');
            expect(truncate('This is a very long string', 10)).toBe('This is...');
        });

        it('should capitalize strings', () => {
            expect(capitalize('hello')).toBe('Hello');
            expect(capitalize('HELLO')).toBe('Hello');
            expect(capitalize('hELLO')).toBe('Hello');
        });

        it('should convert to title case', () => {
            expect(toTitleCase('hello world')).toBe('Hello World');
            expect(toTitleCase('GRUNGE PALLETS')).toBe('Grunge Pallets');
        });

        it('should slugify strings', () => {
            expect(slugify('Hello World')).toBe('hello-world');
            expect(slugify('GMA 48x40 Grade A')).toBe('gma-48x40-grade-a');
            expect(slugify('Custom Pallet (Special)')).toBe('custom-pallet-special');
        });
    });

    describe('UUID Utilities', () => {
        const isValidUUID = (id: string): boolean => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            return uuidRegex.test(id);
        };

        const shortenUUID = (id: string): string => {
            return id.split('-')[0].toUpperCase();
        };

        it('should validate UUIDs', () => {
            expect(isValidUUID('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe(true);
            expect(isValidUUID('A1B2C3D4-E5F6-7890-ABCD-EF1234567890')).toBe(true);
            expect(isValidUUID('not-a-uuid')).toBe(false);
            expect(isValidUUID('')).toBe(false);
        });

        it('should shorten UUIDs for display', () => {
            expect(shortenUUID('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe('A1B2C3D4');
        });
    });

    describe('Array Utilities', () => {
        const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
            return array.reduce((groups, item) => {
                const value = String(item[key]);
                groups[value] = groups[value] || [];
                groups[value].push(item);
                return groups;
            }, {} as Record<string, T[]>);
        };

        const chunk = <T>(array: T[], size: number): T[][] => {
            const chunks: T[][] = [];
            for (let i = 0; i < array.length; i += size) {
                chunks.push(array.slice(i, i + size));
            }
            return chunks;
        };

        const unique = <T>(array: T[]): T[] => {
            return Array.from(new Set(array));
        };

        it('should group items by key', () => {
            const items = [
                { status: 'pending', id: 1 },
                { status: 'pending', id: 2 },
                { status: 'delivered', id: 3 },
            ];
            const grouped = groupBy(items, 'status');
            expect(grouped.pending).toHaveLength(2);
            expect(grouped.delivered).toHaveLength(1);
        });

        it('should chunk arrays', () => {
            const array = [1, 2, 3, 4, 5, 6, 7];
            const chunks = chunk(array, 3);
            expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
        });

        it('should remove duplicates', () => {
            expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
            expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
        });
    });

    describe('Number Utilities', () => {
        const clamp = (value: number, min: number, max: number): number => {
            return Math.max(min, Math.min(max, value));
        };

        const roundTo = (value: number, decimals: number): number => {
            const factor = Math.pow(10, decimals);
            return Math.round(value * factor) / factor;
        };

        const percentage = (value: number, total: number): number => {
            if (total === 0) return 0;
            return roundTo((value / total) * 100, 1);
        };

        it('should clamp values', () => {
            expect(clamp(5, 0, 10)).toBe(5);
            expect(clamp(-5, 0, 10)).toBe(0);
            expect(clamp(15, 0, 10)).toBe(10);
        });

        it('should round to specified decimals', () => {
            expect(roundTo(1.2345, 2)).toBe(1.23);
            expect(roundTo(1.2355, 2)).toBe(1.24);
            expect(roundTo(100, 2)).toBe(100);
        });

        it('should calculate percentages', () => {
            expect(percentage(25, 100)).toBe(25);
            expect(percentage(1, 3)).toBe(33.3);
            expect(percentage(0, 0)).toBe(0);
        });
    });

    describe('Validation Utilities', () => {
        const isEmpty = (value: unknown): boolean => {
            if (value === null || value === undefined) return true;
            if (typeof value === 'string') return value.trim() === '';
            if (Array.isArray(value)) return value.length === 0;
            if (typeof value === 'object') return Object.keys(value).length === 0;
            return false;
        };

        const isNumeric = (value: unknown): boolean => {
            if (typeof value === 'number') return !isNaN(value);
            if (typeof value === 'string') return !isNaN(parseFloat(value));
            return false;
        };

        it('should check for empty values', () => {
            expect(isEmpty(null)).toBe(true);
            expect(isEmpty(undefined)).toBe(true);
            expect(isEmpty('')).toBe(true);
            expect(isEmpty('   ')).toBe(true);
            expect(isEmpty([])).toBe(true);
            expect(isEmpty({})).toBe(true);
            expect(isEmpty('hello')).toBe(false);
            expect(isEmpty([1])).toBe(false);
            expect(isEmpty({ a: 1 })).toBe(false);
        });

        it('should check for numeric values', () => {
            expect(isNumeric(123)).toBe(true);
            expect(isNumeric(0)).toBe(true);
            expect(isNumeric('123')).toBe(true);
            expect(isNumeric('12.5')).toBe(true);
            expect(isNumeric(NaN)).toBe(false);
            expect(isNumeric('abc')).toBe(false);
            expect(isNumeric(null)).toBe(false);
        });
    });
});
