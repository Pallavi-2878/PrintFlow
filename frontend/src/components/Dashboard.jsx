import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Layers, 
  Hourglass, 
  CheckCircle, 
  Search, 
  Phone, 
  User, 
  Calendar, 
  FileText, 
  ChevronDown, 
  Check, 
  Printer, 
  FileUp,
  Link2
} from 'lucide-react';

const BACKEND_URL = 'http://127.0.0.1:5005';

export default function Dashboard({ onToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // All, Pending, Printing, Completed, Delivered
  const [activeDropdown, setActiveDropdown] = useState(null); // holds order.id

  const dropdownRef = useRef(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/orders`);
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
        onToast('Invalid response format.');
      }
    } catch (error) {
      console.error(error);
      onToast('Failed to fetch printing operations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`${BACKEND_URL}/api/orders/${orderId}/status`, { status: newStatus });
      onToast(`Stage set to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error(error);
      onToast('Stage transition failed.');
    }
  };

  // Compute analytics
  const safeOrders = Array.isArray(orders) ? orders : [];
  const totalRevenue = safeOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrders = safeOrders.length;
  const pendingOrders = safeOrders.filter(o => ['Pending', 'Printing'].includes(o?.status)).length;
  const completedOrders = safeOrders.filter(o => o.status === 'Completed').length;

  // Filter & Search
  let filtered = [...safeOrders];
  if (activeTab !== 'All') {
    filtered = filtered.filter(o => o.status === activeTab);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(o => 
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.items.some(item => item.title.toLowerCase().includes(q))
    );
  }

  // Get status configs
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pending':
        return {
          label: 'Pending',
          style: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A] dark:bg-[#78350F]/20 dark:text-[#FBBF24] dark:border-[#78350F]/40',
          dot: 'bg-[#D97706] dark:bg-[#FBBF24]'
        };
      case 'Printing':
        return {
          label: 'Printing',
          style: 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE] dark:bg-[#1E3A8A]/20 dark:text-[#60A5FA] dark:border-[#1E3A8A]/40',
          dot: 'bg-[#2563EB] dark:bg-[#60A5FA]'
        };
      case 'Completed':
        return {
          label: 'Completed',
          style: 'bg-[#D1FAE5] text-[#059669] border-[#A7F3D0] dark:bg-[#064E3B]/20 dark:text-[#34D399] dark:border-[#064E3B]/40',
          dot: 'bg-[#059669] dark:bg-[#34D399]'
        };
      case 'Delivered':
        return {
          label: 'Delivered',
          style: 'bg-[#F3E8FF] text-[#7C3AED] border-[#E9D5FF] dark:bg-[#4C1D95]/20 dark:text-[#A78BFA] dark:border-[#4C1D95]/40',
          dot: 'bg-[#7C3AED] dark:bg-[#A78BFA]'
        };
      default:
        return {
          label: status,
          style: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700',
          dot: 'bg-slate-400'
        };
    }
  };

  // KPI count animation utility component
  const AnimatedNumber = ({ value, format = false }) => {
    const [displayVal, setDisplayVal] = useState(0);
    useEffect(() => {
      let start = 0;
      const end = value;
      if (start === end) {
        setDisplayVal(end);
        return;
      }
      const duration = 800; // ms
      const stepTime = Math.abs(Math.floor(duration / (end || 1)));
      const timer = setInterval(() => {
        start += Math.ceil(end / 20) || 1;
        if (start >= end) {
          clearInterval(timer);
          setDisplayVal(end);
        } else {
          setDisplayVal(start);
        }
      }, Math.max(stepTime, 20));
      return () => clearInterval(timer);
    }, [value]);

    return format ? `₹${displayVal.toLocaleString('en-IN')}` : displayVal;
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Title Subheader */}
      <div className="pb-6 border-b border-[var(--color-border)]">
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text)]">
          PrintFlow Owner Dashboard
        </h1>
        <p className="text-xs text-[var(--color-text-sec)] mt-1">
          Manage incoming print orders and monitor production pipeline.
        </p>
      </div>

      {/* KPI Statistic Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Revenue', value: totalRevenue, icon: <DollarSign className="w-5 h-5" />, format: true },
          { title: 'Total Orders', value: totalOrders, icon: <Layers className="w-5 h-5" />, format: false },
          { title: 'Pending Print', value: pendingOrders, icon: <Hourglass className="w-5 h-5" />, format: false },
          { title: 'Completed Tasks', value: completedOrders, icon: <CheckCircle className="w-5 h-5" />, format: false }
        ].map((kpi, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-[var(--color-card)] p-6 rounded-[22px] shadow-[var(--color-shadow)] border border-[var(--color-border)] flex items-center justify-between hover:translate-y-[-4px] transition-all duration-300"
          >
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-sec)]">{kpi.title}</div>
              <div className="text-2xl font-black mt-1 text-[var(--color-text)]">
                <AnimatedNumber value={kpi.value} format={kpi.format} />
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-primary)] flex items-center justify-center shadow-sm">
              {kpi.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Notion-style Filter bar */}
      <div className="bg-[var(--color-card)] p-3 rounded-[22px] border border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-4 shadow-[var(--color-shadow)]">
        {/* Pills tabs */}
        <div className="flex gap-1 overflow-x-auto w-full md:w-auto p-1">
          {['All', 'Pending', 'Printing', 'Completed', 'Delivered'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-[18px] text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === tab
                  ? 'bg-accent-gradient text-black shadow-md shadow-amber-500/10'
                  : 'bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text-sec)] hover:bg-[var(--color-surface)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-64 px-1 pb-1 md:pb-0">
          <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, ID, phone..."
            className="w-full pl-9 pr-4 py-2 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-xs font-semibold"
          />
        </div>
      </div>

      {/* Vertically Stacked Order Cards */}
      <div className="space-y-6">
         {loading ? (
          <div className="text-center text-slate-400 py-16 bg-[var(--color-card)] border border-[var(--color-border)] rounded-[22px]">
            <span className="inline-block animate-spin mr-2">🔄</span> Loading database orders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-slate-400 py-16 bg-[var(--color-card)] border border-dashed border-[var(--color-border)] rounded-[22px]">
            <div className="text-4xl mb-3">📂</div>
            <h4 className="font-extrabold text-[var(--color-text)]">No active print orders</h4>
            <p className="text-xs mt-1 text-[var(--color-text-sec)]">Adjust search configurations or filters.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((order) => {
              const badge = getStatusConfig(order.status);
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[22px] p-6 shadow-[var(--color-shadow)] transition-all duration-300 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                >
                  {/* Col 1: Customer details & metadata */}
                  <div className="md:col-span-4 space-y-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-[var(--color-bg)] text-[var(--color-text)] px-2.5 py-0.5 rounded-full font-extrabold border border-[var(--color-border)]">
                        📦 {order.id}
                      </span>
                      <span className="text-[9px] text-[var(--color-text-sec)] font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[var(--color-primary)]" />
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-gradient text-black font-black flex items-center justify-center text-xs shadow-md">
                        {order.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-[var(--color-text)] flex items-center gap-1 truncate">
                          <User className="w-3.5 h-3.5 text-[var(--color-primary)] flex-shrink-0" />
                          {order.customerName}
                        </h4>
                        <p className="text-xs text-[var(--color-text-sec)] font-semibold flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[var(--color-text-sec)]" />
                          {order.customerPhone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Col 2: Configurations */}
                  <div className="md:col-span-4 space-y-2 min-w-0">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl">
                        <div className="font-extrabold text-xs text-[var(--color-text)] flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Printer className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                            {item.title}
                          </span>
                          <span className="text-[10px] text-[var(--color-text-sec)]">x{item.quantity}</span>
                        </div>
                        <p className="text-[10px] text-[var(--color-text-sec)] font-medium leading-relaxed mt-1.5 truncate">
                          {Object.entries(item.fields).map(([k, v]) => `${k.replace('_', ' ')}:${v}`).join(' | ')}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Col 3: Artwork zone */}
                  <div className="md:col-span-2 flex items-center justify-start md:justify-center">
                    {order.design ? (
                      <button
                        onClick={() => window.open(order.design.filePath.startsWith('http') ? order.design.filePath : `${BACKEND_URL}${order.design.filePath}`, '_blank')}
                        className="bg-[var(--color-surface)] hover:bg-[var(--color-bg)] border border-[var(--color-border)] p-2 rounded-xl flex items-center gap-2 transition text-left group w-full cursor-pointer"
                      >
                        {order.design.filePath.startsWith('http') ? (
                          <div className="w-10 h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-center text-slate-400 group-hover:text-[var(--color-primary)] transition-colors">
                            <Link2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <img
                            src={`${BACKEND_URL}${order.design.filePath}`}
                            alt="Thumbnail"
                            className="w-10 h-10 object-cover rounded-lg border border-[var(--color-border)]"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-extrabold text-[var(--color-text)] truncate">
                            {order.design.name}
                          </div>
                          <div className="text-[8px] text-[var(--color-text-sec)] font-semibold mt-0.5">
                            {order.design.size}
                          </div>
                        </div>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 border border-dashed border-[var(--color-border)] p-2.5 rounded-xl w-full justify-center text-xs font-semibold bg-[var(--color-surface)]">
                        <FileText className="w-4 h-4" />
                        <span className="text-[9px]">No file uploaded</span>
                      </div>
                    )}
                  </div>

                  {/* Col 4: Pricing & Dropdown stage trigger */}
                  <div className="md:col-span-2 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 border-[var(--color-border)] pt-4 md:pt-0">
                    <div className="md:text-right">
                      <div className="text-xs text-[var(--color-text-sec)] font-bold">Price</div>
                      <div className="text-xl font-black text-[var(--color-text)] mt-0.5">₹{order.total}</div>
                    </div>

                    <div className="relative" ref={activeDropdown === order.id ? dropdownRef : null}>
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === order.id ? null : order.id)}
                        className={`px-3.5 py-1.5 rounded-xl border text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 hover:shadow-sm transition cursor-pointer ${badge.style}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                        <span>{badge.label}</span>
                        <ChevronDown className="w-3 h-3 opacity-60" />
                      </button>

                      {/* Dropdown status details popup */}
                      {activeDropdown === order.id && (
                        <div className="absolute right-0 bottom-full md:bottom-auto md:top-full mt-2 mb-2 md:mb-0 w-40 bg-[var(--color-card)] rounded-xl shadow-xl border border-[var(--color-border)] py-1.5 z-30 animate-fadeIn">
                          <div className="px-3 py-1 text-[8px] uppercase font-bold text-[var(--color-text-sec)] tracking-wider">Change Status</div>
                          {['Pending', 'Printing', 'Completed', 'Delivered'].map(statusOption => (
                            <button
                              key={statusOption}
                              onClick={() => {
                                handleStatusChange(order.id, statusOption);
                                setActiveDropdown(null);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                                order.status === statusOption
                                  ? 'text-[var(--color-primary)] bg-[var(--color-surface)]'
                                  : 'text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                              }`}
                            >
                              <span>{statusOption}</span>
                              {order.status === statusOption && <Check className="w-3.5 h-3.5" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
