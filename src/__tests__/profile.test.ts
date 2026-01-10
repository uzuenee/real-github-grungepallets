/**
 * Profile Tests
 * Tests for user profile management and validation
 */

describe('Profile Management', () => {
    describe('Profile Data Validation', () => {
        interface Profile {
            company_name: string;
            contact_name: string;
            phone: string;
            address: string;
            city: string;
            state: string;
            zip_code: string;
        }

        const validateProfile = (profile: Profile): { valid: boolean; errors: string[] } => {
            const errors: string[] = [];

            if (!profile.company_name.trim()) {
                errors.push('Company name is required');
            }
            if (!profile.contact_name.trim()) {
                errors.push('Contact name is required');
            }
            if (!profile.phone.trim()) {
                errors.push('Phone number is required');
            }
            if (!profile.address.trim()) {
                errors.push('Address is required');
            }
            if (!profile.city.trim()) {
                errors.push('City is required');
            }
            if (!profile.state.trim()) {
                errors.push('State is required');
            }
            if (!profile.zip_code.trim()) {
                errors.push('ZIP code is required');
            }

            return { valid: errors.length === 0, errors };
        };

        it('should validate complete profile', () => {
            const profile: Profile = {
                company_name: 'ACME Corp',
                contact_name: 'John Doe',
                phone: '555-123-4567',
                address: '123 Main St',
                city: 'Atlanta',
                state: 'GA',
                zip_code: '30301',
            };

            const result = validateProfile(profile);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should catch missing fields', () => {
            const profile: Profile = {
                company_name: 'ACME Corp',
                contact_name: '',
                phone: '555-123-4567',
                address: '',
                city: 'Atlanta',
                state: 'GA',
                zip_code: '',
            };

            const result = validateProfile(profile);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Contact name is required');
            expect(result.errors).toContain('Address is required');
            expect(result.errors).toContain('ZIP code is required');
        });

        it('should reject whitespace-only values', () => {
            const profile: Profile = {
                company_name: '   ',
                contact_name: 'John Doe',
                phone: '555-123-4567',
                address: '123 Main St',
                city: 'Atlanta',
                state: 'GA',
                zip_code: '30301',
            };

            const result = validateProfile(profile);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Company name is required');
        });
    });

    describe('ZIP Code Validation', () => {
        const isValidUSZipCode = (zip: string): boolean => {
            // US ZIP code: 5 digits or 5+4 format
            const zipRegex = /^\d{5}(-\d{4})?$/;
            return zipRegex.test(zip);
        };

        it('should accept valid 5-digit ZIP codes', () => {
            expect(isValidUSZipCode('30301')).toBe(true);
            expect(isValidUSZipCode('10001')).toBe(true);
            expect(isValidUSZipCode('90210')).toBe(true);
        });

        it('should accept valid ZIP+4 format', () => {
            expect(isValidUSZipCode('30301-1234')).toBe(true);
            expect(isValidUSZipCode('10001-0001')).toBe(true);
        });

        it('should reject invalid ZIP codes', () => {
            expect(isValidUSZipCode('123')).toBe(false);
            expect(isValidUSZipCode('1234567')).toBe(false);
            expect(isValidUSZipCode('abcde')).toBe(false);
            expect(isValidUSZipCode('30301-12')).toBe(false);
            expect(isValidUSZipCode('')).toBe(false);
        });
    });

    describe('State Abbreviation Validation', () => {
        const validStates = [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
            'DC', // District of Columbia
        ];

        const isValidState = (state: string): boolean => {
            return validStates.includes(state.toUpperCase());
        };

        it('should accept valid state abbreviations', () => {
            expect(isValidState('GA')).toBe(true);
            expect(isValidState('CA')).toBe(true);
            expect(isValidState('NY')).toBe(true);
            expect(isValidState('TX')).toBe(true);
        });

        it('should be case-insensitive', () => {
            expect(isValidState('ga')).toBe(true);
            expect(isValidState('Ga')).toBe(true);
        });

        it('should reject invalid state codes', () => {
            expect(isValidState('XX')).toBe(false);
            expect(isValidState('Georgia')).toBe(false);
            expect(isValidState('')).toBe(false);
        });

        it('should accept DC', () => {
            expect(isValidState('DC')).toBe(true);
        });
    });

    describe('Address Formatting', () => {
        interface Address {
            address: string;
            city: string;
            state: string;
            zip_code: string;
        }

        const formatFullAddress = (addr: Address): string => {
            return `${addr.address}, ${addr.city}, ${addr.state} ${addr.zip_code}`;
        };

        const formatAddressLines = (addr: Address): [string, string] => {
            return [
                addr.address,
                `${addr.city}, ${addr.state} ${addr.zip_code}`,
            ];
        };

        it('should format full address on one line', () => {
            const addr: Address = {
                address: '123 Main St',
                city: 'Atlanta',
                state: 'GA',
                zip_code: '30301',
            };
            expect(formatFullAddress(addr)).toBe('123 Main St, Atlanta, GA 30301');
        });

        it('should format address into two lines', () => {
            const addr: Address = {
                address: '456 Oak Ave Suite 100',
                city: 'Los Angeles',
                state: 'CA',
                zip_code: '90001',
            };
            const [line1, line2] = formatAddressLines(addr);
            expect(line1).toBe('456 Oak Ave Suite 100');
            expect(line2).toBe('Los Angeles, CA 90001');
        });
    });

    describe('Display Name Generation', () => {
        const getDisplayName = (companyName: string | null, contactName: string | null): string => {
            if (companyName && companyName.trim()) {
                return companyName.trim();
            }
            if (contactName && contactName.trim()) {
                return contactName.trim();
            }
            return 'Customer';
        };

        const getInitials = (name: string): string => {
            const words = name.trim().split(/\s+/);
            if (words.length >= 2) {
                return (words[0][0] + words[words.length - 1][0]).toUpperCase();
            }
            return name.slice(0, 2).toUpperCase();
        };

        it('should prefer company name', () => {
            expect(getDisplayName('ACME Corp', 'John Doe')).toBe('ACME Corp');
        });

        it('should fall back to contact name', () => {
            expect(getDisplayName('', 'John Doe')).toBe('John Doe');
            expect(getDisplayName(null, 'John Doe')).toBe('John Doe');
        });

        it('should use default when both are empty', () => {
            expect(getDisplayName('', '')).toBe('Customer');
            expect(getDisplayName(null, null)).toBe('Customer');
            expect(getDisplayName('   ', '   ')).toBe('Customer');
        });

        it('should generate initials from company names', () => {
            expect(getInitials('ACME Corp')).toBe('AC');
            expect(getInitials('Big Business LLC')).toBe('BL');
        });

        it('should generate initials from single word', () => {
            expect(getInitials('ACME')).toBe('AC');
        });
    });
});
