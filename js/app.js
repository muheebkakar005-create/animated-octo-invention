/**
 * AHSAN PHARMACY POS - MAIN APP CONTROLLER
 * Coordinates UI, routes, multi-category inventory, POS selling, theme toggling, and auto-search.
 */

const App = (function () {
    // In-memory app state
    let state = {
        medicines: [],
        salesHistory: [],
        totalRevenue: 0,
        actualProfit: 0,
        nextInvoiceId: 1,
        settings: {}
    };

    let currentInventoryCategoryFilter = 'all';
    let currentTheme = 'light';

    /**
     * Bootstrap App on Page Load
     */
    async function init() {
        initTheme();
        const loadedState = await AppDB.init();
        state = loadedState;

        // Auto-migrate legacy items if category is missing
        if (state.medicines && state.medicines.length > 0) {
            state.medicines.forEach(m => {
                if (!m.category) m.category = 'medicine';
                if (!m.productType) {
                    m.productType = m.stripsPerBox && m.tabletsPerStrip ? 'fractional_medicine' : 'standard_unit';
                }
            });
        }

        renderAll();
        bindEvents();
        setupServiceWorker();
    }

    /**
     * Theme Controller (Light: Sage/Taupe, Night: Obsidian/Champagne)
     */
    function initTheme() {
        const savedTheme = localStorage.getItem('ahs_pharm_theme') || 'light';
        setTheme(savedTheme);
    }

    function setTheme(theme) {
        currentTheme = theme;
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            updateThemeButtonText('☀️ Light');
        } else {
            document.body.classList.remove('dark-mode');
            updateThemeButtonText('🌙 Night');
        }
        localStorage.setItem('ahs_pharm_theme', theme);
    }

    function toggleTheme() {
        const next = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(next);
    }

    function updateThemeButtonText(text) {
        const btn = document.getElementById('themeToggleBtn');
        if (btn) {
            if (currentTheme === 'light') {
                btn.innerHTML = `<svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> <span>Night</span>`;
            } else {
                btn.innerHTML = `<svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> <span>Light</span>`;
            }
        }
    }

    /**
     * Render entire UI
     */
    function renderAll() {
        DashboardManager.updateMetrics(state);
        InventoryManager.renderTable(state.medicines, "", currentInventoryCategoryFilter);
        populateSellDropdown();
        DashboardManager.renderSalesLogs(state.salesHistory);
        SettingsManager.populateForm(state.settings);
    }

    /**
     * Synchronize in-memory state to persistent IndexedDB
     */
    function persist() {
        AppDB.put('medicines', state.medicines);
        AppDB.put('salesHistory', state.salesHistory);
        AppDB.put('totalRevenue', state.totalRevenue);
        AppDB.put('actualProfit', state.actualProfit);
        AppDB.put('nextInvoiceId', state.nextInvoiceId);
        AppDB.put('settings', state.settings);
    }

    /**
     * Tab Navigation Controller
     */
    function navigateTo(tabId) {
        document.querySelectorAll('.tab-view').forEach(view => view.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

        const targetView = document.getElementById('view-' + tabId);
        if (targetView) targetView.classList.add('active');

        const activeNavBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
        if (activeNavBtn) activeNavBtn.classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Populate POS Select Medicine / Product Dropdown (Optimized for 10,000+ items)
     */
    function populateSellDropdown(categoryFilter = "all", filterTerm = "") {
        const select = document.getElementById('saleSelect');
        if (!select) return;

        select.innerHTML = `<option value="" disabled selected>-- Tap / Select Product (${state.medicines.length.toLocaleString()} in DB) --</option>`;

        let list = state.medicines;
        if (filterTerm) {
            list = POSManager.searchProductsWithPrefixPriority(state.medicines, filterTerm, categoryFilter);
        } else if (categoryFilter && categoryFilter !== 'all') {
            list = list.filter(m => (m.category || 'medicine') === categoryFilter);
        }

        const displayLimit = 150;
        const visibleList = list.slice(0, displayLimit);

        visibleList.forEach(item => {
            const stock = InventoryManager.calculateStockBreakdown(item);
            const exp = InventoryManager.getExpiryDetails(item.expiry);
            const isExp = exp.status === 'expired' ? ' [EXPIRED]' : '';
            const catTag = item.category ? `[${item.category.toUpperCase()}] ` : '';

            const price = item.sellPriceBox !== undefined ? item.sellPriceBox : (item.sellPriceUnit || 0);
            const unitSuffix = stock.isFractionalMed ? '/Box' : `/${stock.primaryUnitLabel}`;

            select.innerHTML += `
                <option value="${item.id}">
                    ${catTag}${item.name} (${stock.formatted}) - Rs.${Number(price).toFixed(2)}${unitSuffix}${isExp}
                </option>
            `;
        });

        if (list.length > displayLimit) {
            select.innerHTML += `<option disabled>... and ${(list.length - displayLimit).toLocaleString()} more (Type in search box)</option>`;
        }
    }

    /**
     * Programmatic product selection from search suggestion or click
     */
    function selectProductForSale(prodId) {
        const select = document.getElementById('saleSelect');
        if (!select) return;

        // Ensure item exists in select options
        let optionExists = Array.from(select.options).some(o => o.value == prodId);
        if (!optionExists) {
            const item = state.medicines.find(m => m.id === prodId);
            if (item) {
                const stock = InventoryManager.calculateStockBreakdown(item);
                const cat = InventoryManager.getCategoryInfo(item.category || 'medicine');
                const price = item.sellPriceBox !== undefined ? item.sellPriceBox : (item.sellPriceUnit || 0);
                select.innerHTML = `<option value="${item.id}" selected>${cat.icon} ${item.name} (${stock.formatted}) - Rs.${Number(price).toFixed(2)}</option>` + select.innerHTML;
            }
        }

        select.value = prodId;
        handleSellSelectionChange();
    }

    /**
     * Dynamic POS Unit and Price Calculation based on product category
     */
    function handleSellSelectionChange() {
        const prodId = parseInt(document.getElementById('saleSelect').value);
        const product = state.medicines.find(m => m.id === prodId);
        const infoBox = document.getElementById('selectedMedInfo');
        const unitSelect = document.getElementById('saleUnitType');
        const customPriceInput = document.getElementById('saleCustomPrice');

        if (!product) {
            if (infoBox) infoBox.style.display = 'none';
            return;
        }

        const stock = InventoryManager.calculateStockBreakdown(product);
        const exp = InventoryManager.getExpiryDetails(product.expiry);
        const catInfo = InventoryManager.getCategoryInfo(product.category || 'medicine');

        const previousSelectedUnit = unitSelect.value;
        unitSelect.innerHTML = '';

        if (stock.isFractionalMed) {
            unitSelect.innerHTML = `
                <option value="box">Box(es)</option>
                <option value="strip">Strip(s)</option>
                <option value="tablet">Loose Tablet(s)</option>
            `;
        } else {
            const unitLabel = product.unitName || 'Piece';
            const packLabel = product.packName || 'Pack';
            const packContains = product.packContains || 1;

            if (packContains > 1) {
                unitSelect.innerHTML = `
                    <option value="pack">${packLabel}(s) - (${packContains} ${unitLabel}s)</option>
                    <option value="piece">Single ${unitLabel}(s)</option>
                `;
            } else {
                unitSelect.innerHTML = `
                    <option value="piece">Single ${unitLabel}(s)</option>
                `;
            }
        }

        if (Array.from(unitSelect.options).some(o => o.value === previousSelectedUnit)) {
            unitSelect.value = previousSelectedUnit;
        }

        // Calculate Price for Selected Unit
        const selectedUnit = unitSelect.value;
        let calculatedPrice = 0;

        if (stock.isFractionalMed) {
            const sellPriceStrip = product.sellPriceBox / (product.stripsPerBox || 10);
            const sellPriceTablet = sellPriceStrip / (product.tabletsPerStrip || 10);

            if (selectedUnit === 'box') calculatedPrice = product.sellPriceBox;
            else if (selectedUnit === 'strip') calculatedPrice = sellPriceStrip;
            else calculatedPrice = sellPriceTablet;
        } else {
            const packContains = product.packContains || 1;
            const packPrice = product.sellPriceBox !== undefined ? product.sellPriceBox : ((product.sellPriceUnit || 0) * packContains);
            const singleUnitPrice = packContains > 1 ? (packPrice / packContains) : (product.sellPriceUnit || product.sellPriceBox || 0);

            if (selectedUnit === 'pack') calculatedPrice = packPrice;
            else calculatedPrice = singleUnitPrice;
        }

        if (customPriceInput) customPriceInput.value = calculatedPrice.toFixed(2);

        if (infoBox) {
            infoBox.style.display = 'block';
            infoBox.innerHTML = `
                <div style="font-size:12px; color:var(--text-primary);">
                    <strong>${catInfo.icon} ${product.name}</strong> 
                    <span class="badge ${catInfo.badgeClass}" style="margin-left:4px;">${catInfo.label}</span> | 
                    Batch: <code>${product.batch || 'N/A'}</code> | 
                    Expiry: <span class="badge ${exp.badgeClass}">${product.expiry || 'N/A'}</span>
                    <div style="margin-top:3px; color:var(--text-muted);">
                        Stock: <strong>${stock.formatted}</strong> ${product.location ? `(📍 ${product.location})` : ''}
                    </div>
                </div>
            `;
        }
    }

    /**
     * Switch Add Stock Form fields based on selected Category
     */
    function handleCategoryFormSwitch() {
        const cat = document.getElementById('medCategory').value;
        const medicineFields = document.getElementById('medicineFieldsGroup');
        const generalFields = document.getElementById('generalProductFieldsGroup');

        if (cat === 'medicine') {
            medicineFields.style.display = 'contents';
            generalFields.style.display = 'none';
            document.getElementById('labelBuyPrice').textContent = 'Buy Price / Box (PKR) *';
            document.getElementById('labelSellPrice').textContent = 'Sell Price / Box (PKR) *';
        } else if (cat === 'baby') {
            medicineFields.style.display = 'none';
            generalFields.style.display = 'contents';
            document.getElementById('productUnitName').value = 'Diaper';
            document.getElementById('productPackName').value = 'Pack';
            document.getElementById('productPackContains').value = '48';
            document.getElementById('labelPackContains').textContent = 'Diapers Per Pack / Carton';
            document.getElementById('labelGeneralStock').textContent = 'Packs / Cartons Bought *';
            document.getElementById('labelBuyPrice').textContent = 'Buy Price / Pack (PKR) *';
            document.getElementById('labelSellPrice').textContent = 'Sell Price / Pack (PKR) *';
        } else if (cat === 'cosmetics') {
            medicineFields.style.display = 'none';
            generalFields.style.display = 'contents';
            document.getElementById('productUnitName').value = 'Piece';
            document.getElementById('productPackName').value = 'Pack';
            document.getElementById('productPackContains').value = '1';
            document.getElementById('labelPackContains').textContent = 'Units Per Pack (1 if single)';
            document.getElementById('labelGeneralStock').textContent = 'Total Units / Pieces Bought *';
            document.getElementById('labelBuyPrice').textContent = 'Buy Price / Piece (PKR) *';
            document.getElementById('labelSellPrice').textContent = 'Sell Price / Piece (PKR) *';
        } else if (cat === 'soaps') {
            medicineFields.style.display = 'none';
            generalFields.style.display = 'contents';
            document.getElementById('productUnitName').value = 'Bar';
            document.getElementById('productPackName').value = 'Pack';
            document.getElementById('productPackContains').value = '1';
            document.getElementById('labelPackContains').textContent = 'Bars Per Pack (1 if single)';
            document.getElementById('labelGeneralStock').textContent = 'Total Bars / Pieces Bought *';
            document.getElementById('labelBuyPrice').textContent = 'Buy Price / Bar (PKR) *';
            document.getElementById('labelSellPrice').textContent = 'Sell Price / Bar (PKR) *';
        } else {
            medicineFields.style.display = 'none';
            generalFields.style.display = 'contents';
            document.getElementById('productUnitName').value = cat === 'syrup' ? 'Bottle' : 'Piece';
            document.getElementById('productPackName').value = 'Box';
            document.getElementById('productPackContains').value = '1';
            document.getElementById('labelPackContains').textContent = 'Units Per Box/Pack';
            document.getElementById('labelGeneralStock').textContent = 'Total Quantity Bought *';
            document.getElementById('labelBuyPrice').textContent = 'Buy Price / Unit (PKR) *';
            document.getElementById('labelSellPrice').textContent = 'Sell Price / Unit (PKR) *';
        }
    }

    /**
     * Filter Inventory by Category Buttons / Pill Selector
     */
    function filterInventoryByCategory(category) {
        currentInventoryCategoryFilter = category;
        InventoryManager.resetPagination();
        document.querySelectorAll('.cat-pill').forEach(pill => {
            pill.classList.toggle('active', pill.getAttribute('data-cat') === category);
        });
        const term = document.getElementById('searchInventory') ? document.getElementById('searchInventory').value : '';
        InventoryManager.renderTable(state.medicines, term, category);
    }

    /**
     * Filter POS Medicine List by Category
     */
    function filterPosByCategory(category) {
        document.querySelectorAll('.pos-cat-pill').forEach(pill => {
            pill.classList.toggle('active', pill.getAttribute('data-poscat') === category);
        });
        const posSearch = document.getElementById('posSearchInput') ? document.getElementById('posSearchInput').value : '';
        populateSellDropdown(category, posSearch);
    }

    /**
     * 1-Click Load 10,000 Sample Products Generator
     */
    function load10000SampleData() {
        if (!confirm('🚀 Load 10,000 realistic pharmacy products (Medicines, Pampers, Soaps, Face Wash, Creams, Oils, Syrups, Surgical)?\n\nThis will populate your 100% offline database.')) {
            return;
        }

        const btn = document.getElementById('gen10kBtn');
        if (btn) {
            btn.textContent = '⏳ Generating 10,000 items in Offline DB...';
            btn.disabled = true;
        }

        setTimeout(() => {
            const newItems = DataGenerator.generate10000Items();
            state.medicines = newItems;
            persist();
            InventoryManager.resetPagination();
            renderAll();

            if (btn) {
                btn.textContent = '🚀 Load 10,000 Sample Products Database';
                btn.disabled = false;
            }
            alert(`🎉 Success! Loaded ${newItems.length.toLocaleString()} products into your 100% Offline Database!`);
        }, 100);
    }

    /**
     * Global Event Listeners
     */
    function bindEvents() {
        // Bottom Navigation Click Handler
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                navigateTo(tab);
            });
        });

        // Search Inventory Input (Instant Debounced Filter)
        const searchInv = document.getElementById('searchInventory');
        if (searchInv) {
            searchInv.addEventListener('input', (e) => {
                InventoryManager.resetPagination();
                InventoryManager.renderTable(state.medicines, e.target.value, currentInventoryCategoryFilter);
            });
        }

        // Live Prefix Auto-Search in POS Tab (Starts-With Prioritization)
        const posSearch = document.getElementById('posSearchInput');
        if (posSearch) {
            posSearch.addEventListener('input', (e) => {
                const query = e.target.value;
                const activePosCatPill = document.querySelector('.pos-cat-pill.active');
                const cat = activePosCatPill ? activePosCatPill.getAttribute('data-poscat') : 'all';

                if (query.trim().length > 0) {
                    const results = POSManager.searchProductsWithPrefixPriority(state.medicines, query, cat);
                    POSManager.renderAutoSearchResults(results, query);
                    populateSellDropdown(cat, query);
                } else {
                    POSManager.renderAutoSearchResults([], '');
                    populateSellDropdown(cat, '');
                }
            });

            // Close auto-search popup when tapping outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-input-wrapper')) {
                    const container = document.getElementById('posAutoSearchResults');
                    if (container) container.classList.remove('open');
                }
            });
        }

        // Category Form Selector
        const catSelect = document.getElementById('medCategory');
        if (catSelect) {
            catSelect.addEventListener('change', handleCategoryFormSwitch);
        }

        // Search Sales History
        const searchSales = document.getElementById('searchSales');
        const rangeSales = document.getElementById('historyFilterRange');
        const triggerSalesFilter = () => {
            DashboardManager.renderSalesLogs(
                state.salesHistory,
                rangeSales ? rangeSales.value : 'all',
                searchSales ? searchSales.value : ''
            );
        };
        if (searchSales) searchSales.addEventListener('input', triggerSalesFilter);
        if (rangeSales) rangeSales.addEventListener('change', triggerSalesFilter);

        // POS Medicine Select Changes
        const saleSelect = document.getElementById('saleSelect');
        const saleUnitType = document.getElementById('saleUnitType');
        if (saleSelect) saleSelect.addEventListener('change', handleSellSelectionChange);
        if (saleUnitType) saleUnitType.addEventListener('change', handleSellSelectionChange);

        // Add to Cart Form
        const addCartForm = document.getElementById('addToCartForm');
        if (addCartForm) {
            addCartForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const prodId = parseInt(document.getElementById('saleSelect').value);
                const unitType = document.getElementById('saleUnitType').value;
                const qty = parseInt(document.getElementById('saleQty').value);
                const unitPrice = parseFloat(document.getElementById('saleCustomPrice').value);

                const product = state.medicines.find(m => m.id === prodId);
                if (!product) return;

                const stock = InventoryManager.calculateStockBreakdown(product);
                let unitsNeeded = 0;
                let lineTotal = 0;
                let lineCost = 0;

                if (stock.isFractionalMed) {
                    const tabsPerBox = (product.stripsPerBox || 10) * (product.tabletsPerStrip || 10);
                    const buyPriceStrip = product.buyPriceBox / (product.stripsPerBox || 10);
                    const buyPriceTablet = buyPriceStrip / (product.tabletsPerStrip || 10);

                    if (unitType === 'box') {
                        unitsNeeded = qty * tabsPerBox;
                        lineTotal = qty * unitPrice;
                        lineCost = qty * product.buyPriceBox;
                    } else if (unitType === 'strip') {
                        unitsNeeded = qty * (product.tabletsPerStrip || 10);
                        lineTotal = qty * unitPrice;
                        lineCost = qty * buyPriceStrip;
                    } else {
                        unitsNeeded = qty;
                        lineTotal = qty * unitPrice;
                        lineCost = qty * buyPriceTablet;
                    }
                } else {
                    const packContains = product.packContains || 1;
                    const packBuyPrice = product.buyPriceBox !== undefined ? product.buyPriceBox : ((product.buyPriceUnit || 0) * packContains);
                    const singleBuyPrice = packContains > 1 ? (packBuyPrice / packContains) : (product.buyPriceUnit || product.buyPriceBox || 0);

                    if (unitType === 'pack') {
                        unitsNeeded = qty * packContains;
                        lineTotal = qty * unitPrice;
                        lineCost = qty * packBuyPrice;
                    } else {
                        unitsNeeded = qty;
                        lineTotal = qty * unitPrice;
                        lineCost = qty * singleBuyPrice;
                    }
                }

                const alreadyReserved = POSManager.getCart()
                    .filter(i => i.medId === prodId)
                    .reduce((sum, i) => sum + i.unitsNeeded, 0);

                if (unitsNeeded + alreadyReserved > stock.totalUnits) {
                    alert(`❌ Insufficient stock! Available: ${stock.totalUnits - alreadyReserved} ${stock.isFractionalMed ? 'tablets' : (product.unitName || 'units')}.`);
                    return;
                }

                const exp = InventoryManager.getExpiryDetails(product.expiry);
                if (exp.status === 'expired') {
                    if (!confirm('⚠️ WARNING: This product is EXPIRED! Are you sure you want to add it to bill?')) {
                        return;
                    }
                }

                POSManager.addToCart({
                    medId: product.id,
                    name: product.name,
                    category: product.category || 'medicine',
                    batch: product.batch || '',
                    unitType,
                    qty,
                    unitPrice,
                    unitsNeeded,
                    lineTotal,
                    lineCost
                });

                document.getElementById('saleQty').value = '';
                document.getElementById('posSearchInput').value = '';
                const searchResultsBox = document.getElementById('posAutoSearchResults');
                if (searchResultsBox) searchResultsBox.classList.remove('open');
            });
        }

        // Sale Discount Realtime Input
        const saleDiscount = document.getElementById('saleDiscount');
        if (saleDiscount) {
            saleDiscount.addEventListener('input', () => {
                const subtotal = POSManager.getCart().reduce((sum, item) => sum + item.lineTotal, 0);
                POSManager.calculateGrandTotal(subtotal);
            });
        }

        // Checkout Button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', finalizeCheckout);
        }

        // Add / Purchase Stock Form Submit
        const medForm = document.getElementById('medForm');
        if (medForm) {
            medForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const category = document.getElementById('medCategory').value;
                const name = document.getElementById('medName').value.trim();
                const batch = document.getElementById('medBatch').value.trim();
                const expiry = document.getElementById('medExpiry').value;
                const location = document.getElementById('medLocation').value.trim();
                const buyPrice = parseFloat(document.getElementById('medBuying').value);
                const sellPrice = parseFloat(document.getElementById('boxSellingPrice').value);

                if (sellPrice < buyPrice) {
                    if (!confirm('⚠️ Selling price is lower than purchase cost. Proceed anyway?')) return;
                }

                let newProduct = {
                    id: Date.now(),
                    category,
                    name,
                    batch,
                    expiry,
                    location,
                    buyPriceBox: buyPrice,
                    sellPriceBox: sellPrice
                };

                if (category === 'medicine') {
                    const stripsPerBox = parseInt(document.getElementById('stripsPerBox').value) || 10;
                    const tabletsPerStrip = parseInt(document.getElementById('tabletsPerStrip').value) || 10;
                    const boxesBought = parseInt(document.getElementById('medStock').value) || 1;
                    const totalTabs = boxesBought * stripsPerBox * tabletsPerStrip;

                    newProduct.productType = 'fractional_medicine';
                    newProduct.stripsPerBox = stripsPerBox;
                    newProduct.tabletsPerStrip = tabletsPerStrip;
                    newProduct.totalTablets = totalTabs;
                } else {
                    const unitName = document.getElementById('productUnitName').value.trim() || 'Piece';
                    const packName = document.getElementById('productPackName').value.trim() || 'Pack';
                    const packContains = parseInt(document.getElementById('productPackContains').value) || 1;
                    const qtyBought = parseInt(document.getElementById('productStockQty').value) || 1;

                    const totalUnits = packContains > 1 ? (qtyBought * packContains) : qtyBought;

                    newProduct.productType = 'standard_unit';
                    newProduct.unitName = unitName;
                    newProduct.packName = packName;
                    newProduct.packContains = packContains;
                    newProduct.totalUnits = totalUnits;
                    newProduct.totalTablets = totalUnits;
                }

                const existing = state.medicines.find(m => 
                    m.name.toLowerCase() === name.toLowerCase() && 
                    (m.category || 'medicine') === category && 
                    (m.batch || '') === batch
                );

                if (existing) {
                    if (existing.productType === 'fractional_medicine') {
                        existing.totalTablets += newProduct.totalTablets;
                        existing.stripsPerBox = newProduct.stripsPerBox;
                        existing.tabletsPerStrip = newProduct.tabletsPerStrip;
                    } else {
                        existing.totalUnits = (existing.totalUnits || existing.totalTablets || 0) + newProduct.totalUnits;
                        existing.totalTablets = existing.totalUnits;
                        existing.unitName = newProduct.unitName;
                        existing.packName = newProduct.packName;
                        existing.packContains = newProduct.packContains;
                    }
                    existing.buyPriceBox = buyPrice;
                    existing.sellPriceBox = sellPrice;
                    existing.expiry = expiry;
                    if (location) existing.location = location;
                    alert('✅ Existing stock replenished successfully!');
                } else {
                    state.medicines.push(newProduct);
                    alert('✅ New product added to inventory successfully!');
                }

                persist();
                renderAll();
                medForm.reset();
                document.getElementById('stripsPerBox').value = '10';
                document.getElementById('tabletsPerStrip').value = '10';
                document.getElementById('productPackContains').value = '1';
                handleCategoryFormSwitch();
            });
        }

        // Edit Medicine Modal Form Submit
        const editForm = document.getElementById('editMedForm');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = parseInt(document.getElementById('editMedId').value);
                const item = state.medicines.find(m => m.id === id);
                if (!item) return;

                item.name = document.getElementById('editMedName').value.trim();
                item.category = document.getElementById('editMedCategory').value;
                item.batch = document.getElementById('editMedBatch').value.trim();
                item.expiry = document.getElementById('editMedExpiry').value;
                item.location = document.getElementById('editMedLocation').value.trim();
                item.buyPriceBox = parseFloat(document.getElementById('editBuyPrice').value);
                item.sellPriceBox = parseFloat(document.getElementById('editSellPrice').value);

                const stock = InventoryManager.calculateStockBreakdown(item);
                if (stock.isFractionalMed) {
                    item.stripsPerBox = parseInt(document.getElementById('editStripsPerBox').value);
                    item.tabletsPerStrip = parseInt(document.getElementById('editTabletsPerStrip').value);
                    item.totalTablets = parseInt(document.getElementById('editTotalUnits').value);
                } else {
                    item.unitName = document.getElementById('editUnitName').value.trim() || 'Piece';
                    item.packContains = parseInt(document.getElementById('editPackContains').value) || 1;
                    item.totalUnits = parseInt(document.getElementById('editTotalUnits').value);
                    item.totalTablets = item.totalUnits;
                }

                persist();
                renderAll();
                closeEditModal();
                alert('✅ Product details updated!');
            });
        }

        // Settings Form Submit
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                state.settings = SettingsManager.readForm();
                persist();
                alert('✅ Pharmacy Settings saved!');
            });
        }
    }

    /**
     * Finalize POS Checkout
     */
    function finalizeCheckout() {
        const cart = POSManager.getCart();
        if (cart.length === 0) {
            alert('Basket is empty!');
            return;
        }

        let subtotal = 0;
        let totalCost = 0;

        cart.forEach(item => {
            const product = state.medicines.find(m => m.id === item.medId);
            if (product) {
                if (product.productType === 'fractional_medicine') {
                    product.totalTablets -= item.unitsNeeded;
                } else {
                    product.totalUnits = (product.totalUnits !== undefined ? product.totalUnits : product.totalTablets) - item.unitsNeeded;
                    product.totalTablets = product.totalUnits;
                }
            }
            subtotal += item.lineTotal;
            totalCost += item.lineCost;
        });

        const discPercent = parseFloat(document.getElementById('saleDiscount').value) || 0;
        const discAmount = subtotal * (discPercent / 100);
        const finalTotal = subtotal - discAmount;
        const finalProfit = finalTotal - totalCost;

        const now = new Date();
        const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

        const saleRecord = {
            invoiceId: '#' + String(state.nextInvoiceId++).padStart(4, '0'),
            date: dateStr,
            customerName: document.getElementById('custName').value.trim() || 'Walk-in Customer',
            customerPhone: document.getElementById('custPhone').value.trim() || 'N/A',
            doctorName: document.getElementById('doctorName').value.trim() || '',
            paymentMethod: document.getElementById('paymentMethod').value,
            items: [...cart],
            subtotal,
            discountPercent: discPercent,
            discountAmount: discAmount,
            totalAmount: finalTotal,
            profit: finalProfit
        };

        state.salesHistory.push(saleRecord);
        state.totalRevenue += finalTotal;
        state.actualProfit += finalProfit;

        persist();
        renderAll();

        POSManager.showReceipt(saleRecord, state.settings);

        POSManager.clearCart();
        document.getElementById('custName').value = '';
        document.getElementById('custPhone').value = '';
        document.getElementById('doctorName').value = '';
        document.getElementById('saleDiscount').value = '0';
    }

    /**
     * Return / Refund an existing sale
     */
    function refundInvoice(invId) {
        const idx = state.salesHistory.findIndex(s => s.invoiceId === invId);
        if (idx === -1) return;
        const sale = state.salesHistory[idx];

        if (confirm(`Refund invoice ${invId}? Items will be added back to stock and revenue adjusted.`)) {
            sale.items.forEach(item => {
                const product = state.medicines.find(m => m.id === item.medId);
                if (product) {
                    if (product.productType === 'fractional_medicine') {
                        product.totalTablets += item.unitsNeeded;
                    } else {
                        product.totalUnits = (product.totalUnits !== undefined ? product.totalUnits : product.totalTablets) + item.unitsNeeded;
                        product.totalTablets = product.totalUnits;
                    }
                }
            });

            state.totalRevenue -= sale.totalAmount;
            state.actualProfit -= sale.profit;
            state.salesHistory.splice(idx, 1);

            persist();
            renderAll();
            alert(`✅ Invoice ${invId} refunded. Stock restored.`);
        }
    }

    function viewOldInvoice(invId) {
        const sale = state.salesHistory.find(s => s.invoiceId === invId);
        if (sale) POSManager.showReceipt(sale, state.settings);
    }

    function openEditMedicineModal(id) {
        const item = state.medicines.find(m => m.id === id);
        if (!item) return;

        const stock = InventoryManager.calculateStockBreakdown(item);

        document.getElementById('editMedId').value = item.id;
        document.getElementById('editMedName').value = item.name;
        document.getElementById('editMedCategory').value = item.category || 'medicine';
        document.getElementById('editMedBatch').value = item.batch || '';
        document.getElementById('editMedExpiry').value = item.expiry || '';
        document.getElementById('editMedLocation').value = item.location || '';
        document.getElementById('editBuyPrice').value = item.buyPriceBox;
        document.getElementById('editSellPrice').value = item.sellPriceBox;
        document.getElementById('editTotalUnits').value = stock.totalUnits;

        const editMedSpecifics = document.getElementById('editMedicineSpecifics');
        const editGeneralSpecifics = document.getElementById('editGeneralSpecifics');

        if (stock.isFractionalMed) {
            editMedSpecifics.style.display = 'contents';
            editGeneralSpecifics.style.display = 'none';
            document.getElementById('editStripsPerBox').value = item.stripsPerBox || 10;
            document.getElementById('editTabletsPerStrip').value = item.tabletsPerStrip || 10;
        } else {
            editMedSpecifics.style.display = 'none';
            editGeneralSpecifics.style.display = 'contents';
            document.getElementById('editUnitName').value = item.unitName || 'Piece';
            document.getElementById('editPackContains').value = item.packContains || 1;
        }

        const modal = document.getElementById('editMedModal');
        if (modal) modal.classList.add('active');
    }

    function closeEditModal() {
        const modal = document.getElementById('editMedModal');
        if (modal) modal.classList.remove('active');
    }

    function deleteMedicine(id) {
        const med = state.medicines.find(m => m.id === id);
        if (!med) return;

        if (confirm(`Are you sure you want to delete "${med.name}" from inventory?`)) {
            state.medicines = state.medicines.filter(m => m.id !== id);
            persist();
            renderAll();
        }
    }

    function filterExpiredInventory() {
        navigateTo('inventory');
        const searchInput = document.getElementById('searchInventory');
        if (searchInput) {
            searchInput.value = 'expired';
            InventoryManager.resetPagination();
            InventoryManager.renderTable(state.medicines, 'expired', currentInventoryCategoryFilter);
        }
    }

    function backupDatabase() {
        AppDB.exportJSON(state);
    }

    async function handleRestoreFile(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const data = await AppDB.importJSON(file);
            if (confirm('Restore this backup? Current offline records will be replaced.')) {
                state.medicines = data.medicines || [];
                state.salesHistory = data.salesHistory || [];
                state.totalRevenue = data.totalRevenue || 0;
                state.actualProfit = data.actualProfit || 0;
                state.nextInvoiceId = data.nextInvoiceId || 1;
                if (data.settings) state.settings = data.settings;

                persist();
                InventoryManager.resetPagination();
                renderAll();
                alert(`✅ Database restored successfully with ${(state.medicines || []).length.toLocaleString()} items!`);
            }
        } catch (err) {
            alert('❌ Restore failed: ' + err.message);
        }
        e.target.value = '';
    }

    function wipeAllData() {
        const pin = prompt('Enter Master PIN to confirm Factory Reset:');
        if (pin === state.settings.masterPin) {
            if (confirm('⚠️ PERMANENTLY ERASE all offline medicines, products, sales, and profits?')) {
                state.medicines = [];
                state.salesHistory = [];
                state.totalRevenue = 0;
                state.actualProfit = 0;
                state.nextInvoiceId = 1;

                persist();
                InventoryManager.resetPagination();
                renderAll();
                alert('System wiped cleanly.');
            }
        } else {
            alert('Invalid PIN.');
        }
    }

    function setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(err => {
                console.log('SW registration notice:', err);
            });
        }
    }

    return {
        init,
        navigateTo,
        setTheme,
        toggleTheme,
        selectProductForSale,
        openEditMedicineModal,
        closeEditModal,
        deleteMedicine,
        viewOldInvoice,
        refundInvoice,
        filterExpiredInventory,
        filterInventoryByCategory,
        filterPosByCategory,
        load10000SampleData,
        backupDatabase,
        handleRestoreFile,
        wipeAllData,
        getCurrentInventoryCategoryFilter: () => currentInventoryCategoryFilter,
        getState: () => state
    };
})();

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
