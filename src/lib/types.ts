// Types for Grunge Pallets website

export interface NavLink {
    label: string;
    href: string;
}

export interface Service {
    id: string;
    icon: string;
    title: string;
    description: string;
    href: string;
}

export interface Product {
    id: string;
    name: string;
    category: 'grade-a' | 'grade-b' | 'heat-treated' | 'custom';
    size: string;
    dimensions: string;
    woodType: string;
    loadCapacity: string;
    entryType: string;
    isHeatTreated: boolean;
    description: string;
    image?: string;
}

export interface Stat {
    id: string;
    icon: string;
    value: number;
    label: string;
    suffix?: string;
}

export interface CompanyInfo {
    name: string;
    tagline: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
}
