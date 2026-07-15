import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  User, 
  Printer, 
  FileText, 
  Layers, 
  CheckCircle, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Download
} from 'lucide-react';

const BACKEND_URL = 'http://127.0.0.1:5005';
const STATUS_STEPS = ['Pending', 'Printing', 'Completed', 'Delivered'];

export default function CustomerOrdersList({ user, onToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/orders`);
        if (Array.isArray(response.data)) {
          const filtered = response.data.filter(
            o => o.customerPhone === user.phone
          );
          setOrders(filtered);
        }
      } catch (error) {
        console.error('Error fetching customer orders:', error);
        onToast('Failed to load your orders.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.phone) {
      fetchMyOrders();
    }
  }, [user, onToast]);

  const getStatusStepIndex = (status) => {
    return STATUS_STEPS.indexOf(status);
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Completed':
      case 'Delivered':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Printing':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default:
        return 'bg-amber-500/10 text-[var(--color-primary)] border border-amber-500/20';
    }
  };

  if (loading) {
    return (
      <div className="text-center text-slate-400 py-16 bg-[var(--color-card)] border border-[var(--color-border)] rounded-[22px]">
        <span className="inline-block animate-spin mr-2">🔄</span> Loading database orders...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-[var(--color-border)] bg-[var(--color-card)] rounded-[22px] shadow-[var(--color-shadow)] max-w-xl mx-auto">
        <div className="text-4xl mb-3">📦</div>
        <h4 className="font-extrabold text-base text-[var(--color-text)]">No Orders Placed Yet</h4>
        <p className="text-xs text-[var(--color-text-sec)] mt-1 max-w-sm mx-auto leading-relaxed">
          Configure templates in the shop catalog to place your first print order and track its status live.
        </p>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalCount = orders.length;
  const activeCount = orders.filter(o => ['Pending', 'Printing'].includes(o.status)).length;
  const completedCount = orders.filter(o => ['Completed', 'Delivered'].includes(o.status)).length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="pb-6 border-b border-[var(--color-border)]">
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text)]">
          My Print Dashboard
        </h1>
        <p className="text-xs text-[var(--color-text-sec)] mt-1">
          Monitor your active print configurations, track order progress, and check your print history.
        </p>
      </div>

      {/* Customer KPI Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Invested', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: '💰' },
          { title: 'Orders Placed', value: totalCount, icon: '📦' },
          { title: 'In Production', value: activeCount, icon: '⚙️' },
          { title: 'Delivered Packages', value: completedCount, icon: '✅' }
        ].map((kpi, i) => (
          <div
            key={i}
            className="bg-[var(--color-card)] p-5 rounded-[22px] shadow-[var(--color-shadow)] border border-[var(--color-border)] flex items-center justify-between hover:translate-y-[-2px] transition-all duration-300"
          >
            <div>
              <div className="text-[9px] uppercase font-bold tracking-wider text-[var(--color-text-sec)]">{kpi.title}</div>
              <div className="text-xl font-black mt-1 text-[var(--color-text)]">{kpi.value}</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-lg">
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="text-xs font-black uppercase tracking-wider text-[var(--color-text-sec)]">Recent Orders Queue</div>
        {orders.map((order) => {
        const activeStepIdx = getStatusStepIndex(order.status);
        
        return (
          <div 
            key={order.id} 
            className="p-6 md:p-8 rounded-[22px] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--color-shadow)] hover:translate-y-[-4px] transition-all duration-300 relative overflow-hidden"
          >
            {/* Top Row: Order ID & Status */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <span className="text-xs bg-[var(--color-bg)] text-[var(--color-text)] px-3 py-1 rounded-lg font-black border border-[var(--color-border)]">
                  📦 {order.id}
                </span>
                <span className={`text-[9px] uppercase font-black tracking-wider px-2.5 py-1 rounded-md ${getStatusBadgeStyle(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="text-[10px] text-[var(--color-text-sec)] font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Grid details: Customer / Items / Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-start">
              {/* Col 1: Customer details */}
              <div className="md:col-span-4 space-y-2.5">
                <div className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-sec)]">Recipient Details</div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent-gradient text-black font-black flex items-center justify-center text-xs">
                    {order.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[var(--color-text)] flex items-center gap-1 truncate">
                      <User className="w-3.5 h-3.5 text-[var(--color-primary)] flex-shrink-0" />
                      {order.customerName}
                    </h4>
                    <p className="text-xs text-[var(--color-text-sec)] font-semibold mt-0.5">{order.customerPhone}</p>
                  </div>
                </div>
              </div>

              {/* Col 2: Product configs list */}
              <div className="md:col-span-5 space-y-3">
                <div className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-sec)]">Items Configured</div>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl">
                      <div className="font-extrabold text-xs text-[var(--color-text)] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Printer className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                          {item.title}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-sec)]">x{item.quantity}</span>
                      </div>
                      <p className="text-[10px] text-[var(--color-text-sec)] font-medium mt-1 leading-relaxed">
                        {Object.entries(item.fields).map(([k, v]) => `${k.replace('_', ' ')}:${v}`).join(' | ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 3: Price Tag & Design preview link */}
              <div className="md:col-span-3 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end gap-4 h-full">
                <div className="md:text-right">
                  <div className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-sec)]">Grand Total</div>
                  <div className="text-2xl font-black text-accent-gradient mt-1">₹{order.total}</div>
                </div>
                
                {order.design ? (
                  <a 
                    href={order.design.filePath.startsWith('http') ? order.design.filePath : `${BACKEND_URL}${order.design.filePath}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn border border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-black text-[var(--color-primary)] text-[10px] font-black tracking-wider uppercase px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all duration-300 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Artwork
                  </a>
                ) : (
                  <div className="text-[9px] font-bold text-slate-500 border border-dashed border-[var(--color-border)] px-3 py-2 rounded-xl flex items-center gap-1 bg-[var(--color-surface)]">
                    <FileText className="w-3.5 h-3.5" />
                    No File Uploaded
                  </div>
                )}
              </div>
            </div>

            {/* Progress Tracker Bar */}
            <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
              <div className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-sec)] mb-4">Live Tracking Timeline</div>
              <div className="flex items-center justify-between w-full max-w-xl relative px-2">
                {/* Connector Line */}
                <div className="absolute left-6 right-6 top-3 -translate-y-1/2 h-0.5 bg-[var(--color-border)] z-0"></div>
                
                {/* Active Progress Connector */}
                <div 
                  className="absolute left-6 top-3 -translate-y-1/2 h-0.5 bg-accent-gradient z-0 transition-all duration-500"
                  style={{ width: `${(activeStepIdx / (STATUS_STEPS.length - 1)) * 88}%` }}
                ></div>

                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx <= activeStepIdx;
                  const isCurrent = idx === activeStepIdx;
                  
                  return (
                    <div key={step} className="flex flex-col items-center relative z-10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        isCurrent 
                          ? 'bg-black text-[var(--color-primary)] border-[var(--color-primary)] shadow-[0_0_10px_rgba(212,175,55,0.4)] scale-110' 
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
      })}
      </div>
    </div>
  );
}
