/**
 * AHSAN PHARMACY POS - BILLING & POS MODULE
 * Handles cart management, smart prefix-priority auto search, thermal printing, and returns.
 */

const POSManager = (function () {
    let activeCart = [];

    function getCart() {
        return activeCart;
    }

    function clearCart() {
        activeCart = [];
        updateCartUI();
    }

    function addToCart(item) {
        activeCart.push(item);
        updateCartUI();
    }

    function removeFromCart(index) {
        activeCart.splice(index, 1);
        updateCartUI();
    }

    function updateCartUI() {
        const tbody = document.getElementById('cartTableBody');
        const checkoutSec = document.getElementById('checkoutSection');
        const floatCart = document.getElementById('mobileCartFloatBar');
        const floatCount = document.getElementById('mobileCartCount');
        const floatTotal = document.getElementById('mobileCartTotal');

        if (!tbody) return;

        tbody.innerHTML = "";

        if (activeCart.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:16px;">Basket is currently empty</td></tr>`;
            if (checkoutSec) checkoutSec.style.display = 'none';
            if (floatCart) floatCart.classList.remove('has-items');
            return;
        }

        if (checkoutSec) checkoutSec.style.display = 'block';

        let subtotal = 0;
        let totalItemsCount = 0;

        activeCart.forEach((item, index) => {
            subtotal += item.lineTotal;
            totalItemsCount += item.qty;

            tbody.innerHTML += `
                <tr>
                    <td>
                        <strong style="color:var(--text-primary);">${item.name}</strong>
                        ${item.batch ? `<div style="font-size:10px; color:var(--text-muted);">Batch: ${item.batch}</div>` : ''}
                    </td>
                    <td><span class="stock-tag">${item.unitType}</span></td>
                    <td><strong>${item.qty}</strong></td>
                    <td>Rs. ${item.unitPrice.toFixed(2)}</td>
                    <td><strong style="color:var(--primary);">Rs. ${item.lineTotal.toFixed(2)}</strong></td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="POSManager.removeFromCart(${index})" title="Remove">✕</button>
                    </td>
                </tr>
            `;
        });

        const cartSubtotalEl = document.getElementById('cartSubtotal');
        if (cartSubtotalEl) cartSubtotalEl.textContent = `Rs. ${subtotal.toFixed(2)}`;

        calculateGrandTotal(subtotal);

        // Update Mobile Float Bar
        if (floatCart && floatCount && floatTotal) {
            floatCount.textContent = `${totalItemsCount} item${totalItemsCount > 1 ? 's' : ''}`;
            floatTotal.textContent = `Rs. ${subtotal.toFixed(2)}`;
            floatCart.classList.add('has-items');
        }
    }

    function calculateGrandTotal(subtotal) {
        const discInput = document.getElementById('saleDiscount');
        const grandTotalEl = document.getElementById('cartGrandTotal');
        const discPercent = parseFloat(discInput ? discInput.value : 0) || 0;
        const discountAmount = subtotal * (discPercent / 100);
        const grandTotal = Math.max(0, subtotal - discountAmount);

        if (grandTotalEl) grandTotalEl.textContent = `Rs. ${grandTotal.toFixed(2)}`;
        return { subtotal, discPercent, discountAmount, grandTotal };
    }

    /**
     * Smart Prefix Auto-Search with "Starts-With" Prioritization
     * When user types "i", items starting with "i" appear at the very TOP of the screen!
     */
    function searchProductsWithPrefixPriority(products, query, categoryFilter = "all") {
        if (!query) return [];

        const cleanQuery = query.toLowerCase().trim();
        let list = products;

        if (categoryFilter && categoryFilter !== 'all') {
            list = list.filter(p => (p.category || 'medicine') === categoryFilter);
        }

        const startsWithMatches = [];
        const containsMatches = [];

        list.forEach(item => {
            const name = item.name.toLowerCase();
            const batch = (item.batch || '').toLowerCase();

            if (name.startsWith(cleanQuery)) {
                // Highest priority: Exact start of medicine name
                startsWithMatches.push({ item, priority: 1 });
            } else {
                // Check if any secondary word in name starts with query (e.g. "Panadol Extra" starts with "Extra")
                const words = name.split(/\s+/);
                const wordMatch = words.some(w => w.startsWith(cleanQuery));

                if (wordMatch) {
                    startsWithMatches.push({ item, priority: 2 });
                } else if (name.includes(cleanQuery) || batch.includes(cleanQuery)) {
                    containsMatches.push({ item, priority: 3 });
                }
            }
        });

        // Sort starts-with first, then general matches, limited to top 60 for ultra-fluid speed
        return [...startsWithMatches, ...containsMatches].slice(0, 60).map(m => m.item);
    }

    /**
     * Render instant auto-search suggestion cards under POS search input
     */
    function renderAutoSearchResults(results, query) {
        const container = document.getElementById('posAutoSearchResults');
        if (!container) return;

        if (!results || results.length === 0 || !query) {
            container.innerHTML = '';
            container.classList.remove('open');
            return;
        }

        container.innerHTML = '';
        container.classList.add('open');

        results.forEach(item => {
            const stock = InventoryManager.calculateStockBreakdown(item);
            const cat = InventoryManager.getCategoryInfo(item.category || 'medicine');
            const exp = InventoryManager.getExpiryDetails(item.expiry);

            const price = item.sellPriceBox !== undefined ? item.sellPriceBox : (item.sellPriceUnit || 0);
            const unitSuffix = stock.isFractionalMed ? '/Box' : `/${stock.primaryUnitLabel}`;

            // Highlight matched letters
            const regex = new RegExp(`(${query})`, 'gi');
            const highlightedName = item.name.replace(regex, '<mark>$1</mark>');

            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.innerHTML = `
                <div class="search-item-info">
                    <div class="search-item-name">${cat.icon} ${highlightedName}</div>
                    <div class="search-item-meta">
                        <span class="badge ${cat.badgeClass}" style="font-size:9px;">${cat.label}</span>
                        <span>Stock: <strong>${stock.formatted}</strong></span>
                        ${item.batch ? `<span>• <code>${item.batch}</code></span>` : ''}
                    </div>
                </div>
                <div class="search-item-price">
                    Rs. ${Number(price).toFixed(2)}${unitSuffix}
                </div>
            `;

            // Direct tap selects and focuses quantity
            div.addEventListener('click', () => {
                App.selectProductForSale(item.id);
                container.classList.remove('open');
                document.getElementById('posSearchInput').value = item.name;
                const qtyInput = document.getElementById('saleQty');
                if (qtyInput) {
                    qtyInput.focus();
                    qtyInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });

            container.appendChild(div);
        });
    }

    /**
     * Show Receipt Modal with Store Profile
     */
    function showReceipt(sale, settings) {
        document.getElementById('invShopName').textContent = settings.pharmName || "AHSAN PHARMACY";
        document.getElementById('invShopAddress').textContent = settings.pharmAddress || "";
        document.getElementById('invShopPhone').textContent = `Ph: ${settings.pharmPhone || ""}`;
        document.getElementById('invNoticeField').textContent = settings.pharmNotice || "";

        document.getElementById('invIdField').textContent = sale.invoiceId;
        document.getElementById('invDateField').textContent = sale.date;
        document.getElementById('invCustomerName').textContent = sale.customerName || "Walk-in";
        document.getElementById('invCustomerPhone').textContent = sale.customerPhone || "N/A";

        const docRow = document.getElementById('invDoctorRow');
        if (sale.doctorName) {
            if (docRow) docRow.style.display = 'flex';
            document.getElementById('invDoctorName').textContent = sale.doctorName;
            document.getElementById('invPayMode').textContent = sale.paymentMethod || "Cash";
        } else {
            if (docRow) docRow.style.display = 'none';
        }

        const itemsBody = document.getElementById('invItemsBody');
        if (itemsBody) {
            itemsBody.innerHTML = '';
            sale.items.forEach(item => {
                itemsBody.innerHTML += `
                    <tr>
                        <td style="text-align: left;">
                            <strong>${item.name}</strong><br>
                            <span style="font-size:10px; color:#444;">${item.qty} ${item.unitType} @ Rs.${item.unitPrice.toFixed(2)}</span>
                        </td>
                        <td style="text-align: center;">${item.qty}</td>
                        <td style="text-align: right;"><strong>Rs. ${item.lineTotal.toFixed(2)}</strong></td>
                    </tr>
                `;
            });
        }

        document.getElementById('invSubtotal').textContent = `Rs. ${sale.subtotal.toFixed(2)}`;
        document.getElementById('invDiscPercent').textContent = sale.discountPercent || 0;
        document.getElementById('invDiscAmount').textContent = `Rs. ${(sale.discountAmount || 0).toFixed(2)}`;
        document.getElementById('invGrandTotal').textContent = `Rs. ${sale.totalAmount.toFixed(2)}`;

        const modal = document.getElementById('invoiceModal');
        if (modal) modal.classList.add('active');
    }

    return {
        getCart,
        addToCart,
        removeFromCart,
        clearCart,
        updateCartUI,
        calculateGrandTotal,
        searchProductsWithPrefixPriority,
        renderAutoSearchResults,
        showReceipt
    };
})();
