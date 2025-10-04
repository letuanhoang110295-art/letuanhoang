
import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../App';
import type { DataContextType } from '../../App';
import type { Product } from '../../types';

const ProductForm: React.FC<{ product?: Product; onSave: (product: Omit<Product, 'id'> | Product) => void; onCancel: () => void }> = ({ product, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '', sku: '', barcode: '', costPrice: 0, salePrice: 0, unit: 'Cái', stock: 0, imageUrl: ''
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                sku: product.sku,
                barcode: product.barcode,
                costPrice: product.costPrice,
                salePrice: product.salePrice,
                unit: product.unit,
                stock: product.stock,
                imageUrl: product.imageUrl || ''
            });
        }
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(product ? { ...product, ...formData } : formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
                <h2 className="text-xl font-bold mb-4 dark:text-white">{product ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Tên sản phẩm" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        <input name="sku" value={formData.sku} onChange={handleChange} placeholder="SKU" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        <input name="barcode" value={formData.barcode} onChange={handleChange} placeholder="Mã vạch" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        <input name="unit" value={formData.unit} onChange={handleChange} placeholder="Đơn vị (Cái, Hộp,...)" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        <input name="costPrice" type="number" value={formData.costPrice} onChange={handleChange} placeholder="Giá vốn" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        <input name="salePrice" type="number" value={formData.salePrice} onChange={handleChange} placeholder="Giá bán" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        <input name="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="Tồn kho" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="bg-gray-300 dark:bg-gray-600 py-2 px-4 rounded-lg hover:bg-gray-400">Huỷ</button>
                        <button type="submit" className="bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProductsScreen: React.FC = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useContext(DataContext) as DataContextType;
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

    const handleSave = (productData: Omit<Product, 'id'> | Product) => {
        if ('id' in productData) {
            updateProduct(productData);
        } else {
            addProduct(productData);
        }
        setShowForm(false);
        setEditingProduct(undefined);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleDelete = (productId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xoá sản phẩm này?')) {
            deleteProduct(productId);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold dark:text-white">Quản lý Sản phẩm</h1>
                <button onClick={() => { setEditingProduct(undefined); setShowForm(true); }} className="bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 flex items-center gap-2">
                    <i className="fa-solid fa-plus"></i>Thêm sản phẩm
                </button>
            </div>

            {showForm && <ProductForm product={editingProduct} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingProduct(undefined); }} />}

            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="py-3 px-6">Sản phẩm</th>
                            <th scope="col" className="py-3 px-6">SKU</th>
                            <th scope="col" className="py-3 px-6">Giá vốn</th>
                            <th scope="col" className="py-3 px-6">Giá bán</th>
                            <th scope="col" className="py-3 px-6">Tồn kho</th>
                            <th scope="col" className="py-3 px-6">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <div className="flex items-center gap-3">
                                        <img className="w-10 h-10 rounded-full" src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200`} alt={product.name}/>
                                        {product.name}
                                    </div>
                                </th>
                                <td className="py-4 px-6">{product.sku}</td>
                                <td className="py-4 px-6">{product.costPrice.toLocaleString('vi-VN')} đ</td>
                                <td className="py-4 px-6">{product.salePrice.toLocaleString('vi-VN')} đ</td>
                                <td className="py-4 px-6">{product.stock} {product.unit}</td>
                                <td className="py-4 px-6">
                                    <button onClick={() => handleEdit(product)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-4">Sửa</button>
                                    <button onClick={() => handleDelete(product.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Xoá</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductsScreen;
