/**
 * AHSAN PHARMACY POS - INVENTORY MODULE (HIGH PERFORMANCE & MULTI-CATEGORY)
 * Vector SVG Icons, Instant Pagination, and Multi-Category Handling.
 */

const InventoryManager = (function () {

    let currentPage = 1;
    let pageSize = 50;
    let currentTotalFiltered = 0;

    // Premium Vector SVG Icons
    const ICONS = {
        medicine: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M4.5 10.5C3.67 11.33 3.67 12.67 4.5 13.5L10.5 19.5C11.33 20.33 12.67 20.33 13.5 19.5L19.5 13.5C20.33 12.67 20.33 11.33 19.5 10.5L13.5 4.5C12.67 3.67 11.33 3.67 10.5 4.5L4.5 10.5ZM12 7L17 12L12 17L7 12L12 7Z"/></svg>`,
        baby: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM8.5 9.5C9.33 9.5 10 10.17 10 11C10 11.83 9.33 12.5 8.5 12.5C7.67 12.5 7 11.83 7 11C7 10.17 7.67 9.5 8.5 9.5ZM12 17.5C9.67 17.5 7.69 16.04 6.89 14H17.11C16.31 16.04 14.33 17.5 12 17.5ZM15.5 12.5C14.67 12.5 14 11.83 14 11C14 10.17 14.67 9.5 15.5 9.5C16.33 9.5 17 10.17 17 11C17 11.83 16.33 12.5 15.5 12.5Z"/></svg>`,
        cosmetics: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M9 3H15V6H17C18.1 6 19 6.9 19 8V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V8C5 6.9 5.9 6 7 6H9V3ZM11 5V6H13V5H11ZM7 8V20H17V8H7Z"/></svg>`,
        soaps: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M19 8H5C3.9 8 3 8.9 3 10V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18V10C21 8.9 20.1 8 19 8ZM19 18H5V10H19V18ZM8 4H16V6H8V4Z"/></svg>`,
        syrup: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M10 2H14V5H16C17.1 5 18 5.9 18 7V20C18 21.1 17.1 22 16 22H8C6.9 22 6 21.1 6 20V7C6 5.9 6.9 5 8 5H10V2ZM8 7V20H16V7H8ZM11 10H13V13H15V15H13V18H11V15H9V13H11V10Z"/></svg>`,
        surgical: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M19 10.5V6.5C19 5.4 18.1 4.5 17 4.5H7C5.9 4.5 5 5.4 5 6.5V17.5C5 18.6 5.9 19.5 7 19.5H12V17.5H7V6.5H17V10.5H19ZM17 13.5L18.4 14.9L14.9 18.4L13.5 17L17 13.5ZM21.9 14.9L20.5 13.5C20.1 13.1 19.5 13.1 19.1 13.5L18 14.6L20.8 17.4L21.9 16.3C22.3 15.9 22.3 15.3 21.9 14.9Z"/></svg>`,
        general: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M20 6H16V4C16 2.89 15.11 2 14 2H10C8.89 2 8 2.89 8 4V6H4C2.89 6 2 6.89 2 8V19C2 20.11 2.89 21 4 21H20C21.11 21 22 20.11 22 19V8C22 6.89 21.11 6 20 6ZM10 4H14V6H10V4ZM20 19H4V8H20V19Z"/></svg>`
    };

    // Category Metadata & SVG Icons
    const CATEGORIES = {
        medicine: { label: "Medicines & Tablets", icon: ICONS.medicine, badgeClass: "badge-primary" },
        baby: { label: "Baby Care & Pampers", icon: ICONS.baby, badgeClass: "badge-warning" },
        cosmetics: { label: "Cosmetics, Creams & Oils", icon: ICONS.cosmetics, badgeClass: "badge-purple" },
        soaps: { label: "Soaps & Hygiene", icon: ICONS.soaps, badgeClass: "badge-success" },
        syrup: { label: "Syrups & Liquids", icon: ICONS.syrup, badgeClass: "badge-blue" },
        surgical: { label: "Surgical & Devices", icon: ICONS.surgical, badgeClass: "badge-gray" },
        general: { label: "General & FMCG", icon: ICONS.general, badgeClass: "badge-gray" }
    };

    function getCategoryInfo(catKey) {
        return CATEGORIES[catKey] || CATEGORIES.general;
    }

    /**
     * Compute stock breakdown based on product type
     */
    function calculateStockBreakdown(product) {
        const category = product.category || 'medicine';
        const isFractionalMed = product.productType === 'fractional_medicine' || (!product.productType && category === 'medicine');

        if (isFractionalMed) {
            const stripsPerBox = product.stripsPerBox || 10;
            const tabletsPerStrip = product.tabletsPerStrip || 10;
            const tabsPerBox = stripsPerBox * tabletsPerStrip;
            const total = product.totalTablets || 0;

            const boxes = Math.floor(total / tabsPerBox);
            const remainder = total % tabsPerBox;
            const strips = Math.floor(remainder / tabletsPerStrip);
            const loose = remainder % tabletsPerStrip;

            return {
                isFractionalMed: true,
                boxes,
                strips,
                loose,
                totalUnits: total,
                primaryUnitLabel: 'Box',
                formatted: `${boxes}B ${strips}S ${loose}T`,
                displayHtml: `
                    <span class="stock-tag">${boxes} Box</span>
                    <span class="stock-tag">${strips} Strip</span>
                    <span class="stock-tag">${loose} Tab</span>
                `,
                isLow: boxes < 1 && strips < 2
            };
        } else {
            const unitLabel = product.unitName || 'Pcs';
            const packContains = product.packContains || 1;
            const total = product.totalUnits !== undefined ? product.totalUnits : (product.totalTablets || 0);

            if (packContains > 1) {
                const packs = Math.floor(total / packContains);
                const loose = total % packContains;
                return {
                    isFractionalMed: false,
                    packs,
                    loose,
                    totalUnits: total,
                    primaryUnitLabel: product.packName || 'Pack',
                    formatted: `${packs} Packs (${total} ${unitLabel})`,
                    displayHtml: `
                        <span class="stock-tag">${packs} ${product.packName || 'Pack'}</span>
                        <span class="stock-tag">${loose} ${unitLabel}</span>
                        <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">Total: ${total} ${unitLabel}</div>
                    `,
                    isLow: total < (packContains * 2)
                };
            } else {
                return {
                    isFractionalMed: false,
                    totalUnits: total,
                    primaryUnitLabel: unitLabel,
                    formatted: `${total} ${unitLabel}`,
                    displayHtml: `
                        <span class="stock-tag" style="background:#e0f2fe; color:#0369a1; font-weight:700;">${total} ${unitLabel}</span>
                    `,
                    isLow: total <= 5
                };
            }
        }
    }

    /**
     * Expiry status helper
     */
    function getExpiryDetails(expiryDateStr) {
        if (!expiryDateStr) {
            return { status: 'none', label: 'No Expiry', badgeClass: 'badge-gray', daysLeft: 9999 };
        }

        const exp = new Date(expiryDateStr);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const diffTime = exp.getTime() - now.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) {
            return { status: 'expired', label: 'EXPIRED', badgeClass: 'badge-danger', daysLeft };
        } else if (daysLeft <= 90) {
            return { status: 'near_expiry', label: `${daysLeft}d left`, badgeClass: 'badge-warning', daysLeft };
        } else {
            return { status: 'valid', label: 'Valid', badgeClass: 'badge-success', daysLeft };
        }
    }

    /**
     * Render Inventory Table with Ultra-Fast Pagination
     */
    function renderTable(products, searchTerm = "", categoryFilter = "all") {
        const tbody = document.getElementById('inventoryTableBody');
        const paginationContainer = document.getElementById('inventoryPagination');
        if (!tbody) return;

        tbody.innerHTML = "";

        let list = products;

        // Filter by category
        if (categoryFilter && categoryFilter !== 'all') {
            list = list.filter(p => (p.category || 'medicine') === categoryFilter);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase().trim();
            if (term === 'expired') {
                list = list.filter(m => getExpiryDetails(m.expiry).status === 'expired');
            } else if (term === 'low') {
                list = list.filter(m => calculateStockBreakdown(m).isLow);
            } else {
                list = list.filter(m => 
                    m.name.toLowerCase().includes(term) || 
                    (m.batch && m.batch.toLowerCase().includes(term)) ||
                    (m.location && m.location.toLowerCase().includes(term)) ||
                    (m.category && m.category.toLowerCase().includes(term))
                );
            }
        }

        currentTotalFiltered = list.length;
        const totalPages = Math.max(1, Math.ceil(currentTotalFiltered / pageSize));
        if (currentPage > totalPages) currentPage = 1;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 25px; color: var(--text-muted);">No products found in this category or search filter.</td></tr>`;
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }

        const startIndex = (currentPage - 1) * pageSize;
        const pageItems = list.slice(startIndex, startIndex + pageSize);

        pageItems.forEach(item => {
            const stock = calculateStockBreakdown(item);
            const exp = getExpiryDetails(item.expiry);
            const catInfo = getCategoryInfo(item.category || 'medicine');

            const buyPrice = item.buyPriceBox !== undefined ? item.buyPriceBox : (item.buyPriceUnit || 0);
            const sellPrice = item.sellPriceBox !== undefined ? item.sellPriceBox : (item.sellPriceUnit || 0);

            tbody.innerHTML += `
                <tr>
                    <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="color:var(--primary);">${catInfo.icon}</span>
                            <div>
                                <strong style="color: var(--text-primary); font-size:13px;">${item.name}</strong>
                                <div style="font-size:10px; color:var(--text-muted); margin-top:1px;">
                                    <span class="badge ${catInfo.badgeClass}" style="font-size:9px;">${catInfo.label}</span>
                                    ${item.location ? ` • 📍 ${item.location}` : ''}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td><code>${item.batch || 'N/A'}</code></td>
                    <td>
                        <span class="badge ${exp.badgeClass}">${item.expiry || 'N/A'}</span>
                        <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">${exp.label}</div>
                    </td>
                    <td style="font-size:11px;">
                        ${stock.isFractionalMed 
                            ? `${item.stripsPerBox}s / ${item.tabletsPerStrip}t` 
                            : `${item.unitName || 'Unit'}${item.packContains > 1 ? ` (${item.packContains}/${item.packName || 'Pack'})` : ''}`
                        }
                    </td>
                    <td>
                        ${stock.displayHtml}
                        ${stock.isLow ? `<span class="badge badge-danger" style="margin-top:2px; display:inline-block;">Low Stock</span>` : ''}
                    </td>
                    <td>Rs. ${Number(buyPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td><strong style="color:var(--primary);">Rs. ${Number(sellPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                    <td style="white-space: nowrap;">
                        <button class="btn btn-secondary btn-sm" onclick="App.openEditMedicineModal(${item.id})" title="Edit">
                            <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24"><path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"/></svg>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="App.deleteMedicine(${item.id})" title="Delete">
                            <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24"><path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"/></svg>
                        </button>
                    </td>
                </tr>
            `;
        });

        // Render Pagination Controls
        if (paginationContainer) {
            const startNum = startIndex + 1;
            const endNum = Math.min(startIndex + pageSize, currentTotalFiltered);

            paginationContainer.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding:12px 0; font-size:12px; color:var(--text-muted);">
                    <div>
                        Showing <strong>${startNum.toLocaleString()} - ${endNum.toLocaleString()}</strong> of <strong>${currentTotalFiltered.toLocaleString()}</strong> products
                    </div>
                    <div style="display:flex; align-items:center; gap:5px;">
                        <button class="btn btn-secondary btn-sm" onclick="InventoryManager.changePage(1)" ${currentPage === 1 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>⏮</button>
                        <button class="btn btn-secondary btn-sm" onclick="InventoryManager.changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>◀ Prev</button>
                        <span style="font-weight:800; color:var(--text-primary); margin:0 4px;">${currentPage} / ${totalPages}</span>
                        <button class="btn btn-secondary btn-sm" onclick="InventoryManager.changePage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>Next ▶</button>
                        <button class="btn btn-secondary btn-sm" onclick="InventoryManager.changePage(${totalPages})" ${currentPage >= totalPages ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>⏭</button>
                    </div>
                </div>
            `;
        }
    }

    function changePage(newPage) {
        if (newPage < 1) return;
        currentPage = newPage;
        const term = document.getElementById('searchInventory') ? document.getElementById('searchInventory').value : '';
        const cat = App.getCurrentInventoryCategoryFilter ? App.getCurrentInventoryCategoryFilter() : 'all';
        renderTable(App.getState().medicines, term, cat);
    }

    function resetPagination() {
        currentPage = 1;
    }

    /**
     * Export inventory to CSV
     */
    function exportToCSV(products) {
        if (!products || products.length === 0) {
            alert('No product records to export.');
            return;
        }

        let csv = "ID,Category,Product Name,Batch,Expiry Date,Packaging Info,Total Available Units,Stock Summary,Buy Price,Sell Price,Shelf Location\n";
        products.forEach(p => {
            const stock = calculateStockBreakdown(p);
            const cat = p.category || 'medicine';
            const buyPrice = p.buyPriceBox !== undefined ? p.buyPriceBox : (p.buyPriceUnit || 0);
            const sellPrice = p.sellPriceBox !== undefined ? p.sellPriceBox : (p.sellPriceUnit || 0);

            csv += `"${p.id}","${cat}","${p.name.replace(/"/g, '""')}","${p.batch || ''}","${p.expiry || ''}","${p.stripsPerBox ? `${p.stripsPerBox}s/${p.tabletsPerStrip}t` : p.unitName || 'Unit'}",${stock.totalUnits},"${stock.formatted}",${buyPrice},${sellPrice},"${p.location || ''}"\n`;
        });

        AppDB.downloadCSV(csv, `Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    }

    return {
        CATEGORIES,
        getCategoryInfo,
        calculateStockBreakdown,
        getExpiryDetails,
        renderTable,
        changePage,
        resetPagination,
        exportToCSV
    };
})();
