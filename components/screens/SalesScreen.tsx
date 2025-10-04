
import React, { useState, useContext, useMemo } from 'react';
import { DataContext } from '../../App';
import type { DataContextType } from '../../App';
import type { Product, Customer, SaleItem } from '../../types';
import { PaymentMethod } from '../../types';
import { useZxing } from 'react-zxing';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const BarcodeScanner: React.FC<{ onScan: (result: string) => void; onClose: () => void; }> = ({ onScan, onClose }) => {
    const { ref } = useZxing({
        onResult(result) {
            onScan(result.getText());
        },
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-lg font-bold mb-4 dark:text-white">Quét mã vạch</h3>
                <video ref={ref} className="w-full rounded-md" />
                <button onClick={onClose} className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600">Đóng</button>
            </div>
        </div>
    );
};

const InvoiceModal: React.FC<{ sale: any; onClose: () => void; }> = ({ sale, onClose }) => {
    const printDocument = () => {
        const input = document.getElementById('invoice-print');
        if (input) {
            html2canvas(input)
                .then((canvas) => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF();
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`hoa-don-${sale.id}.pdf`);
                });
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
                <div id="invoice-print" className="p-4 bg-white text-black">
                     <h2 className="text-2xl font-bold text-center mb-4">Hoá Đơn Bán Hàng</h2>
                     <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="font-bold">Cửa hàng Sổ Bán Hàng Pro</h3>
                            <p>123 Đường Demo, TP. Demo</p>
                        </div>
                         <i className="fa-solid fa-store text-4xl text-primary-500"></i>
                     </div>
                     <hr className="my-2"/>
                     <p><strong>Mã HĐ:</strong> {sale.id}</p>
                     <p><strong>Ngày:</strong> {new Date(sale.date).toLocaleString('vi-VN')}</p>
                     <p><strong>Khách hàng:</strong> {sale.customerName || 'Khách lẻ'}</p>
                     <table className="w-full mt-4 text-left">
                         <thead>
                             <tr className="border-b">
                                 <th className="py-1">Sản phẩm</th>
                                 <th className="py-1 text-center">SL</th>
                                 <th className="py-1 text-right">Đơn giá</th>
                                 <th className="py-1 text-right">Thành tiền</th>
                             </tr>
                         </thead>
                         <tbody>
                             {sale.items.map((item: SaleItem) => (
                                 <tr key={item.productId} className="border-b border-dashed">
                                     <td className="py-1">{item.productName}</td>
                                     <td className="py-1 text-center">{item.quantity}</td>
                                     <td className="py-1 text-right">{item.price.toLocaleString('vi-VN')}</td>
                                     <td className="py-1 text-right">{(item.quantity * item.price).toLocaleString('vi-VN')}</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                     <div className="mt-4 text-right">
                         <p>Tạm tính: <strong>{sale.subtotal.toLocaleString('vi-VN')} đ</strong></p>
                         <p>Chiết khấu: <strong>{sale.discount}%</strong></p>
                         <p>VAT: <strong>{sale.vat}%</strong></p>
                         <p className="text-xl font-bold">Tổng cộng: <strong>{sale.total.toLocaleString('vi-VN')} đ</strong></p>
                     </div>
                      <div className="text-center mt-6">
                        <p>Cảm ơn quý khách!</p>
                     </div>
                </div>
                 <div className="flex justify-end gap-4 mt-6">
                     <button onClick={onClose} className="bg-gray-300 dark:bg-gray-600 py-2 px-4 rounded-lg hover:bg-gray-400">Đóng</button>
                     <button onClick={printDocument} className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
                         <i className="fa-solid fa-file-pdf mr-2"></i>Tải PDF
                     </button>
                 </div>
            </div>
        </div>
    );
};


const SalesScreen: React.FC = () => {
    const { products, customers, addSale } = useContext(DataContext) as DataContextType;
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [discount, setDiscount] = useState(0);
    const [vat, setVat] = useState(0);
    const [selectedCustomer, setSelectedCustomer] = useState<string>('guest');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
    const [isScanning, setIsScanning] = useState(false);
    const [lastSale, setLastSale] = useState<any>(null);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5);
    }, [searchTerm, products]);
    
    const findProductByBarcode = (barcode: string) => {
        return products.find(p => p.barcode === barcode);
    };

    const addToCart = (product: Product, quantity: number = 1) => {
        if (product.stock < quantity) {
            alert('Sản phẩm không đủ tồn kho!');
            return;
        }
        
        const existingItem = cart.find(item => item.productId === product.id);
        if (existingItem) {
            if (product.stock < existingItem.quantity + quantity) {
                alert('Sản phẩm không đủ tồn kho!');
                return;
            }
            setCart(cart.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            ));
        } else {
            setCart([...cart, { productId: product.id, productName: product.name, quantity, price: product.salePrice }]);
        }
        setSearchTerm('');
    };
    
    const handleScan = (result: string) => {
        const product = findProductByBarcode(result);
        if (product) {
            addToCart(product);
        } else {
            alert('Không tìm thấy sản phẩm với mã vạch này.');
        }
        setIsScanning(false);
    };

    const updateQuantity = (productId: string, newQuantity: number) => {
        const product = products.find(p => p.id === productId);
        if(product && product.stock < newQuantity) {
            alert('Sản phẩm không đủ tồn kho!');
            return;
        }
        if (newQuantity <= 0) {
            setCart(cart.filter(item => item.productId !== productId));
        } else {
            setCart(cart.map(item =>
                item.productId === productId ? { ...item, quantity: newQuantity } : item
            ));
        }
    };

    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
    const total = useMemo(() => {
        const discounted = subtotal * (1 - discount / 100);
        return discounted * (1 + vat / 100);
    }, [subtotal, discount, vat]);
    
    const handleCheckout = () => {
        if (cart.length === 0) {
            alert('Giỏ hàng trống!');
            return;
        }
        
        if (paymentMethod === PaymentMethod.DEBT && selectedCustomer === 'guest') {
            alert('Vui lòng chọn khách hàng để ghi nợ.');
            return;
        }

        const customer = customers.find(c => c.id === selectedCustomer);
        const saleData = {
            items: cart,
            subtotal,
            discount,
            vat,
            total,
            paymentMethod,
            customerId: customer?.id,
            customerName: customer?.name || 'Khách lẻ'
        };
        addSale(saleData);
        setLastSale({ ...saleData, id: `HĐ-${Date.now()}`, date: new Date().toISOString() });
        setCart([]);
        setDiscount(0);
        setVat(0);
        setSelectedCustomer('guest');
        setPaymentMethod(PaymentMethod.CASH);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {isScanning && <BarcodeScanner onScan={handleScan} onClose={() => setIsScanning(false)} />}
            {lastSale && <InvoiceModal sale={lastSale} onClose={() => setLastSale(null)} />}
            
            {/* Left side - Product Selection */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Tạo đơn hàng</h2>
                <div className="flex gap-2 items-center relative">
                    <div className="relative flex-grow">
                         <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                         <input
                            type="text"
                            placeholder="Tìm sản phẩm bằng tên hoặc SKU..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                         {filteredProducts.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-b-lg shadow-lg z-10">
                                {filteredProducts.map(p => (
                                    <div key={p.id} onClick={() => addToCart(p)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer dark:text-white">
                                        {p.name} ({p.sku}) - Tồn: {p.stock}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={() => setIsScanning(true)} className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 flex items-center gap-2">
                        <i className="fa-solid fa-barcode"></i>
                        Quét
                    </button>
                </div>
                
                {/* Cart Items */}
                <div className="mt-6 flow-root">
                    <ul className="-my-6 divide-y divide-gray-200 dark:divide-gray-700">
                    {cart.map(item => (
                        <li key={item.productId} className="flex py-6">
                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                                <img src={`https://picsum.photos/seed/${item.productId}/200`} alt={item.productName} className="h-full w-full object-cover object-center"/>
                            </div>
                            <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                                        <h3>{item.productName}</h3>
                                        <p className="ml-4">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.price.toLocaleString('vi-VN')} đ</p>
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm">
                                    <div className="flex items-center border rounded-md">
                                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-3 py-1">-</button>
                                        <input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)} className="w-12 text-center bg-transparent dark:text-white" />
                                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-3 py-1">+</button>
                                    </div>
                                    <div className="flex">
                                        <button type="button" onClick={() => updateQuantity(item.productId, 0)} className="font-medium text-red-600 hover:text-red-500">Xoá</button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                    </ul>
                </div>
            </div>

            {/* Right side - Checkout */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Thanh toán</h2>
                
                <div className="space-y-4 flex-grow">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Khách hàng</label>
                        <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="guest">Khách lẻ</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chiết khấu (%)</label>
                            <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">VAT (%)</label>
                            <input type="number" value={vat} onChange={e => setVat(Number(e.target.value))} className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phương thức thanh toán</label>
                        <div className="mt-2 flex gap-4">
                            {Object.values(PaymentMethod).map(method => (
                                <button key={method} onClick={() => setPaymentMethod(method)} className={`px-4 py-2 rounded-lg text-sm ${paymentMethod === method ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-600 dark:text-white'}`}>
                                    {method === 'CASH' ? 'Tiền mặt' : method === 'TRANSFER' ? 'Chuyển khoản' : 'Ghi nợ'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="border-t pt-4 mt-4 space-y-2 dark:border-gray-600">
                    <div className="flex justify-between dark:text-gray-300">
                        <span>Tạm tính:</span>
                        <span>{subtotal.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex justify-between dark:text-gray-300">
                        <span>Tổng chiết khấu:</span>
                        <span>- {(subtotal * discount / 100).toLocaleString('vi-VN')} đ</span>
                    </div>
                     <div className="flex justify-between dark:text-gray-300">
                        <span>VAT:</span>
                        <span>+ {(subtotal * (1 - discount/100) * vat/100).toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold dark:text-white">
                        <span>Tổng cộng:</span>
                        <span>{total.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <button onClick={handleCheckout} className="w-full bg-green-500 text-white py-3 rounded-lg mt-4 font-bold text-lg hover:bg-green-600">
                        Thanh Toán
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesScreen;
