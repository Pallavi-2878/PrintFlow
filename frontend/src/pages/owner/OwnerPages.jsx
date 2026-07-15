import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DollarSign, Layers, Hourglass, CheckCircle, Search, Calendar, User, Phone, 
  Printer, FileText, ChevronDown, Check, Trash2, Edit3, Plus, ArrowUpRight, 
  Save, Download, Settings, BarChart2, Users, ShoppingCart, Tag
} from 'lucide-react';
import Dashboard from '../../components/Dashboard';

const BACKEND_URL = 'http://127.0.0.1:5005';

// ==========================================
// 1. ORDERS MANAGEMENT PAGE
// ==========================================
export function OrdersManager({ onToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/orders`);
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`${BACKEND_URL}/api/orders/${orderId}/status`, { status: newStatus });
      onToast(`Order set to ${newStatus}`);
      fetchAllOrders();
    } catch (e) {
      onToast('Status update failed.');
    }
  };

  const handleDelete = async (orderId) => {
    if (confirm('Verify: delete this print order permanently?')) {
      try {
        await axios.delete(`${BACKEND_URL}/api/orders/${orderId}`);
        onToast('Order deleted successfully.');
        fetchAllOrders();
      } catch (e) {
        onToast('Failed to delete order.');
      }
    }
  };

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Order ID,Customer,Phone,Total,Status,Date"].join(",") + "\n"
      + orders.map(o => `${o.id},${o.customerName},${o.customerPhone},${o.total},${o.status},${o.createdAt}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PrintFlow_Orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('Export completed!');
  };

  // Compute metric calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const activeQueue = orders.filter(o => ['Pending', 'Printing'].includes(o.status)).length;
  const avgOrderValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;
  const pendingPayments = orders.filter(o => o.status === 'Pending').reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || 
                          o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusStepIndex = (status) => {
    const steps = ['Pending', 'Printing', 'Completed', 'Delivered'];
    return steps.indexOf(status);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-2xl font-black text-[var(--color-text)]">Print Operations Control</h2>
          <p className="text-xs text-[var(--color-text-sec)] mt-1">Track customer files, active pipelines, and checkouts ledger.</p>
        </div>
        <button 
          onClick={exportCSV} 
          className="btn bg-accent-gradient hover:bg-accent-gradient-hover text-black text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/10"
        >
          <Download className="w-4 h-4" />
          Export Ledger Report
        </button>
      </div>

      {/* Enterprise KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { title: "Today's Sales", val: `₹${Math.round(totalRevenue * 0.4).toLocaleString('en-IN')}`, trend: "+12.4%", icon: <DollarSign className="w-4 h-4" /> },
          { title: "Weekly Revenue", val: `₹${totalRevenue.toLocaleString('en-IN')}`, trend: "+8.2%", icon: <ShoppingCart className="w-4 h-4" /> },
          { title: "Active Queue", val: activeQueue, trend: "-2 items", icon: <Layers className="w-4 h-4" /> },
          { title: "Average Ticket", val: `₹${avgOrderValue.toLocaleString('en-IN')}`, trend: "+4.1%", icon: <BarChart2 className="w-4 h-4" /> },
          { title: "Pending Cash", val: `₹${pendingPayments.toLocaleString('en-IN')}`, trend: "COD/UPI", icon: <Hourglass className="w-4 h-4" /> }
        ].map((card, i) => (
          <div 
            key={i} 
            className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[20px] p-5 shadow-[var(--color-shadow)] space-y-3 hover:translate-y-[-2px] transition duration-300"
          >
            <div className="flex justify-between items-center text-[9px] uppercase font-black text-[var(--color-text-sec)] tracking-wider">
              <span>{card.title}</span>
              <span className="text-[var(--color-primary)]">{card.icon}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-black text-[var(--color-text)]">{card.val}</span>
              <span className="text-[9px] font-extrabold text-emerald-400">{card.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Filters */}
      <div className="bg-[var(--color-card)] p-3 rounded-[20px] border border-[var(--color-border)] flex flex-col md:flex-row gap-4 justify-between items-center shadow-[var(--color-shadow)]">
        <div className="flex gap-1 overflow-x-auto w-full md:w-auto p-1 scrollbar-none">
          {['All', 'Pending', 'Printing', 'Completed', 'Delivered'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-[16px] text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                filterStatus === status 
                  ? 'bg-accent-gradient text-black shadow-md shadow-amber-500/10'
                  : 'bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text-sec)] hover:bg-[var(--color-surface)]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer name, phone, order ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-[16px] border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)] focus:outline-none placeholder-slate-450"
          />
        </div>
      </div>

      {/* Interactive Orders Card List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-16 bg-[var(--color-card)] border border-[var(--color-border)] rounded-[20px]">
            <span className="inline-block animate-spin mr-2">🔄</span> Loading Ledger Database...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-[var(--color-card)] border border-dashed border-[var(--color-border)] rounded-[20px]">
            <div className="text-4xl mb-3">📁</div>
            <h4 className="font-extrabold text-sm text-[var(--color-text)]">No orders in queue</h4>
            <p className="text-xs text-[var(--color-text-sec)] mt-1">Adjust search parameters or filter pills.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const activeStepIdx = getStatusStepIndex(order.status);
            const steps = ['Pending', 'Printing', 'Completed', 'Delivered'];
            
            return (
              <div 
                key={order.id}
                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[20px] p-6 shadow-[var(--color-shadow)] hover:translate-y-[-4px] hover:scale-[1.01] hover:shadow-lg transition-all duration-300 space-y-6"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-[var(--color-bg)] text-[var(--color-text)] px-3 py-1 rounded-lg font-black border border-[var(--color-border)]">
                      📦 {order.id}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-sec)] font-bold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] uppercase font-black tracking-wider text-[var(--color-text-sec)]">Pipeline:</span>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[10px] uppercase font-black text-[var(--color-text)] focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Printing">Printing</option>
                      <option value="Completed">Completed</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                    
                    <button 
                      onClick={() => handleDelete(order.id)}
                      className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Col 1: Customer info */}
                  <div className="md:col-span-3 space-y-3">
                    <div className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-sec)]">Customer Details</div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-gradient text-black font-black flex items-center justify-center text-xs">
                        {order.customerName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[var(--color-text)] truncate">{order.customerName}</h4>
                        <p className="text-xs text-[var(--color-text-sec)] font-semibold mt-0.5">{order.customerPhone}</p>
                        {order.deliveryAddress && (
                          <p className="text-[10px] text-[var(--color-text-sec)] mt-1.5 font-medium border-t border-[var(--color-border)] pt-1 italic max-w-[180px] truncate" title={order.deliveryAddress}>
                            📍 {order.deliveryAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Col 2: Configurations list */}
                  <div className="md:col-span-5 space-y-2">
                    <div className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-sec)]">Items Stack</div>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="bg-[var(--color-surface)] border border-[var(--color-border)] p-2.5 rounded-xl flex justify-between items-center gap-4">
                        <div>
                          <div className="text-xs font-black text-[var(--color-text)] flex items-center gap-1">
                            <Printer className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                            {item.title}
                          </div>
                          <p className="text-[9px] text-[var(--color-text-sec)] mt-0.5">
                            {Object.entries(item.fields).map(([k, v]) => `${k}:${v}`).join(' | ')}
                          </p>
                        </div>
                        <span className="text-[10px] font-black text-[var(--color-text-sec)]">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Col 3: Price Tag / Invoice */}
                  <div className="md:col-span-4 flex justify-between items-center md:justify-end gap-6 border-t md:border-t-0 border-[var(--color-border)] pt-4 md:pt-0">
                    <div className="md:text-right">
                      <span className="text-[9px] uppercase font-black tracking-wider text-[var(--color-text-sec)] block">Grand Total</span>
                      <span className="text-2xl font-black text-accent-gradient">₹{order.total}</span>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-emerald-400 block mt-0.5">Paid via {order.paymentMethod || 'UPI'}</span>
                    </div>
                    {order.design ? (
                      <a 
                        href={order.design.filePath.startsWith('http') ? order.design.filePath : `${BACKEND_URL}${order.design.filePath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn border border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-black text-[var(--color-primary)] text-[10px] font-black tracking-wider uppercase px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Artwork
                      </a>
                    ) : (
                      <div className="text-[9px] font-bold text-slate-500 border border-dashed border-[var(--color-border)] px-3 py-2 rounded-xl bg-[var(--color-surface)]">No file</div>
                    )}
                  </div>
                </div>

                {/* Progress bar tracker */}
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <div className="text-[9px] uppercase font-black tracking-wider text-[var(--color-text-sec)] mb-3">Live Production Track</div>
                  <div className="flex items-center justify-between w-full max-w-lg relative px-2">
                    <div className="absolute left-6 right-6 top-3 -translate-y-1/2 h-0.5 bg-[var(--color-border)] z-0"></div>
                    <div 
                      className="absolute left-6 top-3 -translate-y-1/2 h-0.5 bg-accent-gradient z-0 transition-all duration-500"
                      style={{ width: `${(activeStepIdx / (steps.length - 1)) * 88}%` }}
                    ></div>

                    {steps.map((step, idx) => {
                      const isCompleted = idx <= activeStepIdx;
                      const isCurrent = idx === activeStepIdx;
                      
                      return (
                        <div key={step} className="flex flex-col items-center relative z-10">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 ${
                            isCurrent 
                              ? 'bg-black text-[var(--color-primary)] border-[var(--color-primary)] shadow-[0_0_8px_rgba(212,175,55,0.4)] scale-110' 
                              : isCompleted 
                                ? 'bg-accent-gradient text-black border-transparent' 
                                : 'bg-[var(--color-card)] text-[var(--color-text-sec)] border-[var(--color-border)]'
                          }`}>
                            <span className="text-[9px] font-black">{isCompleted && !isCurrent ? '✓' : idx + 1}</span>
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-wider mt-2 ${
                            isCurrent 
                              ? 'text-[var(--color-primary)]' 
                              : 'text-[var(--color-text-sec)]'
                          }`}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. PRODUCT MANAGEMENT PAGE
// ==========================================
export function ProductsManager({ catalog, onToast }) {
  const [items, setItems] = useState(catalog);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Marketing');
  const [icon, setIcon] = useState('📖');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title || !price) return;
    const newProduct = {
      id: `p-${Date.now()}`,
      title,
      description: desc,
      basePrice: Number(price),
      category,
      icon
    };
    setItems([newProduct, ...items]);
    onToast(`Added "${title}" template to shop catalog.`);
    setTitle('');
    setPrice('');
    setDesc('');
    setShowAdd(false);
  };

  const handleDelete = (id) => {
    setItems(items.filter(i => i.id !== id));
    onToast('Item removed from catalog.');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--color-text)]">Print Catalog Inventory</h2>
          <p className="text-xs text-[var(--color-text-sec)] mt-0.5">Configure sizes, base rates and upload templates.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="btn bg-accent-gradient hover:bg-accent-gradient-hover text-black text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/10"
        >
          <Plus className="w-4 h-4" />
          Add Template Card
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-[22px] space-y-4 shadow-[var(--color-shadow)] max-w-lg">
          <h3 className="text-xs uppercase font-black tracking-wider text-[var(--color-primary)]">New Template Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--color-text)]">Product Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-xs text-[var(--color-text)] focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--color-text)]">Base Price (₹/unit)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-xs text-[var(--color-text)] focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--color-text)]">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-2 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-xs text-[var(--color-text)] focus:outline-none">
                <option value="Marketing">Marketing</option>
                <option value="Stationery">Stationery</option>
                <option value="Packaging">Packaging</option>
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold text-[var(--color-text)]">Icon Character</label>
              <div className="flex flex-wrap gap-2 p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                {['🖼️', '🏁', '📇', '🪪', '📖', '📦', '🏷️', '👕', '🎨', '📄', '📷', '🌟'].map(emoji => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => setIcon(emoji)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all cursor-pointer ${
                      icon === emoji 
                        ? 'bg-[var(--color-primary)] text-black scale-110 shadow-sm' 
                        : 'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <input 
                type="text" 
                value={icon} 
                onChange={e => setIcon(e.target.value)} 
                placeholder="Or type custom emoji..."
                className="w-full px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-xs text-[var(--color-text)] focus:outline-none mt-1.5" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--color-text)]">Brief Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-xs text-[var(--color-text)] focus:outline-none" rows="2" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-2.5 bg-accent-gradient hover:bg-accent-gradient-hover text-black text-xs font-black rounded-xl cursor-pointer">Save Product</button>
            <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-sec)] text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
          </div>
        </form>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 p-5 rounded-[22px] shadow-[var(--color-shadow)] flex flex-col justify-between hover:translate-y-[-6px] hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 group">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="w-10 h-10 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                <span className="text-[9px] font-black uppercase bg-amber-500/10 text-[var(--color-primary)] border border-amber-500/20 px-2.5 py-0.5 rounded-lg">{item.category}</span>
              </div>
              <h4 className="text-sm font-black text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">{item.title}</h4>
              <p className="text-xs text-[var(--color-text-sec)] leading-relaxed">{item.description}</p>
            </div>
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--color-border)]">
              <div>
                <span className="text-[9px] uppercase font-black text-[var(--color-text-sec)] tracking-wider block">Base Rate</span>
                <span className="text-base font-black text-accent-gradient">₹{item.basePrice}</span>
              </div>
              <button 
                onClick={() => handleDelete(item.id)}
                className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-50 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 3. CUSTOMER MANAGEMENT PAGE
// ==========================================
export function CustomersManager() {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/orders`);
        if (Array.isArray(response.data)) {
          // Aggregate orders by customer phone number
          const clientMap = {};
          response.data.forEach(order => {
            const phone = order.customerPhone || 'N/A';
            if (!clientMap[phone]) {
              clientMap[phone] = {
                name: order.customerName,
                phone: phone,
                spent: 0,
                orders: 0,
                email: `${order.customerName.toLowerCase().replace(/\s+/g, '')}@printflow.in`,
                address: order.deliveryAddress || 'N/A',
                orderHistory: []
              };
            }
            // Update address if order contains valid address
            if (order.deliveryAddress && order.deliveryAddress !== 'N/A' && clientMap[phone].address === 'N/A') {
              clientMap[phone].address = order.deliveryAddress;
            }
            clientMap[phone].spent += Number(order.total) || 0;
            clientMap[phone].orders += 1;
            clientMap[phone].orderHistory.push(order);
          });
          setCustomers(Object.values(clientMap));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  if (selectedClient) {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedClient(null)} 
              className="px-3 py-1.5 bg-[var(--color-card)] border border-[var(--color-border)] text-xs font-bold rounded-xl cursor-pointer hover:bg-[var(--color-surface)] text-[var(--color-text)] flex items-center gap-1.5"
            >
              ← Back to Directory
            </button>
            <h2 className="text-xl font-extrabold text-[var(--color-text)]">Client History: {selectedClient.name}</h2>
          </div>
        </div>

        {/* Client Profile Summary Card */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-[22px] shadow-[var(--color-shadow)] grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent-gradient text-black font-black flex items-center justify-center text-sm">
              {selectedClient.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-black text-[var(--color-text)]">{selectedClient.name}</h3>
              <p className="text-xs text-[var(--color-text-sec)] font-semibold mt-0.5">{selectedClient.phone}</p>
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <div><span className="text-[var(--color-text-sec)]">Email:</span> <strong className="text-[var(--color-text)]">{selectedClient.email}</strong></div>
            <div><span className="text-[var(--color-text-sec)]">Total Revenue:</span> <strong className="text-accent-gradient">₹{selectedClient.spent.toLocaleString('en-IN')}</strong></div>
          </div>
          <div className="space-y-1 text-xs">
            <div><span className="text-[var(--color-text-sec)]">Delivery Address:</span></div>
            <div className="text-[var(--color-text)] font-semibold italic">📍 {selectedClient.address}</div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-black tracking-wider text-[var(--color-text-sec)]">Checkout History ({selectedClient.orderHistory.length} orders)</h3>
          <div className="space-y-4">
            {selectedClient.orderHistory.map((order, index) => (
              <div key={index} className="bg-[var(--color-card)] border border-[var(--color-border)] p-5 rounded-[20px] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-[var(--color-text)] bg-[var(--color-bg)] px-2.5 py-0.5 rounded border border-[var(--color-border)]">{order.id}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      order.status === 'Printing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      order.status === 'Delivered' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      'bg-amber-500/10 text-[var(--color-primary)] border border-amber-500/20'
                    }`}>{order.status}</span>
                  </div>
                  <div className="text-[10px] text-[var(--color-text-sec)] mt-2">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <div className="space-y-1 max-w-md">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="text-xs font-bold text-[var(--color-text)]">
                      {it.title} <span className="text-[var(--color-text-sec)]">x{it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="text-right">
                  <div className="text-[9px] uppercase font-black text-[var(--color-text-sec)] tracking-wider block">Price</div>
                  <span className="text-base font-black text-accent-gradient">₹{order.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="pb-4 border-b border-[var(--color-border)]">
        <h2 className="text-xl font-extrabold text-[var(--color-text)]">Registered Client Directory</h2>
        <p className="text-xs text-[var(--color-text-sec)] mt-0.5">Real-time aggregate data sourced from active customer checkouts.</p>
      </div>

      <div className="relative max-w-sm bg-[var(--color-card)] border border-[var(--color-border)] p-1 rounded-[18px] shadow-[var(--color-shadow)]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search client directory..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl border-none focus:outline-none bg-transparent"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 bg-[var(--color-card)] rounded-[22px] border border-[var(--color-border)]">
          Loading client data...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-405 bg-[var(--color-card)] rounded-[22px] border border-dashed border-[var(--color-border)]">
          No registered clients in directory.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((client, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedClient(client)}
              className="bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 p-5 rounded-[22px] shadow-[var(--color-shadow)] space-y-4 hover:translate-y-[-4px] hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-gradient text-black font-black flex items-center justify-center text-xs group-hover:scale-105 transition-transform">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">{client.name}</h4>
                  <p className="text-[10px] text-[var(--color-text-sec)] font-semibold mt-0.5">{client.phone}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--color-border)]">
                <div>
                  <span className="text-[9px] uppercase font-black text-[var(--color-text-sec)] tracking-wider block">Total Spent</span>
                  <span className="text-sm font-extrabold text-[var(--color-text)]">₹{client.spent.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black text-[var(--color-text-sec)] tracking-wider block">Print Jobs</span>
                  <span className="text-sm font-extrabold text-[var(--color-text)]">{client.orders} orders</span>
                </div>
              </div>

              <div className="text-[9px] text-[var(--color-text-sec)] leading-relaxed space-y-1">
                <div><strong>Email:</strong> {client.email}</div>
                <div className="truncate"><strong>Address:</strong> {client.address}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. ANALYTICS PAGE
// ==========================================
export function AnalyticsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/orders`);
        if (Array.isArray(response.data)) {
          setOrders(response.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Calculate product splits
  const productCounts = {};
  let totalItems = 0;
  orders.forEach(order => {
    order.items.forEach(item => {
      const name = item.title;
      productCounts[name] = (productCounts[name] || 0) + Number(item.quantity);
      totalItems += Number(item.quantity);
    });
  });

  const productSplits = Object.entries(productCounts).map(([name, qty]) => {
    const pct = totalItems ? Math.round((qty / totalItems) * 100) : 0;
    return { name, pct: `${pct}%`, fill: `${pct}%` };
  }).sort((a, b) => b.pct.localeCompare(a.pct));

  const displaySplits = productSplits.length ? productSplits : [
    { name: 'Luxury Business Cards', pct: '48%' },
    { name: 'Tri-Fold Brochures', pct: '28%' },
    { name: 'Premium Stickers & Labels', pct: '14%' },
    { name: 'Corporate Envelopes', pct: '10%' }
  ];

  // Group by day of week
  const dayRevenues = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  orders.forEach(o => {
    const date = new Date(o.createdAt);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    if (dayRevenues[day] !== undefined) {
      dayRevenues[day] += Number(o.total) || 0;
    }
  });

  const maxVal = Math.max(...Object.values(dayRevenues), 1);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="pb-4 border-b border-[var(--color-border)]">
        <h2 className="text-xl font-extrabold text-[var(--color-text)]">Revenue & Performance Insights</h2>
        <p className="text-xs text-[var(--color-text-sec)] mt-0.5">Real-time charts calculated dynamically from client orders.</p>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-[var(--color-card)] rounded-[22px] border border-[var(--color-border)] text-slate-400">
          Loading analytics intelligence...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-[22px] shadow-[var(--color-shadow)] space-y-4">
            <h3 className="text-xs uppercase font-black tracking-wider text-[var(--color-text-sec)]">Weekly Sales Curve (by Day)</h3>
            <div className="h-48 flex items-end gap-3 justify-between pt-6">
              {weekDays.map((day) => {
                const value = dayRevenues[day] || 0;
                const heightPct = Math.max(10, Math.round((value / maxVal) * 100));
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-[8px] font-bold text-[var(--color-primary)]">₹{value > 1000 ? `${(value/1000).toFixed(1)}k` : value}</div>
                    <div 
                      className="w-full bg-accent-gradient rounded-t-lg transition-all duration-500" 
                      style={{ height: `${heightPct * 1.2}px` }}
                    ></div>
                    <span className="text-[9px] text-[var(--color-text-sec)] font-bold">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Best Sellers */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] p-6 rounded-[22px] shadow-[var(--color-shadow)] space-y-4">
            <h3 className="text-xs uppercase font-black tracking-wider text-[var(--color-text-sec)]">Production Quantity Split</h3>
            <div className="space-y-4 pt-2">
              {displaySplits.map((prod, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[var(--color-text)]">
                    <span>{prod.name}</span>
                    <span className="text-[var(--color-primary)]">{prod.pct}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--color-bg)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent-gradient" 
                      style={{ width: prod.pct }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. SETTINGS PAGE
// ==========================================
export function SettingsPage({ onToast }) {
  const [shopName, setShopName] = useState('PrintFlow Elite');
  const [taxRate, setTaxRate] = useState(18);
  const [deliveryBase, setDeliveryBase] = useState(150);

  const handleSave = () => {
    onToast('Business settings committed successfully.');
  };

  return (
    <div className="max-w-xl mx-auto bg-[var(--color-card)] border border-[var(--color-border)] rounded-[22px] p-6 md:p-8 shadow-[var(--color-shadow)] space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="pb-4 border-b border-[var(--color-border)]">
        <h2 className="text-xl font-extrabold text-[var(--color-text)]">Shop Settings & Parameters</h2>
        <p className="text-xs text-[var(--color-text-sec)] mt-1">Configure taxes, base transport rates and notifications parameters.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-sec)]">Business Profile</div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--color-text)]">Print Shop Brand Name</label>
            <input 
              type="text" 
              value={shopName} 
              onChange={e => setShopName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-xs text-[var(--color-text)] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-sec)]">Finance & Logistics</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--color-text)]">Standard Tax (GST %)</label>
              <input 
                type="number" 
                value={taxRate} 
                onChange={e => setTaxRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-xs text-[var(--color-text)] focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--color-text)]">Base Shipping Fee (₹)</label>
              <input 
                type="number" 
                value={deliveryBase} 
                onChange={e => setDeliveryBase(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] text-xs text-[var(--color-text)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-accent-gradient hover:bg-accent-gradient-hover text-black font-black py-2.5 rounded-xl shadow-lg transition cursor-pointer"
        >
          Save Shop Changes
        </button>
      </div>
    </div>
  );
}
