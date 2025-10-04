
import React from 'react';
import type { Theme } from '../types';

interface LayoutProps {
    children: React.ReactNode;
    activeScreen: string;
    setActiveScreen: (screen: string) => void;
    theme: Theme;
    toggleTheme: () => void;
}

const NavItem: React.FC<{ icon: string; label: string; screen: string; activeScreen: string; onClick: (screen: string) => void;}> = ({ icon, label, screen, activeScreen, onClick }) => {
    const isActive = activeScreen === screen;
    return (
        <li>
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); onClick(screen); }}
                className={`flex items-center p-2 rounded-lg group ${isActive ? 'bg-primary-500 text-white' : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
                <i className={`w-6 h-6 text-xl transition duration-75 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'} fa-solid ${icon}`}></i>
                <span className="ml-3">{label}</span>
            </a>
        </li>
    );
};

const Layout: React.FC<LayoutProps> = ({ children, activeScreen, setActiveScreen, theme, toggleTheme }) => {
    return (
        <div>
            <aside id="logo-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
                <div className="h-full px-3 py-4 overflow-y-auto bg-white dark:bg-gray-800 shadow-lg">
                    <a href="#" className="flex items-center pl-2.5 mb-5">
                        <i className="fa-solid fa-store text-3xl h-8 mr-3 text-primary-500"></i>
                        <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Sổ Bán Hàng Pro</span>
                    </a>
                    <ul className="space-y-2 font-medium">
                        <NavItem icon="fa-cash-register" label="Bán Hàng" screen="sales" activeScreen={activeScreen} onClick={setActiveScreen} />
                        <NavItem icon="fa-box-archive" label="Sản Phẩm" screen="products" activeScreen={activeScreen} onClick={setActiveScreen} />
                        <NavItem icon="fa-users" label="Khách Hàng" screen="customers" activeScreen={activeScreen} onClick={setActiveScreen} />
                        <NavItem icon="fa-chart-line" label="Báo Cáo" screen="reports" activeScreen={activeScreen} onClick={setActiveScreen} />
                    </ul>
                    <div className="absolute bottom-4 left-4">
                      <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                          {theme === 'light' ? <i className="fa-solid fa-moon text-xl"></i> : <i className="fa-solid fa-sun text-xl"></i>}
                      </button>
                    </div>
                </div>
            </aside>

            <main className="p-4 sm:ml-64">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
