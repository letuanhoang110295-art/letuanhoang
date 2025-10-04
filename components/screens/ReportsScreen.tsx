
import React, { useContext, useMemo } from 'react';
import { DataContext } from '../../App';
import type { DataContextType } from '../../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ReportsScreen: React.FC = () => {
    const { sales, products } = useContext(DataContext) as DataContextType;

    const dailyRevenueData = useMemo(() => {
        const revenueByDay: { [key: string]: number } = {};
        sales.forEach(sale => {
            const date = new Date(sale.date).toISOString().split('T')[0];
            if (!revenueByDay[date]) {
                revenueByDay[date] = 0;
            }
            revenueByDay[date] += sale.total;
        });

        return Object.entries(revenueByDay)
            .map(([date, revenue]) => ({ name: new Date(date).toLocaleDateString('vi-VN'), revenue }))
            .sort((a,b) => new Date(a.name.split('/').reverse().join('-')).getTime() - new Date(b.name.split('/').reverse().join('-')).getTime());

    }, [sales]);

    const topProductsData = useMemo(() => {
        const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
                }
                productSales[item.productId].quantity += item.quantity;
                productSales[item.productId].revenue += item.price * item.quantity;
            });
        });

        return Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }, [sales]);
    
    const kpis = useMemo(() => {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalSales = sales.length;
        const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
        return {
            totalRevenue,
            totalSales,
            averageOrderValue
        };
    }, [sales]);

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6 dark:text-white">Báo cáo kinh doanh</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-lg text-center">
                    <h3 className="text-lg text-primary-800 dark:text-primary-200">Tổng Doanh Thu</h3>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{kpis.totalRevenue.toLocaleString('vi-VN')} đ</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-center">
                    <h3 className="text-lg text-green-800 dark:text-green-200">Tổng Đơn Hàng</h3>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{kpis.totalSales}</p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg text-center">
                    <h3 className="text-lg text-yellow-800 dark:text-yellow-200">Giá Trị Đơn Trung Bình</h3>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{kpis.averageOrderValue.toLocaleString('vi-VN', {maximumFractionDigits: 0})} đ</p>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Doanh thu theo ngày</h2>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={dailyRevenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => new Intl.NumberFormat('vi-VN').format(Number(value))}/>
                            <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')} đ`} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#3b82f6" name="Doanh thu" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-4 dark:text-white">Top 5 sản phẩm bán chạy</h2>
                <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="py-3 px-6">Sản phẩm</th>
                                <th scope="col" className="py-3 px-6">Số lượng bán</th>
                                <th scope="col" className="py-3 px-6">Doanh thu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProductsData.map(product => (
                                <tr key={product.name} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">{product.name}</th>
                                    <td className="py-4 px-6">{product.quantity}</td>
                                    <td className="py-4 px-6">{product.revenue.toLocaleString('vi-VN')} đ</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsScreen;
