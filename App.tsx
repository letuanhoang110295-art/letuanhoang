
import React, { useState, createContext, useEffect, useCallback, useMemo } from 'react';
import type { Product, Customer, Sale, Theme } from './types';
import { initialSeedData, dataService } from './services/dataService';
import Layout from './components/Layout';
import SalesScreen from './components/screens/SalesScreen';
import ProductsScreen from './components/screens/ProductsScreen';
import CustomersScreen from './components/screens/CustomersScreen';
import ReportsScreen from './components/screens/ReportsScreen';

export interface DataContextType {
    products: Product[];
    customers: Customer[];
    sales: Sale[];
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (productId: string) => void;
    addCustomer: (customer: Omit<Customer, 'id' | 'debt'>) => void;
    updateCustomer: (customer: Customer) => void;
    deleteCustomer: (customerId: string) => void;
    addSale: (sale: Omit<Sale, 'id' | 'date'>) => void;
    updateCustomerDebt: (customerId: string, amount: number) => void;
}

export const DataContext = createContext<DataContextType | null>(null);

const App: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [activeScreen, setActiveScreen] = useState('sales');
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const { products, customers, sales } = dataService.loadData();
        if (products.length === 0 && customers.length === 0 && sales.length === 0) {
            const seededData = initialSeedData();
            setProducts(seededData.products);
            setCustomers(seededData.customers);
            setSales(seededData.sales);
            dataService.saveAllData(seededData.products, seededData.customers, seededData.sales);
        } else {
            setProducts(products);
            setCustomers(customers);
            setSales(sales);
        }

        const storedTheme = localStorage.getItem('theme') as Theme;
        if (storedTheme) {
            setTheme(storedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    const handleAddProduct = useCallback((productData: Omit<Product, 'id'>) => {
        setProducts(prev => {
            const newProducts = dataService.addProduct(prev, productData);
            dataService.saveProducts(newProducts);
            return newProducts;
        });
    }, []);

    const handleUpdateProduct = useCallback((updatedProduct: Product) => {
        setProducts(prev => {
            const newProducts = dataService.updateProduct(prev, updatedProduct);
            dataService.saveProducts(newProducts);
            return newProducts;
        });
    }, []);
    
    const handleDeleteProduct = useCallback((productId: string) => {
        setProducts(prev => {
            const newProducts = dataService.deleteProduct(prev, productId);
            dataService.saveProducts(newProducts);
            return newProducts;
        });
    }, []);

    const handleAddCustomer = useCallback((customerData: Omit<Customer, 'id' | 'debt'>) => {
        setCustomers(prev => {
            const newCustomers = dataService.addCustomer(prev, customerData);
            dataService.saveCustomers(newCustomers);
            return newCustomers;
        });
    }, []);
    
    const handleUpdateCustomer = useCallback((updatedCustomer: Customer) => {
        setCustomers(prev => {
            const newCustomers = dataService.updateCustomer(prev, updatedCustomer);
            dataService.saveCustomers(newCustomers);
            return newCustomers;
        });
    }, []);

    const handleDeleteCustomer = useCallback((customerId: string) => {
        setCustomers(prev => {
            const newCustomers = dataService.deleteCustomer(prev, customerId);
            dataService.saveCustomers(newCustomers);
            return newCustomers;
        });
    }, []);
    
    const updateCustomerDebt = useCallback((customerId: string, amount: number) => {
        setCustomers(prevCustomers => {
            const newCustomers = prevCustomers.map(c => 
                c.id === customerId ? { ...c, debt: c.debt + amount } : c
            );
            dataService.saveCustomers(newCustomers);
            return newCustomers;
        });
    }, []);
    
    const handleAddSale = useCallback((saleData: Omit<Sale, 'id' | 'date'>) => {
        const newSale = { ...saleData, id: `sale_${Date.now()}`, date: new Date().toISOString() };
        
        // Update product stock
        setProducts(prevProducts => {
            const newProducts = [...prevProducts];
            newSale.items.forEach(item => {
                const productIndex = newProducts.findIndex(p => p.id === item.productId);
                if (productIndex !== -1) {
                    newProducts[productIndex] = {
                        ...newProducts[productIndex],
                        stock: newProducts[productIndex].stock - item.quantity,
                    };
                }
            });
            dataService.saveProducts(newProducts);
            return newProducts;
        });
        
        // Update customer debt if applicable
        if (newSale.paymentMethod === 'DEBT' && newSale.customerId) {
            updateCustomerDebt(newSale.customerId, newSale.total);
        }
        
        // Add sale and save
        setSales(prevSales => {
            const newSales = [newSale, ...prevSales];
            dataService.saveSales(newSales);
            return newSales;
        });
    }, [updateCustomerDebt]);

    const dataContextValue = useMemo(() => ({
        products,
        customers,
        sales,
        addProduct: handleAddProduct,
        updateProduct: handleUpdateProduct,
        deleteProduct: handleDeleteProduct,
        addCustomer: handleAddCustomer,
        updateCustomer: handleUpdateCustomer,
        deleteCustomer: handleDeleteCustomer,
        addSale: handleAddSale,
        updateCustomerDebt,
    }), [products, customers, sales, handleAddProduct, handleUpdateProduct, handleDeleteProduct, handleAddCustomer, handleUpdateCustomer, handleDeleteCustomer, handleAddSale, updateCustomerDebt]);

    const renderScreen = () => {
        switch (activeScreen) {
            case 'sales':
                return <SalesScreen />;
            case 'products':
                return <ProductsScreen />;
            case 'customers':
                return <CustomersScreen />;
            case 'reports':
                return <ReportsScreen />;
            default:
                return <SalesScreen />;
        }
    };
    
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <DataContext.Provider value={dataContextValue}>
            <Layout activeScreen={activeScreen} setActiveScreen={setActiveScreen} theme={theme} toggleTheme={toggleTheme}>
                {renderScreen()}
            </Layout>
        </DataContext.Provider>
    );
};

export default App;
