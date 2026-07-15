import React from 'react';

export default function OrderSuccessModal({ order, onClose, onViewOrders, onContinueShopping }) {
  if (!order) return null;

  const itemsListText = order.items.map(i => `• ${i.title} (Qty: ${i.quantity}) - ₹${i.price}`).join('\n');
  const whatsappMsg = `Hello PrintFlow! I placed an order.\n\n*Order ID:* ${order.id}\n*Customer:* ${order.customerName}\n*Phone:* ${order.customerPhone}\n\n*Items Ordered:*\n${itemsListText}\n\n*Total Amount:* ₹${order.total}`;
  
  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/919999999999?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-md p-8 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--color-shadow)] relative text-center transform scale-100 transition-all">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center border border-[var(--color-border)] text-[var(--color-text-sec)] hover:text-[var(--color-text)] transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          ✕
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-450 flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-emerald-500/10">
          ✅
        </div>

        {/* Header */}
        <h3 className="text-2xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
          Order Placed Successfully!
        </h3>
        <p className="text-xs text-[var(--color-text-sec)] mt-2">
          Your order has been registered in our print queue.
        </p>

        {/* Details Card */}
        <div className="my-6 p-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] text-left space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--color-text-sec)] font-semibold uppercase">Order ID</span>
            <span className="font-extrabold text-[var(--color-text)] bg-indigo-50 dark:bg-indigo-950/35 px-2.5 py-1 rounded-md border border-indigo-100/10">
              {order.id}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--color-text-sec)] font-semibold uppercase">Total Amount</span>
            <span className="font-extrabold text-[var(--color-text)] text-sm">
              ₹{order.total}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs pt-2 border-t border-[var(--color-border)]">
            <span className="text-[var(--color-text-sec)] font-semibold uppercase">Est. Completion</span>
            <span className="font-extrabold text-amber-500 dark:text-amber-400 flex items-center gap-1">
              ⏳ 24–48 hours
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleWhatsAppClick}
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold py-3 px-4 rounded-xl shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 transition duration-300 cursor-pointer"
          >
            <span>💬</span> Send WhatsApp Notification
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onViewOrders}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-3 rounded-lg text-xs transition cursor-pointer"
            >
              📊 View Orders
            </button>
            <button
              onClick={onContinueShopping}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-lg text-xs shadow-md shadow-indigo-650/10 transition cursor-pointer"
            >
              🛒 Shop Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
