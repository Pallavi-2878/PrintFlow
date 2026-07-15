// PrintFlow JavaScript Application Module

// Application State
const state = {
  activeView: 'customer-view', // customer-view, customizer-view, owner-view
  theme: 'light',
  cart: [],
  orders: [],
  currentCustomization: null,
  uploadedDesign: null // { name, size, dataUrl }
};

// Pricing Configurations & Engines
const PRICING_ENGINES = {
  flex: {
    title: 'Flex Banner',
    defaults: { width: 4, height: 3, material: 'normal', grommets: 'yes' },
    calculate: (fields, qty) => {
      const w = parseFloat(fields.width) || 1;
      const h = parseFloat(fields.height) || 1;
      let ratePerSqFt = 12; // base
      if (fields.material === 'star') ratePerSqFt = 20;
      if (fields.material === 'blackback') ratePerSqFt = 28;
      
      let baseCost = w * h * ratePerSqFt;
      if (fields.grommets === 'yes') {
        baseCost += 10; // flat charge for eyelets
      }
      return Math.round(baseCost * qty);
    },
    renderPreview: (fields, canvas) => {
      const w = parseFloat(fields.width) || 4;
      const h = parseFloat(fields.height) || 3;
      const maxDim = 280;
      let widthPx, heightPx;
      if (w >= h) {
        widthPx = maxDim;
        heightPx = (h / w) * maxDim;
      } else {
        heightPx = maxDim;
        widthPx = (w / h) * maxDim;
      }
      canvas.style.width = `${widthPx}px`;
      canvas.style.height = `${heightPx}px`;
      canvas.style.background = 'linear-gradient(135deg, #4f46e5, #ec4899)';
      canvas.style.color = 'white';
      canvas.querySelector('#canvas-text').innerHTML = `
        <div style="font-weight: 800; font-size: 1.1rem;">FLEX BANNER</div>
        <div style="font-size: 0.8rem; margin-top: 5px; opacity: 0.9;">Material: ${fields.material.toUpperCase()}</div>
      `;
    }
  },
  poster: {
    title: 'High-Res Poster',
    defaults: { size: 'a3', finish: 'glossy', orientation: 'portrait' },
    calculate: (fields, qty) => {
      let baseRate = 15; // A4 glossy base
      if (fields.size === 'a3') baseRate = 30;
      if (fields.size === 'a2') baseRate = 60;
      if (fields.size === 'a1') baseRate = 120;
      
      let modifier = 0;
      if (fields.finish === 'matte') modifier = 5;
      if (fields.finish === 'cardstock') modifier = 15;
      
      return Math.round((baseRate + modifier) * qty);
    },
    renderPreview: (fields, canvas) => {
      const isPortrait = fields.orientation === 'portrait';
      const wPx = isPortrait ? 180 : 250;
      const hPx = isPortrait ? 250 : 180;
      canvas.style.width = `${wPx}px`;
      canvas.style.height = `${hPx}px`;
      canvas.style.background = 'linear-gradient(45deg, #10b981, #3b82f6)';
      canvas.style.color = 'white';
      canvas.querySelector('#canvas-text').innerHTML = `
        <div style="font-weight: 800;">POSTER</div>
        <div style="font-size: 0.75rem; margin-top: 4px;">Size: ${fields.size.toUpperCase()}</div>
        <div style="font-size: 0.75rem; opacity: 0.8;">${fields.finish}</div>
      `;
    }
  },
  visiting_card: {
    title: 'Visiting Cards',
    defaults: { quantity_tier: 100, finish: 'matte', corners: 'square' },
    calculate: (fields, qty) => {
      // qty is controlled by quantity_tier select field in visiting card
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
    },
    renderPreview: (fields, canvas) => {
      canvas.style.width = '260px';
      canvas.style.height = '150px';
      canvas.style.borderRadius = fields.corners === 'rounded' ? '12px' : '4px';
      canvas.style.background = '#1e1b4b';
      canvas.style.color = '#e0e7ff';
      canvas.querySelector('#canvas-text').innerHTML = `
        <div style="font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">Creative Studios</div>
        <div style="font-weight: 800; font-size: 1.1rem; color: #fff;">ALEX MORGAN</div>
        <div style="font-size: 0.65rem; color: #a5b4fc;">Creative Director</div>
        <div style="font-size: 0.55rem; margin-top: 15px; opacity: 0.6;">Finish: ${fields.finish.toUpperCase()}</div>
      `;
    }
  },
  id_card: {
    title: 'ID Cards',
    defaults: { side: 'single', holder: 'classic', lanyard: 'standard' },
    calculate: (fields, qty) => {
      let baseCost = 45; // single side basic
      if (fields.side === 'double') baseCost += 20;
      if (fields.holder === 'metal') baseCost += 90;
      
      let lanyardCost = 0;
      if (fields.lanyard === 'standard') lanyardCost = 10;
      if (fields.lanyard === 'premium') lanyardCost = 25;
      
      return Math.round((baseCost + lanyardCost) * qty);
    },
    renderPreview: (fields, canvas) => {
      canvas.style.width = '170px';
      canvas.style.height = '270px';
      canvas.style.borderRadius = '12px';
      canvas.style.background = 'white';
      canvas.style.border = '2px solid #e2e8f0';
      canvas.style.color = '#1e293b';
      canvas.querySelector('#canvas-text').innerHTML = `
        <div style="width: 100%; height: 25px; background: #4f46e5; margin-bottom: 20px;"></div>
        <div style="width: 60px; height: 60px; border-radius: 50%; background: #e2e8f0; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">👤</div>
        <div style="font-weight: 800; font-size: 0.9rem;">Jane Doe</div>
        <div style="font-size: 0.7rem; color: var(--text-muted);">Software Engineer</div>
        <div style="font-size: 0.6rem; color: #4f46e5; font-weight: 700; margin-top: 15px;">CORPORATE ID</div>
        <div style="font-size: 0.55rem; color: var(--text-muted); margin-top: 8px;">Lanyard: ${fields.lanyard}</div>
      `;
    }
  },
  brochure: {
    title: 'Brochure & Flyers',
    defaults: { fold: 'bifold', pages: '4', paper: '170gsm' },
    calculate: (fields, qty) => {
      let baseRate = 4;
      if (fields.fold === 'trifold') baseRate += 1.5;
      if (fields.fold === 'zfold') baseRate += 2;
      
      if (fields.pages === '8') baseRate += 4;
      
      let paperModifier = 0;
      if (fields.paper === '300gsm') paperModifier = 2.5;
      
      return Math.round((baseRate + paperModifier) * qty);
    },
    renderPreview: (fields, canvas) => {
      canvas.style.width = '240px';
      canvas.style.height = '180px';
      canvas.style.background = '#f8fafc';
      canvas.style.border = '1px solid #cbd5e1';
      canvas.style.color = '#334155';
      canvas.querySelector('#canvas-text').innerHTML = `
        <div style="display: flex; height: 100%; width: 100%;">
          <div style="flex:1; border-right: 1px dashed #cbd5e1; padding: 10px; display: flex; flex-direction: column; justify-content: center;">
            <div style="font-weight:800; font-size:0.75rem;">Page 1</div>
          </div>
          <div style="flex:1; padding: 10px; display: flex; flex-direction: column; justify-content: center; background: #f1f5f9;">
            <div style="font-weight:800; font-size:0.75rem;">Page 2</div>
            <div style="font-size:0.5rem; color: var(--text-muted); margin-top: 4px;">Fold: ${fields.fold.toUpperCase()}</div>
          </div>
        </div>
      `;
    }
  }
};

// UI View Management
function switchView(viewName) {
  state.activeView = viewName;
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active');
  });
  const activeSection = document.getElementById(viewName);
  if (activeSection) {
    activeSection.classList.add('active');
  }
  
  // Update view switch button state
  const btn = document.getElementById('view-switch-btn');
  if (btn) {
    if (viewName === 'owner-view') {
      btn.innerHTML = `
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
        <span>Customer View</span>
      `;
      renderOwnerDashboard();
    } else {
      btn.innerHTML = `
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span>Owner Dashboard</span>
      `;
    }
  }
}

// Light / Dark Theme toggle
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  
  toggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    state.theme = newTheme;
    
    if (newTheme === 'dark') {
      icon.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      `;
    } else {
      icon.innerHTML = `
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      `;
    }
  });
}

// Customizer Inputs Generation
window.openCustomizer = function(productType) {
  state.currentCustomization = {
    type: productType,
    fields: { ...PRICING_ENGINES[productType].defaults }
  };
  
  const customizerTitle = document.getElementById('customizer-product-title');
  customizerTitle.innerText = `Customize your ${PRICING_ENGINES[productType].title}`;
  
  document.getElementById('customizer-product-type').value = productType;
  const quantityInput = document.getElementById('input-quantity');
  quantityInput.value = (productType === 'visiting_card') ? 1 : 1;
  // Hide quantity input for visiting cards since quantity selection is done via dropdown tier
  if (productType === 'visiting_card') {
    quantityInput.parentElement.style.display = 'none';
  } else {
    quantityInput.parentElement.style.display = 'block';
  }

  generateDynamicInputs(productType);
  updateLivePrice();
  switchView('customizer-view');
};

window.backToCatalog = function() {
  switchView('customer-view');
};

function generateDynamicInputs(type) {
  const container = document.getElementById('dynamic-inputs-container');
  container.innerHTML = '';
  
  if (type === 'flex') {
    container.innerHTML = `
      <div class="form-group dimension-row">
        <div>
          <label for="flex-width">Width (Feet)</label>
          <input type="number" id="flex-width" class="form-control" value="4" min="1" max="100" step="1">
        </div>
        <div>
          <label for="flex-height">Height (Feet)</label>
          <input type="number" id="flex-height" class="form-control" value="3" min="1" max="100" step="1">
        </div>
      </div>
      <div class="form-group">
        <label for="flex-material">Flex Banner Media/Material</label>
        <select id="flex-material" class="form-control">
          <option value="normal">Normal Flex (Standard Outdoor)</option>
          <option value="star">Star Flex (High Backlight Contrast) (+₹8/sq.ft)</option>
          <option value="blackback">Black Back (Heavy blockout, premium) (+₹16/sq.ft)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="flex-grommets">Include Eyelets/Grommets (Corners)</label>
        <select id="flex-grommets" class="form-control">
          <option value="yes">Yes, all corners & sides (+₹10)</option>
          <option value="no">No eyelets/grommets</option>
        </select>
      </div>
    `;
    
    document.getElementById('flex-width').addEventListener('input', (e) => updateField('width', e.target.value));
    document.getElementById('flex-height').addEventListener('input', (e) => updateField('height', e.target.value));
    document.getElementById('flex-material').addEventListener('change', (e) => updateField('material', e.target.value));
    document.getElementById('flex-grommets').addEventListener('change', (e) => updateField('grommets', e.target.value));
    
  } else if (type === 'poster') {
    container.innerHTML = `
      <div class="form-group">
        <label for="poster-size">Poster Dimensions (Size)</label>
        <select id="poster-size" class="form-control">
          <option value="a4">A4 (8.3" x 11.7") (Base Price)</option>
          <option value="a3" selected>A3 (11.7" x 16.5") (+₹15)</option>
          <option value="a2">A2 (16.5" x 23.4") (+₹45)</option>
          <option value="a1">A1 (23.4" x 33.1") (+₹105)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="poster-finish">Paper Finish / Texture</label>
        <select id="poster-finish" class="form-control">
          <option value="glossy">Glossy Paper (Standard)</option>
          <option value="matte">Matte Paper (+₹5)</option>
          <option value="cardstock">Heavy Cardstock (+₹15)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="poster-orientation">Orientation</label>
        <select id="poster-orientation" class="form-control">
          <option value="portrait" selected>Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </div>
    `;
    
    document.getElementById('poster-size').addEventListener('change', (e) => updateField('size', e.target.value));
    document.getElementById('poster-finish').addEventListener('change', (e) => updateField('finish', e.target.value));
    document.getElementById('poster-orientation').addEventListener('change', (e) => updateField('orientation', e.target.value));
    
  } else if (type === 'visiting_card') {
    container.innerHTML = `
      <div class="form-group">
        <label for="card-quantity">Quantity Pack</label>
        <select id="card-quantity" class="form-control">
          <option value="100" selected>100 Cards (₹1.50 per card)</option>
          <option value="500">500 Cards (₹1.20 per card)</option>
          <option value="1000">1000 Cards (₹0.90 per card)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="card-finish">Premium Coating & Finish</label>
        <select id="card-finish" class="form-control">
          <option value="matte" selected>Matte Laminated (Base)</option>
          <option value="glossy">UV Gloss Laminated (+₹0.10/card)</option>
          <option value="velvet">Soft-Touch Velvet (+₹0.40/card)</option>
          <option value="spotuv">Spot UV Highlights (+₹0.80/card)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="card-corners">Edge Corners</label>
        <select id="card-corners" class="form-control">
          <option value="square" selected>Standard Square Corners</option>
          <option value="rounded">Rounded Corners (+₹0.15/card)</option>
        </select>
      </div>
    `;
    
    document.getElementById('card-quantity').addEventListener('change', (e) => updateField('quantity_tier', e.target.value));
    document.getElementById('card-finish').addEventListener('change', (e) => updateField('finish', e.target.value));
    document.getElementById('card-corners').addEventListener('change', (e) => updateField('corners', e.target.value));
    
  } else if (type === 'id_card') {
    container.innerHTML = `
      <div class="form-group">
        <label for="id-side">Print Side</label>
        <select id="id-side" class="form-control">
          <option value="single" selected>Single-Sided Print</option>
          <option value="double">Double-Sided Print (+₹20)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="id-holder">Card Holder Type</label>
        <select id="id-holder" class="form-control">
          <option value="classic" selected>Clear Acrylic Sleeve</option>
          <option value="metal">Premium Aluminum Case (+₹90)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="id-lanyard">Lanyard Attachment</label>
        <select id="id-lanyard" class="form-control">
          <option value="standard" selected>Standard Royal Blue (+₹10)</option>
          <option value="premium">Custom Printed Satin (+₹25)</option>
          <option value="none">No Lanyard</option>
        </select>
      </div>
    `;
    
    document.getElementById('id-side').addEventListener('change', (e) => updateField('side', e.target.value));
    document.getElementById('id-holder').addEventListener('change', (e) => updateField('holder', e.target.value));
    document.getElementById('id-lanyard').addEventListener('change', (e) => updateField('lanyard', e.target.value));
    
  } else if (type === 'brochure') {
    container.innerHTML = `
      <div class="form-group">
        <label for="brochure-fold">Fold Pattern</label>
        <select id="brochure-fold" class="form-control">
          <option value="bifold" selected>Bi-Fold (4 pages/sides)</option>
          <option value="trifold">Tri-Fold (6 pages/sides) (+₹1.50/pc)</option>
          <option value="zfold">Z-Fold (6 pages/sides) (+₹2/pc)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="brochure-pages">Total Panels/Page Count</label>
        <select id="brochure-pages" class="form-control">
          <option value="4" selected>4 Standard Panels</option>
          <option value="8">8 Booklet Pages (+₹4.00/pc)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="brochure-paper">Paper Weight (GSM)</label>
        <select id="brochure-paper" class="form-control">
          <option value="170gsm" selected>170 GSM Semi-Gloss Art Paper</option>
          <option value="300gsm">300 GSM Heavy Gloss Board (+₹2.50/pc)</option>
        </select>
      </div>
    `;
    
    document.getElementById('brochure-fold').addEventListener('change', (e) => updateField('fold', e.target.value));
    document.getElementById('brochure-pages').addEventListener('change', (e) => updateField('pages', e.target.value));
    document.getElementById('brochure-paper').addEventListener('change', (e) => updateField('paper', e.target.value));
  }
}

function updateField(fieldName, val) {
  if (state.currentCustomization) {
    state.currentCustomization.fields[fieldName] = val;
    updateLivePrice();
  }
}

function updateLivePrice() {
  if (!state.currentCustomization) return;
  
  const type = state.currentCustomization.type;
  const engine = PRICING_ENGINES[type];
  const qtyInput = document.getElementById('input-quantity');
  
  let qty = parseInt(qtyInput.value) || 1;
  if (qty < 1) qty = 1;
  
  const calculatedTotal = engine.calculate(state.currentCustomization.fields, qty);
  state.currentCustomization.price = calculatedTotal;
  state.currentCustomization.quantity = qty;
  
  document.getElementById('live-price').innerText = `₹${calculatedTotal}`;
  
  // Render visual preview aspect ratio & design text dynamically
  const canvas = document.getElementById('canvas-preview');
  engine.renderPreview(state.currentCustomization.fields, canvas);
  
  // Update dimensions label on preview
  const label = document.getElementById('canvas-dimensions-label');
  if (type === 'flex') {
    label.innerText = `${state.currentCustomization.fields.width}' x ${state.currentCustomization.fields.height}'`;
  } else if (type === 'poster') {
    const sz = state.currentCustomization.fields.size;
    label.innerText = sz.toUpperCase();
  } else if (type === 'visiting_card') {
    label.innerText = '3.5" x 2.0"';
  } else if (type === 'id_card') {
    label.innerText = '2.1" x 3.3"';
  } else if (type === 'brochure') {
    label.innerText = 'A4 Folded';
  }
}

document.getElementById('input-quantity').addEventListener('input', updateLivePrice);

// Cart State Logic
const cartOverlay = document.getElementById('cart-drawer');
const cartToggle = document.getElementById('cart-toggle-btn');
const cartClose = document.getElementById('cart-close-btn');

cartToggle.addEventListener('click', () => cartOverlay.classList.toggle('open'));
cartClose.addEventListener('click', () => cartOverlay.classList.remove('open'));

document.getElementById('add-to-cart-btn').addEventListener('click', () => {
  if (!state.currentCustomization) return;
  
  const cartItem = {
    id: Date.now().toString(),
    title: PRICING_ENGINES[state.currentCustomization.type].title,
    type: state.currentCustomization.type,
    fields: { ...state.currentCustomization.fields },
    quantity: state.currentCustomization.type === 'visiting_card' ? parseInt(state.currentCustomization.fields.quantity_tier) : state.currentCustomization.quantity,
    price: state.currentCustomization.price
  };
  
  state.cart.push(cartItem);
  updateCartUI();
  showToast('Item added to print order cart!');
  cartOverlay.classList.add('open');
  switchView('customer-view');
});

function updateCartUI() {
  const badge = document.getElementById('cart-badge');
  badge.innerText = state.cart.length;
  
  const container = document.getElementById('cart-items-list');
  const footer = document.getElementById('cart-footer-panel');
  
  if (state.cart.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 3rem 0;">Your cart is empty.</div>`;
    footer.style.display = 'none';
    return;
  }
  
  footer.style.display = 'block';
  container.innerHTML = '';
  
  let grandTotal = 0;
  state.cart.forEach(item => {
    grandTotal += item.price;
    
    // Parse specs for human readability
    let specs = '';
    for (const [key, val] of Object.entries(item.fields)) {
      if (key === 'quantity_tier') continue;
      specs += `${key}: <strong>${val}</strong> | `;
    }
    specs = specs.slice(0, -3); // remove last separator
    
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-details">
        <h4>${item.title}</h4>
        <p>${specs}</p>
        <div style="font-size: 0.8rem; margin-top: 5px;">Qty: <strong>${item.quantity}</strong></div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
        <span class="cart-item-price">₹${item.price}</span>
        <button onclick="removeFromCart('${item.id}')" style="background: transparent; color: var(--danger); font-size: 0.8rem;">Remove</button>
      </div>
    `;
    container.appendChild(div);
  });
  
  document.getElementById('cart-grand-total').innerText = `₹${grandTotal}`;
}

window.removeFromCart = function(id) {
  state.cart = state.cart.filter(item => item.id !== id);
  updateCartUI();
};

// Design Image Upload & Preview Handler
const fileInput = document.getElementById('design-file-input');
const uploadArea = document.getElementById('upload-status-text').parentElement;
const uploadStatus = document.getElementById('upload-status-text');
const previewContainer = document.getElementById('design-preview-container');
const previewImg = document.getElementById('design-preview-img');
const previewName = document.getElementById('design-preview-name');
const previewSize = document.getElementById('design-preview-size');
const removeDesignBtn = document.getElementById('remove-design-btn');

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    state.uploadedDesign = {
      name: file.name,
      size: `${Math.round(file.size / 1024)} KB`,
      dataUrl: file.type.startsWith('image/') ? event.target.result : 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=200' // dummy default preview for PDFs
    };
    
    previewImg.src = state.uploadedDesign.dataUrl;
    previewName.innerText = state.uploadedDesign.name;
    previewSize.innerText = state.uploadedDesign.size;
    
    uploadArea.style.display = 'none';
    previewContainer.style.display = 'flex';
    showToast('Design layout uploaded!');
  };
  reader.readAsDataURL(file);
});

removeDesignBtn.addEventListener('click', () => {
  state.uploadedDesign = null;
  fileInput.value = '';
  uploadArea.style.display = 'block';
  previewContainer.style.display = 'none';
});

// Submit Orders (Mock placement & dashboard integration)
window.submitOrder = function(event) {
  event.preventDefault();
  
  if (state.cart.length === 0) {
    showToast('Add items to cart first.');
    return;
  }
  
  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  
  const newOrder = {
    id: `PF-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: name,
    customerPhone: phone,
    items: [...state.cart],
    design: state.uploadedDesign ? { ...state.uploadedDesign } : null,
    total: state.cart.reduce((sum, item) => sum + item.price, 0),
    status: 'Pending',
    createdAt: new Date().toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })
  };
  
  // Save to database
  state.orders.push(newOrder);
  localStorage.setItem('printflow_orders', JSON.stringify(state.orders));
  
  // Clean cart state
  state.cart = [];
  state.uploadedDesign = null;
  fileInput.value = '';
  document.getElementById('checkout-form').reset();
  uploadArea.style.display = 'block';
  previewContainer.style.display = 'none';
  updateCartUI();
  cartOverlay.classList.remove('open');
  
  // Create WhatsApp prefilled messaging format link
  const orderDetailsText = newOrder.items.map(item => `• ${item.title} (Qty: ${item.quantity}) - ₹${item.price}`).join('\n');
  const message = `Hello PrintFlow! I placed an order.\n\n*Order ID:* ${newOrder.id}\n*Customer:* ${newOrder.customerName}\n*Phone:* ${newOrder.customerPhone}\n\n*Items Ordered:*\n${orderDetailsText}\n\n*Total Amount:* ₹${newOrder.total}`;
  const encodedText = encodeURIComponent(message);
  
  // Show confirmation with custom options
  const confirmResult = confirm(`Order Placed Successfully!\n\nOrder ID: ${newOrder.id}\nTotal: ₹${newOrder.total}\n\nWould you like to send your order configuration straight to the owner on WhatsApp?`);
  if (confirmResult) {
    window.open(`https://wa.me/919999999999?text=${encodedText}`, '_blank');
  }
  
  showToast('Order saved! Owner has been updated.');
  switchView('customer-view');
};

// Owner Dashboard updates & management
function renderOwnerDashboard() {
  const tbody = document.getElementById('owner-orders-tbody');
  tbody.innerHTML = '';
  
  let totalSales = 0;
  let countOrders = state.orders.length;
  let countPending = 0;
  let countCompleted = 0;
  
  if (state.orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 3rem 0;">No printing orders received yet. Try placing an order as a customer.</td></tr>`;
  } else {
    state.orders.forEach(order => {
      totalSales += order.total;
      if (order.status === 'Pending' || order.status === 'Printing') countPending++;
      if (order.status === 'Completed' || order.status === 'Delivered') countCompleted++;
      
      const tr = document.createElement('tr');
      
      // Build items cell string
      const itemsCell = order.items.map(item => {
        let fieldsStr = '';
        for (const [k, v] of Object.entries(item.fields)) {
          if (k === 'quantity_tier') continue;
          fieldsStr += `${k}:${v}, `;
        }
        return `<div><strong>${item.title}</strong> (Qty:${item.quantity})<br><span style="font-size:0.75rem; color:var(--text-muted);">${fieldsStr.slice(0,-2)}</span></div>`;
      }).join('<hr style="margin: 5px 0; border: none; border-top: 1px solid var(--border-color);">');
      
      // Design preview
      const designCell = order.design ? `
        <div style="display:flex; align-items:center; gap:8px;">
          <img class="design-preview-thumbnail" src="${order.design.dataUrl}" onclick="window.open('${order.design.dataUrl}', '_blank')">
          <span style="font-size:0.75rem; max-width:80px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${order.design.name}</span>
        </div>
      ` : `<span style="color:var(--text-muted); font-size:0.8rem;">No file uploaded</span>`;
      
      tr.innerHTML = `
        <td style="font-weight:700;">${order.id}<br><span style="font-weight:400; font-size:0.7rem; color:var(--text-muted);">${order.createdAt}</span></td>
        <td><strong>${order.customerName}</strong><br><span style="font-size:0.8rem;">${order.customerPhone}</span></td>
        <td>${itemsCell}</td>
        <td>${designCell}</td>
        <td style="font-weight:700; color:var(--primary);">₹${order.total}</td>
        <td><span class="badge badge-${order.status.toLowerCase()}">${order.status}</span></td>
        <td>
          <select class="form-control" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onchange="updateOrderStatus('${order.id}', this.value)">
            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Printing" ${order.status === 'Printing' ? 'selected' : ''}>Printing</option>
            <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
  
  // Update KPI counters
  document.getElementById('stat-revenue').innerText = `₹${totalSales}`;
  document.getElementById('stat-total-orders').innerText = countOrders;
  document.getElementById('stat-pending').innerText = countPending;
  document.getElementById('stat-completed').innerText = countCompleted;
}

window.updateOrderStatus = function(orderId, newStatus) {
  state.orders = state.orders.map(order => {
    if (order.id === orderId) {
      order.status = newStatus;
    }
    return order;
  });
  localStorage.setItem('printflow_orders', JSON.stringify(state.orders));
  renderOwnerDashboard();
  showToast(`Order ${orderId} marked as ${newStatus}`);
};

// Toast notification helper
function showToast(message) {
  const toast = document.getElementById('toast-notif');
  document.getElementById('toast-message').innerText = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Initial bootstrapper
function init() {
  initTheme();
  
  // Load mock database from LocalStorage
  const cachedOrders = localStorage.getItem('printflow_orders');
  if (cachedOrders) {
    state.orders = JSON.parse(cachedOrders);
  }
  
  // Switch view triggers
  document.getElementById('view-switch-btn').addEventListener('click', () => {
    if (state.activeView === 'owner-view') {
      switchView('customer-view');
    } else {
      switchView('owner-view');
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
