import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Search, ArrowRight, Star, Tag, ShoppingBag, Plus, Minus, Trash2, 
  User, MapPin, Bell, Shield, Key, Sliders, Check, Printer, FileText,
  Upload, Info, CreditCard, ChevronRight, CheckCircle, Package, Send, Download, Link2
} from 'lucide-react';
import CustomerOrdersList from '../../components/CustomerOrdersList';

const BACKEND_URL = 'https://print-flow-delta.vercel.app';

// Mock catalog categories & popular items
const CATEGORIES = [
  { id: 'marketing', name: 'Marketing Materials', count: 12, icon: '📢' },
  { id: 'stationery', name: 'Office Stationery', count: 8, icon: '📁' },
  { id: 'apparel', name: 'Custom Apparel', count: 6, icon: '👕' },
  { id: 'packaging', name: 'Packaging & Labels', count: 9, icon: '📦' }
];

const OFFERS = [
  { code: 'GOLDPRINT', discount: '15% Off', desc: 'On all luxury gold foil business cards', expiry: 'Ends July 31' },
  { code: 'BULKSAVE', discount: '₹500 Off', desc: 'On corporate brochure orders above ₹3,000', expiry: 'Ends Aug 15' }
];

// ==========================================
// 1. HOME PAGE
// ==========================================
export function Home({ catalog, onSelectProduct, onToast }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredCatalog = catalog.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Search & Categories Pill Bar */}
      <div className="bg-[var(--color-card)] p-4 rounded-[22px] border border-[var(--color-border)] shadow-[var(--color-shadow)] flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {['All', 'Marketing', 'Stationery', 'Packaging'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-[18px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-accent-gradient text-black shadow-md shadow-amber-500/10'
                  : 'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-sec)] hover:bg-[var(--color-surface)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search premium templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-[18px] border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] placeholder-slate-400"
          />
        </div>
      </div>

      {/* Featured Products Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--color-text)]">Select Print Product</h2>
            <p className="text-xs text-[var(--color-text-sec)] mt-0.5">Choose a product template below to configure size, materials, and upload your design artwork.</p>
          </div>
          <span className="text-xs font-bold text-[var(--color-primary)] flex items-center gap-1">
            {filteredCatalog.length} items available
          </span>
        </div>

        {filteredCatalog.length === 0 ? (
          <div className="text-center py-16 bg-[var(--color-card)] border border-dashed border-[var(--color-border)] rounded-[22px]">
            <div className="text-4xl mb-3">🔍</div>
            <h4 className="font-extrabold text-sm text-[var(--color-text)]">No templates found</h4>
            <p className="text-xs text-[var(--color-text-sec)] mt-1">Try modifying your category selection or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalog.map(item => (
              <div 
                key={item.id}
                onClick={() => {
                  onSelectProduct(item);
                  navigate(`/product/${item.id}`);
                }}
                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[22px] p-5 shadow-[var(--color-shadow)] hover:translate-y-[-6px] hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">{item.title}</h3>
                    <p className="text-xs text-[var(--color-text-sec)] leading-relaxed mt-1.5">{item.description}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex justify-between items-center">
                  <div>
                    <span className="text-[9px] uppercase font-black text-[var(--color-text-sec)] tracking-wider block">Unit Price From</span>
                    <span className="text-lg font-black text-[var(--color-text)]">₹{item.basePrice}</span>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-primary)] text-[10px] font-black uppercase tracking-wider group-hover:bg-accent-gradient group-hover:text-black group-hover:border-transparent transition-all duration-300 flex items-center gap-1">
                    Configure <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. PRODUCT DETAILS / CUSTOMIZATION PAGE
// ==========================================
export function ProductDetails({ product, onAddToCart, triggerToast }) {
  const navigate = useNavigate();
  if (!product) return <div className="text-center py-16 text-slate-400">Loading catalog item details...</div>;

  // Custom configuration states
  const [qty, setQty] = useState(100);
  const [size, setSize] = useState('Standard (3.5" x 2")');
  const [paper, setPaper] = useState('350gsm Premium Matte');
  const [finish, setFinish] = useState('None');
  const [designUrl, setDesignUrl] = useState('');

  // Price calculations
  const calculateTotal = () => {
    let base = product.basePrice * qty;
    if (paper.includes('Premium')) base += qty * 0.50;
    if (paper.includes('Luxury')) base += qty * 1.20;
    if (finish === 'Matte Lamination') base += qty * 0.30;
    if (finish === 'Gloss Lamination') base += qty * 0.25;
    if (finish === 'Gold Foil Highlights') base += qty * 1.50;
    return Math.round(base);
  };

  const handleAdd = () => {
    const configuredItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      type: product.type || product.id,
      title: product.title,
      quantity: qty,
      price: calculateTotal(),
      icon: product.icon,
      fields: {
        Size: size,
        Paper: paper,
        Finish: finish
      },
      design: designUrl ? {
        name: 'Design Link',
        size: 'External Link',
        filePath: designUrl
      } : null
    };
    onAddToCart(configuredItem);
    navigate('/cart');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header breadcrumb */}
      <div className="flex items-center gap-2">
        <Link to="/" className="text-xs text-[var(--color-text-sec)] hover:text-[var(--color-text)] transition-colors">Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs font-bold text-[var(--color-primary)]">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Product Illustration Preview */}
        <div className="lg:col-span-5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-[22px] p-6 text-center space-y-6">
          <div className="w-24 h-24 bg-[var(--color-bg)] rounded-3xl flex items-center justify-center text-5xl mx-auto shadow-md">
            {product.icon}
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-[var(--color-text)]">{product.title}</h2>
            <p className="text-xs text-[var(--color-text-sec)] leading-relaxed">{product.description}</p>
          </div>
          
          {/* Link Design Artwork URL */}
          <div className="border border-[var(--color-border)] rounded-[18px] p-6 bg-[var(--color-surface)] space-y-3">
            <h4 className="text-xs font-black text-[var(--color-text)] flex items-center gap-1.5 justify-center">
              <Link2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              Link Design Artwork
            </h4>
            <p className="text-[10px] text-[var(--color-text-sec)] leading-relaxed">
              Paste a shareable URL to your design (e.g. Canva, Figma, Google Drive link).
            </p>
            <input 
              type="url"
              placeholder="https://drive.google.com/..."
              value={designUrl}
              onChange={(e) => setDesignUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-center font-medium"
            />
          </div>
        </div>

        {/* Right Side: Customization Form controls */}
        <div className="lg:col-span-7 bg-[var(--color-card)] border border-[var(--color-border)] rounded-[22px] p-6 space-y-6">
          <h3 className="text-base font-black text-[var(--color-text)] border-b border-[var(--color-border)] pb-3">Tailor Specifications</h3>
          
          <div className="space-y-4">
            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-sec)]">Quantity</label>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)] flex items-center justify-center font-bold cursor-pointer text-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center bg-[var(--color-input)] border border-[var(--color-border)] rounded-xl px-3 py-2 w-28">
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center font-extrabold text-xs text-[var(--color-text)] bg-transparent outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[9px] text-[var(--color-text-sec)] font-black uppercase tracking-wider ml-1">units</span>
                </div>
                <button 
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)] flex items-center justify-center font-bold cursor-pointer text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Size Options */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-sec)]">Dimensions / Size</label>
              <div className="grid grid-cols-2 gap-3">
                {['Standard (3.5" x 2")', 'Mini (3" x 1")', 'Square (2.5" x 2.5")', 'Folded (3.5" x 4")'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-4 py-2.5 rounded-xl text-left text-xs font-bold border transition cursor-pointer ${
                      size === s 
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]' 
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg)]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Paper Material selection */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-sec)]">Paper Material Stock</label>
              <select 
                value={paper}
                onChange={(e) => setPaper(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-xs font-bold text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              >
                <option value="300gsm Budget Art Card">300gsm Budget Art Card</option>
                <option value="350gsm Premium Matte">350gsm Premium Matte (Standard)</option>
                <option value="400gsm Luxury Velvet Card">400gsm Luxury Velvet Card (+₹1.2/unit)</option>
                <option value="250gsm Eco-Kraft Card">250gsm Eco-Kraft Card</option>
              </select>
            </div>

            {/* Finish Lamination */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-sec)]">Special Protective Finish</label>
              <div className="grid grid-cols-2 gap-3">
                {['None', 'Matte Lamination', 'Gloss Lamination', 'Gold Foil Highlights'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFinish(f)}
                    className={`px-4 py-2.5 rounded-xl text-left text-xs font-bold border transition cursor-pointer ${
                      finish === f 
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]' 
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg)]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Cart Button */}
          <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-black text-[var(--color-text-sec)] tracking-wider block">Estimated Quote</span>
              <span className="text-3xl font-black text-accent-gradient">₹{calculateTotal()}</span>
            </div>
            <button 
              onClick={handleAdd}
              className="w-full sm:w-auto bg-accent-gradient hover:bg-accent-gradient-hover text-black font-black py-3 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Shopping Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. CART & CHECKOUT PAGE
// ==========================================
export function CartPage({ cart, onRemoveFromCart, onClearCart, user, onToast }) {
  const navigate = useNavigate();
  const [address, setAddress] = useState('12, Kasturba Marg, Connaught Place, New Delhi - 110001');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const tax = Math.round(subtotal * 0.18);
  const delivery = subtotal > 1500 ? 0 : 150;
  const finalTotal = subtotal + tax + delivery;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    try {
      const itemsList = cart.map(i => ({
        title: i.title,
        type: i.type || 'standard',
        quantity: i.quantity,
        price: i.price || 0,
        fields: i.fields,
        design: i.design
      }));

      // Extract design metadata details to save on the order schema level
      const itemWithDesign = cart.find(i => i.design);
      const design = itemWithDesign ? itemWithDesign.design : null;

      const orderPayload = {
        customerName: user.name,
        customerPhone: user.phone,
        deliveryAddress: address,
        paymentMethod: paymentMethod,
        items: itemsList,
        design: design,
        total: finalTotal,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      const response = await axios.post(`${BACKEND_URL}/api/orders`, orderPayload, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.data) {
        onToast('Order placed successfully!');
        onClearCart();
        navigate('/orders');
      }
    } catch (e) {
      console.error(e);
      onToast('Failed to place printing order.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-[var(--color-border)] bg-[var(--color-card)] rounded-[22px] max-w-xl mx-auto space-y-4">
        <div className="text-5xl">🛒</div>
        <h3 className="text-lg font-black text-[var(--color-text)]">Shopping Cart Empty</h3>
        <p className="text-xs text-[var(--color-text-sec)] max-w-xs mx-auto">Browse catalog templates, customize specs, and upload designs to fill your print cart.</p>
        <Link to="/" className="btn bg-accent-gradient text-black px-5 py-2.5 rounded-xl text-xs font-black inline-block cursor-pointer">Start Designing</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
      {/* Left side: Cart List */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-extrabold text-[var(--color-text)]">Shopping Cart ({cart.length} items)</h2>
          <button onClick={onClearCart} className="text-xs text-rose-500 font-bold hover:underline cursor-pointer">Clear All</button>
        </div>

        <div className="space-y-4">
          {cart.map((item) => (
            <div 
              key={item.id}
              className="bg-[var(--color-card)] border border-[var(--color-border)] p-5 rounded-[22px] flex items-center justify-between gap-4 shadow-[var(--color-shadow)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-xl">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-black text-[var(--color-text)]">{item.title}</h4>
                  <div className="text-[10px] text-[var(--color-text-sec)] mt-1 flex flex-wrap gap-x-2 gap-y-1">
                    {Object.entries(item.fields).map(([k, v]) => (
                      <span key={k} className="bg-[var(--color-bg)] px-2 py-0.5 rounded border border-[var(--color-border)]">{k}: {v}</span>
                    ))}
                    {item.quantity && <span className="bg-[var(--color-bg)] px-2 py-0.5 rounded border border-[var(--color-border)]">Qty: {item.quantity}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-black text-[var(--color-text)]">₹{item.price}</span>
                <button 
                  onClick={() => onRemoveFromCart(item.id)}
                  className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Address Spec */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-[22px] space-y-4 shadow-[var(--color-shadow)]">
          <h3 className="text-sm font-black text-[var(--color-text)] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
            Delivery Destination
          </h3>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            rows="2"
          />
        </div>
      </div>

      {/* Right side: Summary and Payments */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-[22px] shadow-[var(--color-shadow)] space-y-6">
          <h3 className="text-sm font-black text-[var(--color-text)] border-b border-[var(--color-border)] pb-3">Checkout Order Summary</h3>
          
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-[var(--color-text-sec)]">
              <span>Subtotal</span>
              <span className="font-extrabold text-[var(--color-text)]">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-[var(--color-text-sec)]">
              <span>18% CGST/SGST</span>
              <span className="font-extrabold text-[var(--color-text)]">₹{tax}</span>
            </div>
            <div className="flex justify-between text-[var(--color-text-sec)]">
              <span>Shipping Fee</span>
              <span className="font-extrabold text-[var(--color-text)]">{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-3 text-sm font-black">
              <span className="text-[var(--color-text)]">Grand Total</span>
              <span className="text-accent-gradient">₹{finalTotal}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <div className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-sec)]">Payment Method</div>
            <div className="grid grid-cols-2 gap-3">
              {['UPI', 'Card', 'NetBanking', 'COD'].map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === method 
                      ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-[var(--color-border)] text-[var(--color-text-sec)] hover:bg-[var(--color-bg)]'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  {method}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full bg-accent-gradient hover:bg-accent-gradient-hover text-black font-black py-3 rounded-xl shadow-lg shadow-amber-500/10 transition cursor-pointer"
          >
            Confirm & Place Print Order
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. MY ORDERS PAGE
// ==========================================
export function OrdersPage({ user, onToast }) {
  return (
    <div className="space-y-6">
      <CustomerOrdersList user={user} onToast={onToast} />
    </div>
  );
}

// ==========================================
// 5. PROFILE PAGE
// ==========================================
export function ProfilePage({ user, onToast }) {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState('pallavi@printflow.in');
  const [address, setAddress] = useState(localStorage.getItem('printflow_address') || '12, Kasturba Marg, Connaught Place, New Delhi - 110001');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isNewsletter, setIsNewsletter] = useState(true);

  const handleUpdate = () => {
    localStorage.setItem('printflow_address', address);
    setIsEditingAddress(false);
    onToast('Profile preferences updated!');
  };

  return (
    <div className="max-w-xl mx-auto bg-[var(--color-card)] border border-[var(--color-border)] rounded-[22px] p-6 md:p-8 shadow-[var(--color-shadow)] space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="pb-4 border-b border-[var(--color-border)]">
        <h2 className="text-xl font-extrabold text-[var(--color-text)]">Account Profile Settings</h2>
        <p className="text-xs text-[var(--color-text-sec)] mt-1">Configure your personal preferences, notifications and security parameters.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Details */}
        <div className="space-y-4">
          <div className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-sec)]">Recipient Details</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--color-text)]">Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-xs text-[var(--color-text)] focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--color-text)]">Phone</label>
              <input 
                type="text" 
                value={phone} 
                disabled
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--color-text)]">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-xs text-[var(--color-text)] focus:outline-none"
            />
          </div>
        </div>

        {/* Saved address */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-sec)]">Saved Address</div>
          <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-3">
            {isEditingAddress ? (
              <div className="space-y-3">
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-xs text-[var(--color-text)] focus:outline-none"
                  rows="3"
                />
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => {
                      localStorage.setItem('printflow_address', address);
                      setIsEditingAddress(false);
                      onToast('Address updated!');
                    }}
                    className="px-3 py-1.5 bg-accent-gradient hover:bg-accent-gradient-hover text-black text-[10px] font-black rounded-lg cursor-pointer transition uppercase"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => {
                      setAddress(localStorage.getItem('printflow_address') || '12, Kasturba Marg, Connaught Place, New Delhi - 110001');
                      setIsEditingAddress(false);
                    }}
                    className="px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-sec)] text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start gap-4">
                <div className="text-xs text-[var(--color-text)] leading-relaxed">
                  <strong className="text-[var(--color-primary)]">Office HQ:</strong> {address}
                </div>
                <button 
                  onClick={() => setIsEditingAddress(true)}
                  className="text-[10px] text-[var(--color-primary)] font-black uppercase tracking-wider hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-3">
          <div className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-sec)]">Notification Channels</div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-text)]">Order production milestones WhatsApp alerts</span>
            <input 
              type="checkbox" 
              checked={isNewsletter}
              onChange={() => setIsNewsletter(!isNewsletter)}
              className="accent-[var(--color-primary)] cursor-pointer"
            />
          </div>
        </div>

        <button 
          onClick={handleUpdate}
          className="w-full bg-accent-gradient hover:bg-accent-gradient-hover text-black font-black py-2.5 rounded-xl shadow-lg transition cursor-pointer"
        >
          Save Account Changes
        </button>
      </div>
    </div>
  );
}
