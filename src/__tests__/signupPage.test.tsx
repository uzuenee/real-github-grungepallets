import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import SignupPage from '@/app/signup/page';

jest.mock('@/lib/contexts/AuthContext', () => ({
    useAuth: () => ({
        signUp: jest.fn(async () => ({ error: null })),
    }),
}));

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt, ...props }: { src: string; alt: string }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} {...props} />
    ),
}));

describe('Signup Page', () => {
    it('disables native HTML validation to avoid pattern/type mismatch blocking submit', () => {
        const { container } = render(<SignupPage />);

        const form = container.querySelector('form');
        expect(form).toBeInTheDocument();
        expect(form).toHaveAttribute('novalidate');

        const zip = screen.getByLabelText('ZIP');
        expect(zip).toBeInTheDocument();
        expect(zip).not.toHaveAttribute('pattern');
    });
});

