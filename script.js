// WhatsApp 接收订单的电话号码
const COMPANY_WHATSAPP = "60127083166"; 

let cart = {}; 
let currentCategory = 'all';

// 更新加减商品数量
function updateQty(productId, delta) {
  const productElem = document.querySelector(`[data-id="${productId}"]`);
  const limit = parseInt(productElem.getAttribute('data-limit')) || 10;
  
  let currentQty = cart[productId] || 0;
  let newQty = currentQty + delta;

  if (newQty < 0) newQty = 0;
  if (newQty > limit) {
    alert(`此商品每人限购 ${limit} 份`);
    return;
  }

  if (newQty === 0) {
    delete cart[productId];
  } else {
    cart[productId] = newQty;
  }

  const minusBtn = productElem.querySelector('.btn-minus');
  const qtyCount = productElem.querySelector('.qty-count');

  if (newQty > 0) {
    minusBtn.style.display = 'inline-block';
    qtyCount.style.display = 'inline-block';
    qtyCount.innerText = newQty;
  } else {
    minusBtn.style.display = 'none';
    qtyCount.style.display = 'none';
    qtyCount.innerText = '0';
  }

  calculateTotals();
}

// 计算总价和运费
function calculateTotals() {
  let subtotal = 0;
  let totalItemsCount = 0;

  for (let pid in cart) {
    const qty = cart[pid];
    const elem = document.querySelector(`[data-id="${pid}"]`);
    const price = parseFloat(elem.getAttribute('data-price'));
    
    subtotal += price * qty;
    totalItemsCount += qty;
  }

  const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
  const deliveryFee = parseFloat(selectedDelivery.getAttribute('data-cost')) || 0;
  const finalTotal = subtotal + deliveryFee;

  document.getElementById('subtotalDisplay').innerText = `RM${subtotal.toFixed(2)}`;
  document.getElementById('deliveryFeeDisplay').innerText = `RM${deliveryFee.toFixed(2)}`;
  document.getElementById('finalTotalDisplay').innerText = `RM${finalTotal.toFixed(2)}`;
  
  document.getElementById('totalQtyBadge').innerText = totalItemsCount;
  document.getElementById('barTotalDisplay').innerText = `RM${finalTotal.toFixed(2)}`;
}

// 打开订单总结弹窗
function openOrderSummary() {
  if (Object.keys(cart).length === 0) {
    alert('请先选择至少一样商品！');
    return;
  }

  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();

  if (!name || !phone) {
    alert('请填写真实姓名和联系电话');
    return;
  }

  let summaryHtml = "";
  let subtotal = 0;

  for (let pid in cart) {
    const qty = cart[pid];
    const elem = document.querySelector(`[data-id="${pid}"]`);
    const nameText = elem.querySelector('.product-title').innerText;
    const price = parseFloat(elem.getAttribute('data-price'));
    const itemTotal = price * qty;
    
    subtotal += itemTotal;
    summaryHtml += `
      <div class="summary-item-row">
        <span class="item-name">${qty} × ${nameText}</span>
        <span class="item-price">RM${itemTotal.toFixed(2)}</span>
      </div>
    `;
  }

  const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
  const deliveryTitle = selectedDelivery.value;
  const deliveryFee = parseFloat(selectedDelivery.getAttribute('data-cost')) || 0;
  const finalTotal = subtotal + deliveryFee;

  const unit = document.getElementById('custUnit').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const postcode = document.getElementById('custPostcode').value.trim();

  document.getElementById('summaryItemList').innerHTML = summaryHtml;
  document.getElementById('summarySubtotal').innerText = `RM${subtotal.toFixed(2)}`;
  document.getElementById('summaryDeliveryLabel').innerText = `Delivery Fee: ${deliveryTitle}`;
  document.getElementById('summaryDeliveryFee').innerText = `RM${deliveryFee.toFixed(2)}`;
  document.getElementById('summaryTotal').innerText = `RM${finalTotal.toFixed(2)}`;

  let custInfoHtml = `<div class="cust-info-title"><strong>Customer Info:</strong></div>`;
  custInfoHtml += `<div><strong>Name:</strong> ${name}</div>`;
  custInfoHtml += `<div><strong>Phone:</strong> +60${phone}</div>`;
  if (unit || address || postcode) {
    custInfoHtml += `<div><strong>Address:</strong> ${unit} ${address} ${postcode}</div>`;
  }
  document.getElementById('summaryCustInfo').innerHTML = custInfoHtml;

  document.getElementById('summaryModal').classList.add('active');
}

// 关闭订单总结弹窗
function closeOrderSummary() {
  document.getElementById('summaryModal').classList.remove('active');
}

// 跳转发送 WhatsApp 订单信息
function sendToWhatsApp() {
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const unit = document.getElementById('custUnit').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const postcode = document.getElementById('custPostcode').value.trim();

  const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
  const deliveryMethod = selectedDelivery.value;
  const deliveryFee = parseFloat(selectedDelivery.getAttribute('data-cost')) || 0;

  let orderListText = "";
  let subtotal = 0;

  for (let pid in cart) {
    const qty = cart[pid];
    const elem = document.querySelector(`[data-id="${pid}"]`);
    const nameText = elem.querySelector('.product-title').innerText;
    const price = parseFloat(elem.getAttribute('data-price'));
    const itemTotal = price * qty;
    
    subtotal += itemTotal;
    orderListText += `▪ ${nameText} x ${qty} = RM${itemTotal.toFixed(2)}\n`;
  }

  const finalTotal = subtotal + deliveryFee;

  let msg = `🛒 *NEW ORDER - Coucou food: The Selections*\n`;
  msg += `---------------------------------\n`;
  msg += `*ORDER ITEMS:*\n${orderListText}`;
  msg += `---------------------------------\n`;
  msg += `*Subtotal:* RM${subtotal.toFixed(2)}\n`;
  msg += `*Delivery Option:* ${deliveryMethod}\n`;
  msg += `*Delivery Fee:* RM${deliveryFee.toFixed(2)}\n`;
  msg += `*GRAND TOTAL:* RM${finalTotal.toFixed(2)}\n\n`;
  msg += `👤 *CUSTOMER DETAILS:*\n`;
  msg += `*Name:* ${name}\n`;
  msg += `*Phone:* +60${phone}\n`;
  if(unit || address || postcode) {
    msg += `*Address:* ${unit} ${address} ${postcode}\n`;
  }

  const encodedMsg = encodeURIComponent(msg);
  window.open(`https://wa.me/${COMPANY_WHATSAPP}?text=${encodedMsg}`, '_blank');
}

// 分类筛选
function filterCategory(category, btnElement) {
  currentCategory = category;

  if (btnElement) {
    document.querySelectorAll('.pill-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
  } else {
    document.querySelectorAll('.pill-btn').forEach(btn => {
      if (btn.innerText.toLowerCase().includes(category) || (category === 'all' && btn.innerText === '全部')) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  filterProducts();
}

// 关键词与分类联合过滤
function filterProducts() {
  const searchInput = document.getElementById('searchInput').value.toLowerCase().trim();
  const products = document.querySelectorAll('.product-item');
  let visibleCount = 0;

  products.forEach(product => {
    const name = product.getAttribute('data-name').toLowerCase();
    const category = product.getAttribute('data-category');

    const matchesCategory = (currentCategory === 'all' || category === currentCategory);
    const matchesSearch = name.includes(searchInput);

    if (matchesCategory && matchesSearch) {
      product.style.display = 'block';
      visibleCount++;
    } else {
      product.style.display = 'none';
    }
  });

  const noResults = document.getElementById('noResults');
  if (visibleCount === 0) {
    noResults.style.display = 'block';
  } else {
    noResults.style.display = 'none';
  }
}

// 侧边栏开关
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
  document.getElementById('sidebarOverlay').classList.toggle('active');
}

// 分享链接
function shareWebsite() {
  if (navigator.share) {
    navigator.share({
      title: 'Coucou food: The Selections',
      url: window.location.href
    });
  } else {
    alert('已复制网页链接');
    navigator.clipboard.writeText(window.location.href);
  }
}