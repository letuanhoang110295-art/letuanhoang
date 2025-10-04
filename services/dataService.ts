
import type { Product, Customer, Sale } from '../types';

const PRODUCTS_KEY = 'sobanhang_products';
const CUSTOMERS_KEY = 'sobanhang_customers';
const SALES_KEY = 'sobanhang_sales';

export const dataService = {
    loadData: () => {
        const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]') as Product[];
        const customers = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]') as Customer[];
        const sales = JSON.parse(localStorage.getItem(SALES_KEY) || '[]') as Sale[];
        return { products, customers, sales };
    },

    saveProducts: (products: Product[]) => {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    },

    saveCustomers: (customers: Customer[]) => {
        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    },

    saveSales: (sales: Sale[]) => {
        localStorage.setItem(SALES_KEY, JSON.stringify(sales));
    },
    
    saveAllData: (products: Product[], customers: Customer[], sales: Sale[]) => {
        dataService.saveProducts(products);
        dataService.saveCustomers(customers);
        dataService.saveSales(sales);
    },

    addProduct: (products: Product[], productData: Omit<Product, 'id'>): Product[] => {
        const newProduct: Product = { ...productData, id: `prod_${Date.now()}` };
        return [...products, newProduct];
    },
    
    updateProduct: (products: Product[], updatedProduct: Product): Product[] => {
        return products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    },
    
    deleteProduct: (products: Product[], productId: string): Product[] => {
        return products.filter(p => p.id !== productId);
    },
    
    addCustomer: (customers: Customer[], customerData: Omit<Customer, 'id' | 'debt'>): Customer[] => {
        const newCustomer: Customer = { ...customerData, id: `cust_${Date.now()}`, debt: 0 };
        return [...customers, newCustomer];
    },

    updateCustomer: (customers: Customer[], updatedCustomer: Customer): Customer[] => {
        return customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c);
    },
    
    deleteCustomer: (customers: Customer[], customerId: string): Customer[] => {
        return customers.filter(c => c.id !== customerId);
    }
};

export const initialSeedData = () => {
    const products: Product[] = [
        { id: 'prod_1', name: 'Nước suối Aquafina', sku: 'AQUA500', barcode: '8934588022222', costPrice: 3000, salePrice: 5000, unit: 'Chai', stock: 100, imageUrl: 'https://picsum.photos/seed/aqua/200' },
        { id: 'prod_2', name: 'Bánh mì Sandwich', sku: 'BMSW', barcode: '8936015693005', costPrice: 15000, salePrice: 22000, unit: 'Gói', stock: 50, imageUrl: 'https://picsum.photos/seed/banhmi/200' },
        { id: 'prod_3', name: 'Sữa tươi Vinamilk', sku: 'STVNM1L', barcode: '8934673132014', costPrice: 28000, salePrice: 35000, unit: 'Hộp', stock: 80, imageUrl: 'https://picsum.photos/seed/sua/200' },
        { id: 'prod_4', name: 'Mì gói Hảo Hảo', sku: 'MHH', barcode: '8934563103009', costPrice: 3000, salePrice: 4500, unit: 'Gói', stock: 200, imageUrl: 'https://picsum.photos/seed/migoi/200' },
        { id: 'prod_5', name: 'Bia Tiger Crystal', sku: 'TIGCRYS', barcode: '8934602113010', costPrice: 15000, salePrice: 18000, unit: 'Lon', stock: 120, imageUrl: 'https://picsum.photos/seed/bia/200' }
    ];

    const customers: Customer[] = [
        { id: 'cust_1', name: 'Anh Minh', phone: '0909123456', address: '123 Đường ABC, Q1, TPHCM', debt: 0 },
        { id: 'cust_2', name: 'Chị Lan', phone: '0987654321', address: '456 Đường XYZ, Q3, TPHCM', debt: 250000 },
        { id: 'cust_3', name: 'Cô Ba', phone: '0912345678', address: '789 Đường LMN, Q. Tân Bình, TPHCM', debt: 0 }
    ];

    const sales: Sale[] = [];

    return { products, customers, sales };
};
