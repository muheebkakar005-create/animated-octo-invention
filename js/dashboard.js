/**
 * AHSAN PHARMACY POS - DASHBOARD & ANALYTICS MODULE
 * Real-time analytics, vector SVG alerts, stock valuations, and formatted sales logs.
 */

const DashboardManager = (function () {

    const formatMoney = (num) => 'Rs. ' + (Number(num) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    function updateMetrics(state) {
        const { medicines, salesHistory, totalRevenue, actualProfit } = state;

        // 1. Revenue & Profit
        document.getElementById('totalRevenue').textContent = formatMoney(totalRevenue);
        document.getElementById('actualProfit').textContent = formatMoney(actualProfit);
        document.getElementById('totalInvoices').textContent = salesHistory.length.toLocaleString();

        const margin = totalRevenue > 0 ? ((actualProfit / totalRevenue) * 100).toFixed(1) : 0;
        const marginEl = document.getElementById('profitMarginText');
        if (marginEl) marginEl.textContent = `Net Margin: ${margin}%`;

        // 2. Units Sold
        let totalSoldUnits = 0;
        salesHistory.forEach(s => {
            s.items.forEach(i => totalSoldUnits += i.qty);
        });
        const itemsSoldEl = document.getElementById('totalItemsSoldText');
        if (itemsSoldEl) itemsSoldEl.textContent = `${totalSoldUnits.toLocaleString()} units dispensed`;

        // 3. Stock Valuation & Alerts (Multi-Category Calculation)
        let totalSellWorth = 0;
        let totalBuyCost = 0;
        let lowStockCount = 0;
        let expiredCount = 0;

        medicines.forEach(item => {
            const stock = InventoryManager.calculateStockBreakdown(item);
            if (stock.isLow) lowStockCount++;

            const exp = InventoryManager.getExpiryDetails(item.expiry);
            if (exp.status === 'expired') expiredCount++;

            if (stock.isFractionalMed) {
                const tabsPerBox = (item.stripsPerBox || 10) * (item.tabletsPerStrip || 10);
                const boxFraction = (item.totalTablets || 0) / tabsPerBox;
                totalSellWorth += boxFraction * (item.sellPriceBox || 0);
                totalBuyCost += boxFraction * (item.buyPriceBox || 0);
            } else {
                const packContains = item.packContains || 1;
                const totalUnits = item.totalUnits !== undefined ? item.totalUnits : (item.totalTablets || 0);
                const packFraction = totalUnits / packContains;
                
                const sellPrice = item.sellPriceBox !== undefined ? item.sellPriceBox : ((item.sellPriceUnit || 0) * packContains);
                const buyPrice = item.buyPriceBox !== undefined ? item.buyPriceBox : ((item.buyPriceUnit || 0) * packContains);
                
                totalSellWorth += packFraction * sellPrice;
                totalBuyCost += packFraction * buyPrice;
            }
        });

        document.getElementById('totalStockWorth').textContent = formatMoney(totalSellWorth);
        const stockCostEl = document.getElementById('totalStockCostText');
        if (stockCostEl) stockCostEl.textContent = `Cost: ${formatMoney(totalBuyCost)}`;

        const stockAlertsCountEl = document.getElementById('stockAlertsCount');
        if (stockAlertsCountEl) stockAlertsCountEl.textContent = (expiredCount + lowStockCount).toLocaleString();

        const expiredCountTextEl = document.getElementById('expiredCountText');
        if (expiredCountTextEl) expiredCountTextEl.textContent = `${expiredCount.toLocaleString()} Expired / ${lowStockCount.toLocaleString()} Low`;

        renderAlerts(medicines);
        renderPerformance(salesHistory);
    }

    function renderAlerts(medicines) {
        const container = document.getElementById('alertsContainer');
        if (!container) return;
        container.innerHTML = '';

        const expiredMeds = medicines.filter(m => InventoryManager.getExpiryDetails(m.expiry).status === 'expired');
        const nearExpiryMeds = medicines.filter(m => InventoryManager.getExpiryDetails(m.expiry).status === 'near_expiry');

        if (expiredMeds.length > 0) {
            container.innerHTML += `
                <div class="alert-banner alert-danger">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <svg class="svg-icon svg-icon-md" viewBox="0 0 24 24"><path d="M12 2L1 21H23L12 2ZM12 6L19.53 19H4.47L12 6ZM11 10V14H13V10H11ZM11 16V18H13V16H11Z"/></svg>
                        <span><strong>${expiredMeds.length.toLocaleString()} Product(s) EXPIRED!</strong> (${expiredMeds.map(m => m.name).slice(0, 2).join(', ')}${expiredMeds.length > 2 ? '...' : ''})</span>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="App.filterExpiredInventory()">View Expired</button>
                </div>
            `;
        }

        if (nearExpiryMeds.length > 0) {
            container.innerHTML += `
                <div class="alert-banner alert-warning">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <svg class="svg-icon svg-icon-md" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z"/></svg>
                        <span><strong>${nearExpiryMeds.length.toLocaleString()} Products Near Expiry (≤90 days)</strong></span>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('inventory')">Check Stock</button>
                </div>
            `;
        }
    }

    function renderPerformance(salesHistory) {
        const monthly = {}, yearly = {};

        salesHistory.forEach(sale => {
            const parts = sale.date.split('/');
            if (parts.length < 3) return;
            const mKey = `${parts[1]}/${parts[2]}`;
            const yKey = parts[2];

            if (!monthly[mKey]) monthly[mKey] = { rev: 0, prof: 0, count: 0 };
            if (!yearly[yKey]) yearly[yKey] = { rev: 0, prof: 0, count: 0 };

            monthly[mKey].rev += sale.totalAmount;
            monthly[mKey].prof += sale.profit;
            monthly[mKey].count++;

            yearly[yKey].rev += sale.totalAmount;
            yearly[yKey].prof += sale.profit;
            yearly[yKey].count++;
        });

        // Monthly Table
        const mBody = document.getElementById('monthlyTableBody');
        if (mBody) {
            mBody.innerHTML = Object.keys(monthly).length ? '' : '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:12px;">No sales data</td></tr>';
            Object.keys(monthly).reverse().forEach(k => {
                mBody.innerHTML += `
                    <tr>
                        <td><strong>${k}</strong></td>
                        <td>${formatMoney(monthly[k].rev)}</td>
                        <td><strong style="color:var(--success);">${formatMoney(monthly[k].prof)}</strong></td>
                        <td>${monthly[k].count}</td>
                    </tr>
                `;
            });
        }

        // Yearly Table
        const yBody = document.getElementById('yearlyTableBody');
        if (yBody) {
            yBody.innerHTML = Object.keys(yearly).length ? '' : '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:12px;">No sales data</td></tr>';
            Object.keys(yearly).reverse().forEach(k => {
                yBody.innerHTML += `
                    <tr>
                        <td><strong>${k}</strong></td>
                        <td>${formatMoney(yearly[k].rev)}</td>
                        <td><strong style="color:var(--success);">${formatMoney(yearly[k].prof)}</strong></td>
                        <td>${yearly[k].count}</td>
                    </tr>
                `;
            });
        }
    }

    function renderSalesLogs(salesHistory, filterRange = "all", searchTerm = "") {
        const tbody = document.getElementById('salesTableBody');
        if (!tbody) return;

        tbody.innerHTML = "";

        let list = salesHistory;
        const now = new Date();
        const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

        if (filterRange === 'today') {
            list = list.filter(s => s.date === todayStr);
        } else if (filterRange === 'this_month') {
            const mYear = todayStr.split('/').slice(1).join('/');
            list = list.filter(s => s.date.endsWith(mYear));
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase().trim();
            list = list.filter(s => 
                s.invoiceId.toLowerCase().includes(term) ||
                (s.customerName && s.customerName.toLowerCase().includes(term)) ||
                (s.customerPhone && s.customerPhone.includes(term)) ||
                s.items.some(i => i.name.toLowerCase().includes(term))
            );
        }

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-muted);">No sales records found.</td></tr>`;
            return;
        }

        [...list].reverse().forEach(sale => {
            const itemsSummary = sale.items.map(i => `${i.name} (${i.qty} ${i.unitType})`).join(', ');
            tbody.innerHTML += `
                <tr>
                    <td><strong style="color:var(--text-primary);">${sale.invoiceId}</strong></td>
                    <td style="white-space:nowrap; font-size:11px;">${sale.date}</td>
                    <td>
                        <strong>${sale.customerName || 'Walk-in'}</strong>
                        ${sale.customerPhone && sale.customerPhone !== 'N/A' ? `<div style="font-size:10px; color:var(--text-muted);">📞 ${sale.customerPhone}</div>` : ''}
                    </td>
                    <td style="font-size:11px; max-width:220px;">${itemsSummary}</td>
                    <td><strong>${formatMoney(sale.totalAmount)}</strong></td>
                    <td><strong style="color:var(--success);">${formatMoney(sale.profit)}</strong></td>
                    <td><span class="badge badge-primary">${sale.paymentMethod || 'Cash'}</span></td>
                    <td style="white-space:nowrap;">
                        <button class="btn btn-secondary btn-sm" onclick="App.viewOldInvoice('${sale.invoiceId}')" title="Print/View Bill">🧾 View</button>
                        <button class="btn btn-danger btn-sm" onclick="App.refundInvoice('${sale.invoiceId}')" title="Return">↩️ Return</button>
                    </td>
                </tr>
            `;
        });
    }

    function exportSalesCSV(salesHistory) {
        if (!salesHistory || salesHistory.length === 0) {
            alert('No sales to export.');
            return;
        }

        let csv = "Invoice ID,Date,Customer Name,Phone,Doctor,Items,Subtotal,Discount %,Total Amount,Net Profit,Payment Method\n";
        salesHistory.forEach(s => {
            const summary = s.items.map(i => `${i.name} (${i.qty} ${i.unitType})`).join('; ');
            csv += `"${s.invoiceId}","${s.date}","${s.customerName || ''}","${s.customerPhone || ''}","${s.doctorName || ''}","${summary.replace(/"/g, '""')}",${s.subtotal},${s.discountPercent || 0},${s.totalAmount},${s.profit || 0},"${s.paymentMethod || 'Cash'}"\n`;
        });

        AppDB.downloadCSV(csv, `SalesLogs_${new Date().toISOString().slice(0, 10)}.csv`);
    }

    return {
        updateMetrics,
        renderSalesLogs,
        exportSalesCSV
    };
})();
