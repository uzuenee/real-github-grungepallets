import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    companyName: string;
    contactName: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    signup: (data: SignupData) => Promise<boolean>;
}

interface SignupData {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);

        // Simulate API call
        console.log('Login attempt:', { email, password });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock successful login
        setUser({
            id: '1',
            email,
            companyName: 'Demo Company',
            contactName: 'Demo User',
        });

        setIsLoading(false);
        return true;
    };

    const logout = () => {
        setUser(null);
        console.log('User logged out');
    };

    const signup = async (data: SignupData): Promise<boolean> => {
        setIsLoading(true);

        // Simulate API call
        console.log('Signup attempt:', data);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsLoading(false);
        return true;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                signup,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}