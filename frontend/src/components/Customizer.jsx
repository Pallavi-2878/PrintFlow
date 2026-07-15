import React, { useState, useEffect } from 'react';

const PRICING_RULES = {
  flex: {
    title: 'Flex Banner',
    defaults: { width: 4, height: 3, material: 'normal', grommets: 'yes' },
    calculate: (fields, qty) => {
      const w = parseFloat(fields.width) || 1;
      const h = parseFloat(fields.height) || 1;
      let ratePerSqFt = 12;
      if (fields.material === 'star') ratePerSqFt = 20;
      if (fields.material === 'blackback') ratePerSqFt = 28;
      
      let baseCost = w * h * ratePerSqFt;
      if (fields.grommets === 'yes') baseCost += 10;
      return Math.round(baseCost * qty);
    }
  },
  poster: {
    title: 'High-Res Poster',
    defaults: { size: 'a3', finish: 'glossy', orientation: 'portrait' },
    calculate: (fields, qty) => {
      let baseRate = 15;
      if (fields.size === 'a3') baseRate = 30;
      if (fields.size === 'a2') baseRate = 60;
      if (fields.size === 'a1') baseRate = 120;
      
      let modifier = 0;
      if (fields.finish === 'matte') modifier = 5;
      if (fields.finish === 'cardstock') modifier = 15;
      
      return Math.round((baseRate + modifier) * qty);
    }
  },
  visiting_card: {
    title: 'Visiting Cards',
    defaults: { quantity_tier: 100, finish: 'matte', corners: 'square' },
    calculate: (fields) => {
      const count = parseInt(fields.quantity_tier) || 100;
      let ratePerCard = 1.5;
      if (count >= 1000) ratePerCard = 0.9;
      else if (count >= 500) ratePerCard = 1.2;

      let cardModifier = 0;
      if (fields.finish === 'glossy') cardModifier += 0.1;
      if (fields.finish === 'velvet') cardModifier += 0.4;
      if (fields.finish === 'spotuv') cardModifier += 0.8;
      if (fields.corners === 'rounded') cardModifier += 0.15;

      return Math.round((ratePerCard + cardModifier) * count);
    }
  },
  id_card: {
    title: 'ID Cards',
    defaults: { side: 'single', holder: 'classic', lanyard: 'standard' },
    calculate: (fields, qty) => {
      let baseCost = 45;
      if (fields.side === 'double') baseCost += 20;
      if (fields.holder === 'metal') baseCost += 90;
      
      let lanyardCost = 0;
      if (fields.lanyard === 'standard') lanyardCost = 10;
      if (fields.lanyard === 'premium') lanyardCost = 25;
      
      return Math.round((baseCost + lanyardCost) * qty);
    }
  },
  brochure: {
    title: 'Brochures & Flyers',
    defaults: { fold: 'bifold', pages: '4', paper: '170gsm' },
    calculate: (fields, qty) => {
      let baseRate = 4;
      if (fields.fold === 'trifold') baseRate += 1.5;
      if (fields.fold === 'zfold') baseRate += 2;
      if (fields.pages === '8') baseRate += 4;
      
      let paperModifier = 0;
      if (fields.paper === '300gsm') paperModifier = 2.5;
      
      return Math.round((baseRate + paperModifier) * qty);
    }
  }
};

export default function Customizer({ type, onBack, onAddToCart, editItem }) {
  const rules = PRICING_RULES[type];
  const [fields, setFields] = useState({ ...rules.defaults });
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (editItem) {
      setFields({ ...editItem.fields });
      if (type !== 'visiting_card') {
        setQuantity(editItem.quantity);
      }
    }
  }, [editItem, type]);

  useEffect(() => {
    const qty = type === 'visiting_card' ? 1 : quantity;
    const computedPrice = rules.calculate(fields, qty);
    setPrice(computedPrice);
  }, [fields, quantity, type]);

  const handleFieldChange = (key, value) => {
    setFields(prev => ({ ...prev, [key]: value }));
  };

  const handleAdd = () => {
    const itemQty = type === 'visiting_card' ? parseInt(fields.quantity_tier) : quantity;
    onAddToCart({
      id: editItem ? editItem.id : Date.now().toString(),
      title: rules.title,
      type,
      fields,
      quantity: itemQty,
      price,
      selected: editItem ? editItem.selected : true,
      savedForLater: editItem ? editItem.savedForLater : false
    });
  };

  // Rendering Live Preview
  const renderPreviewCanvas = () => {
    if (type === 'flex') {
      const w = parseFloat(fields.width) || 4;
      const h = parseFloat(fields.height) || 3;
      const ratio = h / w;
      return (
        <div 
          style={{ aspectRatio: `${w}/${h}` }}
          className="w-full max-w-[280px] bg-gradient-to-tr from-indigo-600 to-pink-500 rounded shadow-lg flex flex-col items-center justify-center p-4 text-white text-center relative"
        >
          <span className="font-extrabold text-sm tracking-wider">FLEX BANNER</span>
          <span className="text-xs opacity-75 mt-1">{fields.material.toUpperCase()}</span>
          <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 px-1.5 py-0.5 rounded font-mono">{w}' x {h}'</span>
        </div>
      );
    }

    if (type === 'poster') {
      const isPortrait = fields.orientation === 'portrait';
      return (
        <div 
          className={`bg-gradient-to-br from-emerald-500 to-blue-600 rounded-md shadow-lg flex flex-col items-center justify-center p-4 text-white text-center relative ${
            isPortrait ? 'w-[180px] h-[250px]' : 'w-[250px] h-[180px]'
          }`}
        >
          <span className="font-bold text-sm">POSTER</span>
          <span className="text-xs opacity-80 mt-1">{fields.finish.toUpperCase()}</span>
          <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 px-1.5 py-0.5 rounded font-mono">{fields.size.toUpperCase()}</span>
        </div>
      );
    }

    if (type === 'visiting_card') {
      const rounded = fields.corners === 'rounded';
      return (
        <div 
          className={`w-[260px] h-[150px] bg-indigo-950 text-indigo-100 flex flex-col justify-between p-4 shadow-lg border border-indigo-900 ${
            rounded ? 'rounded-xl' : 'rounded-sm'
          }`}
        >
          <div className="text-[10px] uppercase tracking-widest text-indigo-400">Creative Studios</div>
          <div>
            <div className="font-extrabold text-white text-lg">ALEX MORGAN</div>
            <div className="text-[10px] text-indigo-300">Creative Director</div>
          </div>
          <div className="text-[9px] opacity-50 flex justify-between">
            <span>Finish: {fields.finish}</span>
            <span>3.5" x 2.0"</span>
          </div>
        </div>
      );
    }

    if (type === 'id_card') {
      const isMetal = fields.holder === 'metal';
      return (
        <div 
          className={`w-[170px] h-[270px] bg-white text-slate-800 flex flex-col items-center p-3 relative shadow-xl border ${
            isMetal ? 'border-slate-400 rounded-xl bg-slate-50' : 'border-slate-200 rounded-lg'
          }`}
        >
          <div className="w-full h-6 bg-indigo-600 -mt-3 -mx-3 rounded-t-sm mb-4"></div>
          <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl mb-2">👤</div>
          <div className="font-extrabold text-sm">Jane Doe</div>
          <div className="text-[10px] text-slate-500">Software Engineer</div>
          <div className="text-[9px] text-indigo-600 font-bold tracking-wider mt-4">CORPORATE ID</div>
          <div className="absolute bottom-2 text-[9px] opacity-60 text-center w-full">Lanyard: {fields.lanyard}</div>
        </div>
      );
    }

    if (type === 'brochure') {
      return (
        <div className="w-[240px] h-[180px] bg-slate-50 border border-slate-200 shadow-md flex">
          <div className="flex-1 border-r border-dashed border-slate-300 p-2 flex flex-col justify-center items-center text-center">
            <span className="font-bold text-xs">Panel 1</span>
          </div>
          <div className="flex-1 bg-slate-100 p-2 flex flex-col justify-center items-center text-center">
            <span className="font-bold text-xs">Panel 2</span>
            <span className="text-[9px] text-slate-400 mt-1">{fields.fold.toUpperCase()}</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <button onClick={onBack} className="btn-secondary btn mb-6">
        ← Back to Catalog
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: Render Preview */}
        <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center min-h-[380px] shadow-sm">
          <h3 className="font-bold text-sm text-slate-400 mb-6 uppercase tracking-wider">Live Mockup View</h3>
          {renderPreviewCanvas()}
          <p className="text-[11px] text-slate-400 text-center mt-6">
            Preview is optimized to scale/aspect ratio. Upload production artwork at checkout.
          </p>
        </div>

        {/* Right: Controls Form */}
        <div className="glass p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-extrabold mb-6">Customize {rules.title}</h2>
          
          <div className="space-y-4">
            {type === 'flex' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Width (Feet)</label>
                    <input 
                      type="number" 
                      value={fields.width} 
                      onChange={e => handleFieldChange('width', e.target.value)}
                      className="form-control"
                      min="1" max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Height (Feet)</label>
                    <input 
                      type="number" 
                      value={fields.height} 
                      onChange={e => handleFieldChange('height', e.target.value)}
                      className="form-control"
                      min="1" max="100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Flex Banner Material</label>
                  <select 
                    value={fields.material} 
                    onChange={e => handleFieldChange('material', e.target.value)}
                    className="form-control"
                  >
                    <option value="normal">Normal Flex (Standard)</option>
                    <option value="star">Star Flex (High contrast backlight) (+₹8/sq.ft)</option>
                    <option value="blackback">Black Back Flex (No light passing) (+₹16/sq.ft)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Grommets/Eyelets (Corners)</label>
                  <select 
                    value={fields.grommets} 
                    onChange={e => handleFieldChange('grommets', e.target.value)}
                    className="form-control"
                  >
                    <option value="yes">Yes, include eyelets (+₹10)</option>
                    <option value="no">No eyelets</option>
                  </select>
                </div>
              </>
            )}

            {type === 'poster' && (
              <>
                <div>
                  <label className="block text-xs font-bold mb-1">Size Dimensions</label>
                  <select 
                    value={fields.size} 
                    onChange={e => handleFieldChange('size', e.target.value)}
                    className="form-control"
                  >
                    <option value="a4">A4 (8.3" x 11.7") (Base Price)</option>
                    <option value="a3">A3 (11.7" x 16.5") (+₹15)</option>
                    <option value="a2">A2 (16.5" x 23.4") (+₹45)</option>
                    <option value="a1">A1 (23.4" x 33.1") (+₹105)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Paper Texture / Coating</label>
                  <select 
                    value={fields.finish} 
                    onChange={e => handleFieldChange('finish', e.target.value)}
                    className="form-control"
                  >
                    <option value="glossy">Glossy Paper (Standard)</option>
                    <option value="matte">Matte Coated (+₹5)</option>
                    <option value="cardstock">Heavy Cardstock (+₹15)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Orientation</label>
                  <select 
                    value={fields.orientation} 
                    onChange={e => handleFieldChange('orientation', e.target.value)}
                    className="form-control"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </>
            )}

            {type === 'visiting_card' && (
              <>
                <div>
                  <label className="block text-xs font-bold mb-1">Order Quantity Pack</label>
                  <select 
                    value={fields.quantity_tier} 
                    onChange={e => handleFieldChange('quantity_tier', e.target.value)}
                    className="form-control"
                  >
                    <option value="100">100 Cards (₹1.50 per card)</option>
                    <option value="500">500 Cards (₹1.20 per card)</option>
                    <option value="1000">1000 Cards (₹0.90 per card)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Premium Finishing</label>
                  <select 
                    value={fields.finish} 
                    onChange={e => handleFieldChange('finish', e.target.value)}
                    className="form-control"
                  >
                    <option value="matte">Matte Laminated (Base)</option>
                    <option value="glossy">UV Gloss Laminated (+₹0.10/card)</option>
                    <option value="velvet">Soft-Touch Velvet (+₹0.40/card)</option>
                    <option value="spotuv">Spot UV Highlights (+₹0.80/card)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Corners style</label>
                  <select 
                    value={fields.corners} 
                    onChange={e => handleFieldChange('corners', e.target.value)}
                    className="form-control"
                  >
                    <option value="square">Standard Square Corners</option>
                    <option value="rounded">Rounded Corners (+₹0.15/card)</option>
                  </select>
                </div>
              </>
            )}

            {type === 'id_card' && (
              <>
                <div>
                  <label className="block text-xs font-bold mb-1">Print Facing Sides</label>
                  <select 
                    value={fields.side} 
                    onChange={e => handleFieldChange('side', e.target.value)}
                    className="form-control"
                  >
                    <option value="single">Single-Sided Print</option>
                    <option value="double">Double-Sided Print (+₹20)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">ID Holder Protection</label>
                  <select 
                    value={fields.holder} 
                    onChange={e => handleFieldChange('holder', e.target.value)}
                    className="form-control"
                  >
                    <option value="classic">Clear Acrylic Sleeve</option>
                    <option value="metal">Premium Aluminum Case (+₹90)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Lanyard Strap</label>
                  <select 
                    value={fields.lanyard} 
                    onChange={e => handleFieldChange('lanyard', e.target.value)}
                    className="form-control"
                  >
                    <option value="standard">Standard Royal Blue (+₹10)</option>
                    <option value="premium">Custom Printed Satin (+₹25)</option>
                    <option value="none">No Lanyard</option>
                  </select>
                </div>
              </>
            )}

            {type === 'brochure' && (
              <>
                <div>
                  <label className="block text-xs font-bold mb-1">Fold Pattern</label>
                  <select 
                    value={fields.fold} 
                    onChange={e => handleFieldChange('fold', e.target.value)}
                    className="form-control"
                  >
                    <option value="bifold">Bi-Fold (4 panels)</option>
                    <option value="trifold">Tri-Fold (6 panels) (+₹1.50/pc)</option>
                    <option value="zfold">Z-Fold (6 panels) (+₹2/pc)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Pages Booklet Count</label>
                  <select 
                    value={fields.pages} 
                    onChange={e => handleFieldChange('pages', e.target.value)}
                    className="form-control"
                  >
                    <option value="4">4 Standard Pages</option>
                    <option value="8">8 Booklet Pages (+₹4/pc)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Paper Weight (GSM)</label>
                  <select 
                    value={fields.paper} 
                    onChange={e => handleFieldChange('paper', e.target.value)}
                    className="form-control"
                  >
                    <option value="170gsm">170 GSM Semi-Gloss Paper</option>
                    <option value="300gsm">300 GSM Heavy Board (+₹2.50/pc)</option>
                  </select>
                </div>
              </>
            )}

            {type !== 'visiting_card' && (
              <div>
                <label className="block text-xs font-bold mb-1">Order Quantity</label>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="form-control"
                  min="1"
                />
              </div>
            )}
          </div>

          <div className="mt-8 bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex justify-between items-center">
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">Estimated Total</div>
              <div className="text-[10px] text-slate-400">Includes mock pricing setup</div>
            </div>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">₹{price}</div>
          </div>

          <button 
            type="button" 
            onClick={handleAdd}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300"
          >
            Add to Print Cart
          </button>
        </div>
      </div>
    </div>
  );
}
