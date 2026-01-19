/**
 * Formats a phone number as (XXX) XXX-XXXX as the user types
 * Handles US phone numbers
 */
export function formatPhoneNumber(value: string): string {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // Limit to 10 digits
    const limited = numbers.slice(0, 10);

    // Format based on length
    if (limited.length === 0) {
        return '';
    } else if (limited.length <= 3) {
        return `(${limited}`;
    } else if (limited.length <= 6) {
        return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    } else {
        return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
    }
}

/**
 * Returns just the digits from a formatted phone number
 */
export function unformatPhoneNumber(value: string): string {
    return value.replace(/\D/g, '');
}

/**
 * Validates that a phone number has 10 digits
 */
export function isValidPhoneNumber(value: string): boolean {
    const digits = value.replace(/\D/g, '');
    return digits.length === 10;
}
