import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, ShoppingBag, FolderKanban, ShieldCheck } from 'lucide-react';

import Login from './components/Login';
import heroIllustration from './assets/printflow_hero.png';

// Customer Page imports
import { Home, ProductDetails, CartPage, ProfilePage, OrdersPage } from './pages/customer/CustomerPages';

// Owner Page imports
import { OrdersManager, ProductsManager, CustomersManager, AnalyticsPage, SettingsPage } from './pages/owner/OwnerPages';
import Dashboard from './components/Dashboard';

const BACKEND_URL = 'http://127.0.0.1:5005';

const CATALOG = [
  { id: 'flex', type: 'flex', icon: '🏁', title: 'Flex Banner', description: 'Weatherproof vinyl banners for outdoor advertising, events, and shop fronts.', basePrice: 12, category: 'Marketing' },
  { id: 'poster', type: 'poster', icon: '🖼️', title: 'Posters', description: 'Vibrant high-resolution wall posters on glossy or matte art paper.', basePrice: 15, category: 'Marketing' },
  { id: 'visiting_card', type: 'visiting_card', icon: '📇', title: 'Visiting Cards', description: 'Premium business cards with matte coating, rounded edges, or spot UV finishes.', basePrice: 2, category: 'Stationery' },
  { id: 'id_card', type: 'id_card', icon: '🪪', title: 'ID Cards', description: 'Durable plastic identity cards with customizable royal lanyards.', basePrice: 45, category: 'Stationery' },
  { id: 'brochure', type: 'brochure', icon: '📖', title: 'Brochures & Flyers', description: 'Professional multi-fold handouts, bi-fold or tri-fold on premium art card.', basePrice: 4, category: 'Marketing' }
];

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(CATALOG[0]);
  const [theme, setTheme] = useState('light');
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Initialize session
  useEffect(() => {
    const sessionUser = localStorage.getItem('printflow_user');
    if (sessionUser) {
      const parsed = JSON.parse(sessionUser);
      setUser(parsed);
      if (parsed.role === 'owner') {
        navigate('/owner');
      } else {
        navigate('/');
      }
    }
  }, []);

  const handleLogin = (newUser) => {
    setUser(newUser);
    localStorage.setItem('printflow_user', JSON.stringify(newUser));
    if (newUser.role === 'owner') {
      navigate('/owner');
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('printflow_user');
    setCart([]);
    navigate('/');
    triggerToast('Logged out successfully.');
  };

  // Theme support
  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
  }, [theme]);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddToCart = (newItem) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.id === newItem.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = newItem;
        return updated;
      } else {
        return [...prev, newItem];
      }
    });
    triggerToast('Added item to print cart!');
  };

  const handleRemoveFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    triggerToast('Removed item from cart.');
  };

  if (!user) {
    return (
      <div className="relative min-h-screen z-10 flex flex-col justify-center items-center bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
        <Login onLogin={handleLogin} onToast={triggerToast} theme={theme} setTheme={setTheme} />
        {toast && (
          <div className="fixed bottom-6 right-6 z-[999] bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl text-xs font-semibold animate-bounce">
            {toast}
          </div>
        )}
      </div>
    );
  }

  const isOwnerPath = location.pathname.startsWith('/owner');

  return (
    <div className="relative min-h-screen z-10 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      {/* Background warm gold subtle halo blobs */}
      <div className="blob w-[45vw] h-[45vw] top-[-10%] right-[-10%]"></div>
      
      {/* Primary Header Navbar */}
      <header className="sticky top-0 z-40 bg-[var(--color-header)] text-[var(--color-header-text)] border-b border-[var(--color-header-border)] shadow-[var(--color-shadow)] px-6 py-4 flex justify-between items-center transition-colors">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => {
            if (user.role === 'customer') {
              navigate('/');
            } else {
              navigate('/owner');
            }
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-accent-gradient text-white font-extrabold flex items-center justify-center text-xl shadow-lg shadow-amber-500/10">P</div>
          <span className="text-xl font-extrabold text-accent-gradient">PrintFlow</span>
        </div>
        
        {/* Navigation Actions */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold bg-slate-100 dark:bg-[#1E1E1E] text-slate-700 dark:text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-200 dark:border-slate-800/80">
            <User className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="font-extrabold">{user.name}</span>
            <span className="opacity-60">|</span>
            <span className="text-[10px] uppercase tracking-wider">{user.role === 'owner' ? 'Owner Portal' : 'Customer Portal'}</span>
          </span>

          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
            className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* Customer Specific Navbar actions */}
          {user.role === 'customer' && (
            <>
              <Link 
                to="/orders"
                className={`btn px-4 py-2 text-sm font-semibold rounded-lg transition flex items-center gap-2 cursor-pointer ${
                  location.pathname === '/orders' 
                    ? 'bg-accent-gradient text-black shadow-md' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-705 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>📦 My Dashboard</span>
              </Link>

              <Link 
                to="/cart"
                className={`btn px-4 py-2 text-sm font-semibold rounded-lg transition flex items-center gap-2 cursor-pointer ${
                  location.pathname === '/cart' 
                    ? 'bg-accent-gradient text-black shadow-md' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-705 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>🛒 Cart</span>
                <span className="bg-[var(--color-primary)] text-black text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {cart.length}
                </span>
              </Link>

              <Link 
                to="/profile"
                className={`btn px-4 py-2 text-sm font-semibold rounded-lg transition flex items-center gap-2 cursor-pointer ${
                  location.pathname === '/profile' 
                    ? 'bg-accent-gradient text-black shadow-md' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-705 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>👤 Profile</span>
              </Link>
            </>
          )}

          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="btn px-4 py-2 text-sm font-semibold rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition flex items-center gap-1 cursor-pointer"
          >
            <span>Logout</span>
            <span>👋</span>
          </button>
        </div>
      </header>

      {/* Owner Portal Sub-header Navbar */}
      {user.role === 'owner' && isOwnerPath && (
        <div className="bg-[var(--color-card)] border-b border-[var(--color-border)] px-6 py-2.5 flex items-center gap-6 overflow-x-auto scrollbar-none z-30 relative">
          <Link to="/owner" className={`text-xs font-black uppercase tracking-wider transition whitespace-nowrap ${location.pathname === '/owner' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] pb-1' : 'text-[var(--color-text-sec)] hover:text-[var(--color-text)]'}`}>📊 Overview</Link>
          <Link to="/owner/orders" className={`text-xs font-black uppercase tracking-wider transition whitespace-nowrap ${location.pathname === '/owner/orders' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] pb-1' : 'text-[var(--color-text-sec)] hover:text-[var(--color-text)]'}`}>📦 Orders</Link>
          <Link to="/owner/products" className={`text-xs font-black uppercase tracking-wider transition whitespace-nowrap ${location.pathname === '/owner/products' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] pb-1' : 'text-[var(--color-text-sec)] hover:text-[var(--color-text)]'}`}>👕 Products</Link>
          <Link to="/owner/customers" className={`text-xs font-black uppercase tracking-wider transition whitespace-nowrap ${location.pathname === '/owner/customers' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] pb-1' : 'text-[var(--color-text-sec)] hover:text-[var(--color-text)]'}`}>👥 Customers</Link>
          <Link to="/owner/analytics" className={`text-xs font-black uppercase tracking-wider transition whitespace-nowrap ${location.pathname === '/owner/analytics' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] pb-1' : 'text-[var(--color-text-sec)] hover:text-[var(--color-text)]'}`}>📈 Analytics</Link>
          <Link to="/owner/settings" className={`text-xs font-black uppercase tracking-wider transition whitespace-nowrap ${location.pathname === '/owner/settings' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] pb-1' : 'text-[var(--color-text-sec)] hover:text-[var(--color-text)]'}`}>⚙️ Settings</Link>
        </div>
      )}

      {/* Main Pages Router wrapper */}
      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <Routes>
          {/* Customer Portal Routes */}
          {user.role === 'customer' && (
            <>
              <Route path="/" element={<Home catalog={CATALOG} onSelectProduct={setSelectedProduct} onToast={triggerToast} />} />
              <Route path="/product/:id" element={<ProductDetails product={selectedProduct} onAddToCart={handleAddToCart} triggerToast={triggerToast} />} />
              <Route path="/cart" element={<CartPage cart={cart} onRemoveFromCart={handleRemoveFromCart} onClearCart={() => setCart([])} user={user} onToast={triggerToast} />} />
              <Route path="/orders" element={<OrdersPage user={user} onToast={triggerToast} />} />
              <Route path="/profile" element={<ProfilePage user={user} onToast={triggerToast} />} />
            </>
          )}

          {/* Owner Portal Routes */}
          {user.role === 'owner' && (
            <>
              <Route path="/owner" element={<Dashboard onToast={triggerToast} />} />
              <Route path="/owner/orders" element={<OrdersManager onToast={triggerToast} />} />
              <Route path="/owner/products" element={<ProductsManager catalog={CATALOG} onToast={triggerToast} />} />
              <Route path="/owner/customers" element={<CustomersManager />} />
              <Route path="/owner/analytics" element={<AnalyticsPage />} />
              <Route path="/owner/settings" element={<SettingsPage onToast={triggerToast} />} />
            </>
          )}
        </Routes>
      </main>

      {/* Logout confirm dialog modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[22px] p-6 max-w-sm w-full shadow-2xl space-y-6 text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto text-xl font-bold">
              👋
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-[var(--color-text)]">Verify Log Out</h3>
              <p className="text-xs text-[var(--color-text-sec)] leading-relaxed">
                Are you sure you want to log out of your PrintFlow account? This will clear your current cart.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)] text-[var(--color-text-sec)] text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-accent-gradient hover:bg-accent-gradient-hover text-black text-xs font-black transition cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[999] bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl text-xs font-semibold animate-bounce">
          {toast}
        </div>
      )}
    </div>
  );
}
