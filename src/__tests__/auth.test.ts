/**
 * Authentication Tests
 * Tests for login, signup, and auth flows
 */

import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
    localStorage.clear();
});

describe('Authentication', () => {
    describe('Email Validation', () => {
        const isValidEmail = (email: string): boolean => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };

        it('should accept valid emails', () => {
            const validEmails = [
                'user@example.com',
                'test.user@company.org',
                'name+tag@domain.co.uk',
                'user123@test.io',
            ];

            validEmails.forEach(email => {
                expect(isValidEmail(email)).toBe(true);
            });
        });

        it('should reject invalid emails', () => {
            const invalidEmails = [
                'notanemail',
                '@nodomain.com',
                'user@',
                'user@.com',
                'user name@domain.com',
                '',
            ];

            invalidEmails.forEach(email => {
                expect(isValidEmail(email)).toBe(false);
            });
        });
    });

    describe('Password Validation', () => {
        const isValidPassword = (password: string): boolean => {
            return password.length >= 6;
        };

        it('should accept passwords with 6+ characters', () => {
            expect(isValidPassword('123456')).toBe(true);
            expect(isValidPassword('password123')).toBe(true);
            expect(isValidPassword('VeryLongPassword!')).toBe(true);
        });

        it('should reject passwords with less than 6 characters', () => {
            expect(isValidPassword('')).toBe(false);
            expect(isValidPassword('12345')).toBe(false);
            expect(isValidPassword('abc')).toBe(false);
        });
    });

    describe('Signup Form Validation', () => {
        interface SignupData {
            email: string;
            password: string;
            companyName: string;
            contactName: string;
            phone: string;
            address: string;
            city: string;
            state: string;
            zipCode: string;
        }

        const validateSignup = (data: SignupData): { valid: boolean; errors: string[] } => {
            const errors: string[] = [];

            if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                errors.push('Valid email is required');
            }
            if (!data.password || data.password.length < 6) {
                errors.push('Password must be at least 6 characters');
            }
            if (!data.companyName.trim()) {
                errors.push('Company name is required');
            }
            if (!data.contactName.trim()) {
                errors.push('Contact name is required');
            }
            if (!data.phone.trim()) {
                errors.push('Phone number is required');
            }
            if (!data.address.trim()) {
                errors.push('Address is required');
            }
            if (!data.city.trim()) {
                errors.push('City is required');
            }
            if (!data.state.trim()) {
                errors.push('State is required');
            }
            if (!data.zipCode.trim()) {
                errors.push('ZIP code is required');
            }

            return { valid: errors.length === 0, errors };
        };

        it('should validate complete signup data', () => {
            const validData: SignupData = {
                email: 'test@company.com',
                password: 'password123',
                companyName: 'ACME Corp',
                contactName: 'John Doe',
                phone: '555-123-4567',
                address: '123 Main St',
                city: 'Atlanta',
                state: 'GA',
                zipCode: '30301',
            };

            const result = validateSignup(validData);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should catch missing required fields', () => {
            const incompleteData: SignupData = {
                email: 'test@company.com',
                password: 'password123',
                companyName: '',
                contactName: 'John Doe',
                phone: '',
                address: '123 Main St',
                city: 'Atlanta',
                state: '',
                zipCode: '30301',
            };

            const result = validateSignup(incompleteData);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Company name is required');
            expect(result.errors).toContain('Phone number is required');
            expect(result.errors).toContain('State is required');
        });
    });

    describe('Phone Number Formatting', () => {
        const formatPhone = (phone: string): string => {
            const digits = phone.replace(/\D/g, '');
            if (digits.length === 10) {
                return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
            }
            return phone;
        };

        it('should format 10-digit phone numbers', () => {
            expect(formatPhone('5551234567')).toBe('(555) 123-4567');
            expect(formatPhone('555-123-4567')).toBe('(555) 123-4567');
            expect(formatPhone('(555)1234567')).toBe('(555) 123-4567');
        });

        it('should leave non-10-digit numbers unchanged', () => {
            expect(formatPhone('123')).toBe('123');
            expect(formatPhone('1-800-555-1234')).toBe('1-800-555-1234');
        });
    });

    describe('User Approval Status', () => {
        interface User {
            id: string;
            email: string;
            is_approved: boolean;
            is_admin: boolean;
        }

        const canAccessPortal = (user: User): boolean => {
            return user.is_approved === true;
        };

        const canAccessAdmin = (user: User): boolean => {
            return user.is_approved && user.is_admin;
        };

        it('should allow approved users to access portal', () => {
            const approvedUser: User = {
                id: '1',
                email: 'user@test.com',
                is_approved: true,
                is_admin: false,
            };
            expect(canAccessPortal(approvedUser)).toBe(true);
        });

        it('should block unapproved users from portal', () => {
            const unapprovedUser: User = {
                id: '2',
                email: 'pending@test.com',
                is_approved: false,
                is_admin: false,
            };
            expect(canAccessPortal(unapprovedUser)).toBe(false);
        });

        it('should only allow admin users to access admin panel', () => {
            const regularUser: User = {
                id: '1',
                email: 'user@test.com',
                is_approved: true,
                is_admin: false,
            };
            const adminUser: User = {
                id: '2',
                email: 'admin@test.com',
                is_approved: true,
                is_admin: true,
            };
            const unapprovedAdmin: User = {
                id: '3',
                email: 'newadmin@test.com',
                is_approved: false,
                is_admin: true,
            };

            expect(canAccessAdmin(regularUser)).toBe(false);
            expect(canAccessAdmin(adminUser)).toBe(true);
            expect(canAccessAdmin(unapprovedAdmin)).toBe(false);
        });
    });
});
