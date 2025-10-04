
import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../App';
import type { DataContextType } from '../../App';
import type { Customer } from '../../types';

const CustomerForm: React.FC<{ customer?: Customer; onSave: (customer: Omit<Customer, 'id' | 'debt'> | Customer) => void; onCancel: () => void }> = ({ customer, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name,
                phone: customer.phone,
                address: customer.address,
            });
        }
    }, [customer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(customer ? { ...customer, ...formData } : formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
                <h2 className="text-xl font-bold mb-4 dark:text-white">{customer ? 'Sửa khách hàng' : 'Thêm khách hàng'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Tên khách hàng" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Số điện thoại" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    <input name="address" value={formData.address} onChange={handleChange} placeholder="Địa chỉ" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="bg-gray-300 dark:bg-gray-600 py-2 px-4 rounded-lg hover:bg-gray-400">Huỷ</button>
                        <button type="submit" className="bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const CustomersScreen: React.FC = () => {
    const { customers, addCustomer, updateCustomer, deleteCustomer } = useContext(DataContext) as DataContextType;
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);

    const handleSave = (customerData: Omit<Customer, 'id' | 'debt'> | Customer) => {
        if ('id' in customerData) {
            updateCustomer(customerData);
        } else {
            addCustomer(customerData);
        }
        setShowForm(false);
        setEditingCustomer(undefined);
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setShowForm(true);
    };

    const handleDelete = (customerId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xoá khách hàng này?')) {
            deleteCustomer(customerId);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold dark:text-white">Quản lý Khách hàng</h1>
                <button onClick={() => { setEditingCustomer(undefined); setShowForm(true); }} className="bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 flex items-center gap-2">
                    <i className="fa-solid fa-plus"></i>Thêm khách hàng
                </button>
            </div>
            {showForm && <CustomerForm customer={editingCustomer} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingCustomer(undefined); }} />}

             <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="py-3 px-6">Khách hàng</th>
                            <th scope="col" className="py-3 px-6">Số điện thoại</th>
                            <th scope="col" className="py-3 px-6">Công nợ</th>
                            <th scope="col" className="py-3 px-6">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(customer => (
                            <tr key={customer.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {customer.name}
                                </th>
                                <td className="py-4 px-6">{customer.phone}</td>
                                <td className={`py-4 px-6 font-bold ${customer.debt > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {customer.debt.toLocaleString('vi-VN')} đ
                                </td>
                                <td className="py-4 px-6">
                                    <button onClick={() => handleEdit(customer)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-4">Sửa</button>
                                    <button onClick={() => handleDelete(customer.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Xoá</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomersScreen;
