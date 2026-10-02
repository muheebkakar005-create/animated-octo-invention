/**
 * AHSAN PHARMACY POS - OFFLINE DATABASE ENGINE
 * High-performance IndexedDB with dual-write fallback to LocalStorage.
 * 100% offline, zero internet requirement.
 */

const AppDB = (function () {
    const DB_NAME = 'AhsanPharmacy_OfflineDB_v3';
    const DB_VERSION = 1;
    let dbInstance = null;

    // Default Configuration State
    const defaultState = {
        medicines: [],
        salesHistory: [],
        totalRevenue: 0,
        actualProfit: 0,
        nextInvoiceId: 1,
        settings: {
            pharmName: "AHSAN PHARMACY",
            pharmAddress: "Medical Complex Sayrab Rode Quetta, Pakistan",
            pharmPhone: "03166829982",
            pharmNotice: "Medicines sold cannot be returned without original prescription. Keep in cool & dry place.",
            masterPin: "1234"
        }
    };

    /**
     * Initialize IndexedDB with schema creation
     */
    function init() {
        return new Promise((resolve) => {
            if (!window.indexedDB) {
                console.warn('IndexedDB unavailable. Using LocalStorage fallback.');
                resolve(loadFromLocalStorage());
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('appStore')) {
                    db.createObjectStore('appStore', { keyPath: 'key' });
                }
            };

            request.onsuccess = async (e) => {
                dbInstance = e.target.result;
                const state = await loadAllData();
                resolve(state);
            };

            request.onerror = (e) => {
                console.error('IndexedDB open failed:', e);
                resolve(loadFromLocalStorage());
            };
        });
    }

    /**
     * Put item into IndexedDB
     */
    function put(key, value) {
        // Always mirror in localStorage for immediate sync safety
        try {
            localStorage.setItem('ahs_pharm_' + key, JSON.stringify(value));
        } catch (e) {
            console.warn('LocalStorage mirror warning:', e);
        }

        if (!dbInstance) return Promise.resolve();

        return new Promise((resolve) => {
            try {
                const tx = dbInstance.transaction('appStore', 'readwrite');
                const store = tx.objectStore('appStore');
                store.put({ key, value });
                tx.oncomplete = () => resolve();
                tx.onerror = () => resolve();
            } catch (err) {
                console.error('Error writing to IndexedDB:', err);
                resolve();
            }
        });
    }

    /**
     * Get single key from IndexedDB
     */
    function get(key) {
        if (!dbInstance) {
            const raw = localStorage.getItem('ahs_pharm_' + key);
            return Promise.resolve(raw ? JSON.parse(raw) : null);
        }

        return new Promise((resolve) => {
            try {
                const tx = dbInstance.transaction('appStore', 'readonly');
                const store = tx.objectStore('appStore');
                const req = store.get(key);
                req.onsuccess = () => resolve(req.result ? req.result.value : null);
                req.onerror = () => {
                    const raw = localStorage.getItem('ahs_pharm_' + key);
                    resolve(raw ? JSON.parse(raw) : null);
                };
            } catch (err) {
                const raw = localStorage.getItem('ahs_pharm_' + key);
                resolve(raw ? JSON.parse(raw) : null);
            }
        });
    }

    /**
     * Load all state objects
     */
    async function loadAllData() {
        const meds = await get('medicines');
        const sales = await get('salesHistory');
        const rev = await get('totalRevenue');
        const prof = await get('actualProfit');
        const inv = await get('nextInvoiceId');
        const set = await get('settings');

        // Check if legacy data exists in old localStorage keys
        const legacyMeds = localStorage.getItem('pharmacy_meds_v2');
        const legacySales = localStorage.getItem('pharmacy_sales_v2');

        return {
            medicines: meds || (legacyMeds ? JSON.parse(legacyMeds) : defaultState.medicines),
            salesHistory: sales || (legacySales ? JSON.parse(legacySales) : defaultState.salesHistory),
            totalRevenue: rev !== null ? rev : (JSON.parse(localStorage.getItem('pharmacy_rev_v2')) || defaultState.totalRevenue),
            actualProfit: prof !== null ? prof : (JSON.parse(localStorage.getItem('pharmacy_prof_v2')) || defaultState.actualProfit),
            nextInvoiceId: inv !== null ? inv : (JSON.parse(localStorage.getItem('pharmacy_inv_v2')) || defaultState.nextInvoiceId),
            settings: set ? { ...defaultState.settings, ...set } : defaultState.settings
        };
    }

    /**
     * Fallback load from localStorage
     */
    function loadFromLocalStorage() {
        return {
            medicines: JSON.parse(localStorage.getItem('ahs_pharm_medicines') || localStorage.getItem('pharmacy_meds_v2') || '[]'),
            salesHistory: JSON.parse(localStorage.getItem('ahs_pharm_salesHistory') || localStorage.getItem('pharmacy_sales_v2') || '[]'),
            totalRevenue: JSON.parse(localStorage.getItem('ahs_pharm_totalRevenue') || localStorage.getItem('pharmacy_rev_v2') || '0'),
            actualProfit: JSON.parse(localStorage.getItem('ahs_pharm_actualProfit') || localStorage.getItem('pharmacy_prof_v2') || '0'),
            nextInvoiceId: JSON.parse(localStorage.getItem('ahs_pharm_nextInvoiceId') || localStorage.getItem('pharmacy_inv_v2') || '1'),
            settings: JSON.parse(localStorage.getItem('ahs_pharm_settings') || JSON.stringify(defaultState.settings))
        };
    }

    /**
     * Export complete database backup as JSON
     */
    function exportJSON(appState) {
        const payload = {
            appName: "AHSAN Pharmacy POS",
            schemaVersion: "3.0",
            exportTimestamp: new Date().toISOString(),
            ...appState
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AhsanPharmacy_DB_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Import database from JSON backup file
     */
    function importJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!data.medicines || !Array.isArray(data.medicines)) {
                        throw new Error("Invalid format: Missing medicines array.");
                    }
                    resolve(data);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsText(file);
        });
    }

    /**
     * CSV helper download
     */
    function downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return {
        init,
        put,
        get,
        exportJSON,
        importJSON,
        downloadCSV,
        defaultState
    };
})();
