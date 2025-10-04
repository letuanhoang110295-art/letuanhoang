
export interface Product {
    id: string;
    name: string;
    sku: string;
    barcode: string;
    costPrice: number;
    salePrice: number;
    unit: string;
    stock: number;
    imageUrl?: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    address: string;
    debt: number;
}

export interface SaleItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}

export enum PaymentMethod {
    CASH = 'CASH',
    TRANSFER = 'TRANSFER',
    DEBT = 'DEBT'
}

export interface Sale {
    id: string;
    items: SaleItem[];
    subtotal: number;
    discount: number; // percentage
    vat: number; // percentage
    total: number;
    paymentMethod: PaymentMethod;
    customerId?: string;
    customerName?: string;
    date: string;
}

export type Theme = 'light' | 'dark';
