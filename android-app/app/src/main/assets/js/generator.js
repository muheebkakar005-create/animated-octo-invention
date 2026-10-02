/**
 * AHSAN PHARMACY POS - REALISTIC 10,000 ITEM DATA GENERATOR
 * Generates 10,000 realistic pharmacy & general store products across all categories:
 * - Medicines & Tablets / Antibiotics / Painkillers / Vitamins
 * - Baby Care, Diapers & Pampers (Pampers, Huggies, Canbebe, Molfix, Baby Wipes)
 * - Cosmetics (Face Wash, Face Creams, Lotions, Serums, Hair Oils, Sunblocks)
 * - Soaps & Hygiene (Dettol, Safeguard, Lifebuoy, Dove, Lux, Palmolive, Shampoos)
 * - Syrups & Suspensions (Cough, Fever, Multivitamins, Antacids, Drops)
 * - Surgical & Medical Devices (Syringes, Cannulas, Gauze, Bandages, BP Monitors)
 * - General FMCG & Nutrition (Cerelac, Energy drinks, Milk formula, Glucose)
 */

const DataGenerator = (function () {

    const MEDICINE_NAMES = [
        "Panadol 500mg", "Panadol Extra", "Panadol CF", "Augmentin 625mg", "Augmentin 1g",
        "Disprin 300mg", "Brufen 400mg", "Brufen 600mg", "Arinac Forte", "Arinac",
        "Flagyl 400mg", "Flagyl 200mg", "Ponstan 500mg", "Ponstan Forte", "Ciproxin 500mg",
        "Nuberol Forte", "Keflex 500mg", "Leflox 500mg", "Leflox 250mg", "Amoxil 500mg",
        "Amoxil 250mg", "Risek 20mg", "Risek 40mg", "Nexum 40mg", "Nexum 20mg",
        "Gravinate 50mg", "Avil 25mg", "Zyrtec 10mg", "Rigix 10mg", "Softin 10mg",
        "Kestine 20mg", "Sancos", "Corex", "Hydryllin", "CaC 1000 Plus",
        "Surbex Z", "Centrum Silver", "Neurobion", "Methycobal 500mcg", "Concor 2.5mg",
        "Concor 5mg", "Lipiget 10mg", "Lipiget 20mg", "Glucophage 500mg", "Glucophage 1000mg",
        "Getryl 2mg", "Getryl 4mg", "Diamicron MR 60mg", "Xanax 0.5mg", "Lexotanil 3mg",
        "Ventolin Inhaler", "Seretide Evohaler", "Pulmicort Inhaler", "Polyfax Skin Ointment", "Polyfax Eye Ointment",
        "Betnovate-N Cream", "Dermovate Cream", "Hydrozole Cream", "Quench Cream", "Voltral Emulgel",
        "Fastum Gel", "Deep Heat Rub", "Faktu Ointment", "Proctoa軟膏", "Gaviscon Liquid",
        "Entamizole", "Motilium 10mg", "Spasrid", "Buscopan 10mg", "Buscopan Plus"
    ];

    const BABY_PAMPERS = [
        { brand: "Pampers Baby-Dry", sizes: ["Newborn", "Size 1 (Small)", "Size 2 (Medium)", "Size 3 (Large)", "Size 4 (XL)", "Size 5 (XXL)", "Pants Size 4", "Pants Size 5"], packCount: 48, buy: 1850, sell: 2200 },
        { brand: "Pampers Premium Protection", sizes: ["Size 1", "Size 2", "Size 3", "Size 4", "Size 5"], packCount: 52, buy: 2300, sell: 2750 },
        { brand: "Canbebe Baby Diapers", sizes: ["Size 2 Mini", "Size 3 Midi", "Size 4 Maxi", "Size 5 Junior"], packCount: 40, buy: 1400, sell: 1700 },
        { brand: "Molfix Comfort Diapers", sizes: ["Size 1 Newborn", "Size 2 Mini", "Size 3 Midi", "Size 4 Maxi", "Size 5 Mega"], packCount: 44, buy: 1600, sell: 1950 },
        { brand: "Huggies Wonder Pants", sizes: ["Small", "Medium", "Large", "XL", "XXL"], packCount: 36, buy: 1550, sell: 1880 },
        { brand: "Baby Charm Diapers", sizes: ["Size 2", "Size 3", "Size 4", "Size 5"], packCount: 32, buy: 1100, sell: 1350 },
        { brand: "Pampers Wipes Sensitive 56s", sizes: ["Single Pack", "Mega 3-Pack"], packCount: 1, buy: 450, sell: 580 },
        { brand: "Johnson Baby Powder 200g", sizes: ["Blossoms", "Bedtime", "Classic"], packCount: 1, buy: 380, sell: 490 },
        { brand: "Johnson Baby Shampoo 300ml", sizes: ["No More Tears Gold", "Chamomile"], packCount: 1, buy: 520, sell: 650 },
        { brand: "Johnson Baby Lotion 200ml", sizes: ["Pink", "Bedtime Violet"], packCount: 1, buy: 480, sell: 620 },
        { brand: "SebaMed Baby Cream Extra Soft 200ml", sizes: ["Standard"], packCount: 1, buy: 1200, sell: 1550 },
        { brand: "Sudocrem Antiseptic Nappy Rash Cream", sizes: ["60g", "125g", "250g"], packCount: 1, buy: 750, sell: 950 }
    ];

    const COSMETICS_CREAMS_OILS = [
        { name: "Himalaya Purifying Neem Face Wash", sizes: ["50ml", "100ml", "150ml", "200ml"], unit: "Tube", buy: 220, sell: 290 },
        { name: "Clean & Clear Foaming Face Wash", sizes: ["100ml", "150ml"], unit: "Bottle", buy: 280, sell: 370 },
        { name: "Pond's White Beauty Face Wash", sizes: ["50g", "100g"], unit: "Tube", buy: 240, sell: 320 },
        { name: "Garnier Bright Complete Face Wash", sizes: ["50ml", "100ml"], unit: "Tube", buy: 260, sell: 350 },
        { name: "Fair & Lovely / Glow & Lovely Advanced Face Cream", sizes: ["25g", "50g", "80g"], unit: "Tube", buy: 150, sell: 210 },
        { name: "Pond's Age Miracle Day Cream", sizes: ["50g"], unit: "Jar", buy: 1400, sell: 1750 },
        { name: "Nivea Soft Moisturizing Cream", sizes: ["50ml", "100ml", "200ml"], unit: "Jar", buy: 350, sell: 480 },
        { name: "Nivea Men Dark Spot Reduction Face Wash", sizes: ["100ml"], unit: "Tube", buy: 420, sell: 550 },
        { name: "Parachute 100% Pure Coconut Hair Oil", sizes: ["100ml", "200ml", "300ml", "500ml"], unit: "Bottle", buy: 290, sell: 390 },
        { name: "Dabur Amla Hair Oil", sizes: ["100ml", "200ml", "300ml"], unit: "Bottle", buy: 240, sell: 330 },
        { name: "Saeed Ghani Pure Almond Oil", sizes: ["60ml", "120ml"], unit: "Bottle", buy: 310, sell: 420 },
        { name: "Hemani Castor Hair & Skin Oil", sizes: ["30ml", "60ml"], unit: "Bottle", buy: 220, sell: 300 },
        { name: "CeraVe Moisturizing Lotion", sizes: ["236ml", "473ml"], unit: "Bottle", buy: 2400, sell: 2950 },
        { name: "The Ordinary Niacinamide 10% + Zinc 1%", sizes: ["30ml"], unit: "Bottle", buy: 1800, sell: 2250 },
        { name: "Neutrogena Hydro Boost Water Gel", sizes: ["50g"], unit: "Jar", buy: 1950, sell: 2450 },
        { name: "Spectraban 60 Sunblock Lotion", sizes: ["100ml"], unit: "Tube", buy: 850, sell: 1100 },
        { name: "U-Veil Forte Sunblock Cream SPF60", sizes: ["30g"], unit: "Tube", buy: 340, sell: 460 },
        { name: "Vaseline Petroleum Jelly Original", sizes: ["50ml", "100ml", "250ml"], unit: "Jar", buy: 120, sell: 170 },
        { name: "Vaseline Healthy White Body Lotion", sizes: ["100ml", "200ml", "400ml"], unit: "Bottle", buy: 450, sell: 600 }
    ];

    const SOAPS_HYGIENE = [
        { name: "Dettol Original Soap", variants: ["75g", "125g", "Pack of 3"], unit: "Bar", buy: 95, sell: 130 },
        { name: "Dettol Skincare Soap", variants: ["75g", "125g"], unit: "Bar", buy: 98, sell: 135 },
        { name: "Dettol Cool Soap with Crispy Menthol", variants: ["125g"], unit: "Bar", buy: 100, sell: 140 },
        { name: "Safeguard Pure White Antibacterial Soap", variants: ["115g", "Pack of 3"], unit: "Bar", buy: 90, sell: 125 },
        { name: "Safeguard Lemon Fresh Soap", variants: ["115g"], unit: "Bar", buy: 90, sell: 125 },
        { name: "Lifebuoy Total 10 Germ Protection Soap", variants: ["115g"], unit: "Bar", buy: 85, sell: 115 },
        { name: "Dove Beauty Cream White Bar", variants: ["100g", "135g"], unit: "Bar", buy: 180, sell: 250 },
        { name: "Lux Velvet Touch Jasmine Soap", variants: ["115g", "140g"], unit: "Bar", buy: 92, sell: 125 },
        { name: "Palmolive Naturals Aroma Soap", variants: ["125g"], unit: "Bar", buy: 110, sell: 150 },
        { name: "Dettol Antiseptic Liquid Disinfectant", variants: ["100ml", "250ml", "500ml", "1 Liter"], unit: "Bottle", buy: 280, sell: 380 },
        { name: "Lifebuoy Hand Sanitizer Total 10", variants: ["50ml", "100ml", "500ml Pump"], unit: "Bottle", buy: 120, sell: 170 },
        { name: "Head & Shoulders Anti-Dandruff Shampoo", variants: ["180ml", "360ml", "650ml"], unit: "Bottle", buy: 420, sell: 550 },
        { name: "Sunsilk Black Shine Shampoo", variants: ["180ml", "360ml"], unit: "Bottle", buy: 340, sell: 450 },
        { name: "Pantene Pro-V Milky Damage Repair Shampoo", variants: ["180ml", "360ml"], unit: "Bottle", buy: 380, sell: 490 }
    ];

    const SYRUPS_LIQUIDS = [
        { name: "Brufen Pediatric Suspension 120ml", buy: 85, sell: 115 },
        { name: "Calpol Paracetamol Syrup 60ml", buy: 65, sell: 90 },
        { name: "Panadol Baby Drops 15ml", buy: 70, sell: 95 },
        { name: "Augmentin DS Suspension 156.25mg/5ml", buy: 240, sell: 310 },
        { name: "Amoxil Forte Syrup 250mg/5ml", buy: 160, sell: 210 },
        { name: "Flagyl Oral Suspension 200mg/5ml", buy: 90, sell: 120 },
        { name: "Sancos Cough Syrup 120ml", buy: 110, sell: 145 },
        { name: "Hydryllin DM Expectorant Syrup 120ml", buy: 125, sell: 165 },
        { name: "Corex-D Cough Syrup 120ml", buy: 95, sell: 130 },
        { name: "Pulmonol Cough Syrup 120ml", buy: 135, sell: 180 },
        { name: "Gaviscon Double Action Liquid Suspension 120ml", buy: 210, sell: 280 },
        { name: "Mucaine Oral Gel Antacid 120ml", buy: 150, sell: 195 },
        { name: "Entamizole Plus Suspension 90ml", buy: 120, sell: 160 },
        { name: "Gravinate Liquid Syrup 60ml", buy: 75, sell: 105 },
        { name: "Rigix Pediatric Drops / Syrup 60ml", buy: 130, sell: 175 },
        { name: "Softin Oral Syrup 60ml", buy: 140, sell: 190 },
        { name: "C-Mune Vitamin C Zinc Syrup 120ml", buy: 180, sell: 240 },
        { name: "Vidlin Vitamin D3 Drops 10ml", buy: 220, sell: 300 }
    ];

    const SURGICAL_DEVICES = [
        { name: "BD Disposable Syringes 3ml / 5ml (Box of 100)", unit: "Box", buy: 850, sell: 1150 },
        { name: "BD Disposable Syringes 10ml (Box of 50)", unit: "Box", buy: 650, sell: 880 },
        { name: "BD Insulin Syringes 1ml 31G (Pack of 10)", unit: "Pack", buy: 220, sell: 300 },
        { name: "IV Cannula 20G / 22G / 24G with Injection Port", unit: "Piece", buy: 45, sell: 70 },
        { name: "Sterile Gauze Swabs 4x4 (Pack of 100)", unit: "Pack", buy: 320, sell: 440 },
        { name: "Crepe Cotton Elastic Bandage 4 inch", unit: "Roll", buy: 85, sell: 130 },
        { name: "Crepe Cotton Elastic Bandage 6 inch", unit: "Roll", buy: 120, sell: 175 },
        { name: "Hansaplast Medicated Adhesive Bandages (Box of 100)", unit: "Box", buy: 250, sell: 350 },
        { name: "Saniplast First Aid Strips (Box of 100)", unit: "Box", buy: 180, sell: 260 },
        { name: "Accu-Chek Instant Blood Glucose Test Strips 50s", unit: "Box", buy: 1950, sell: 2400 },
        { name: "Omron M2 Digital Blood Pressure Monitor", unit: "Piece", buy: 6200, sell: 7500 },
        { name: "Beurer Digital Clinical Thermometer FT-09", unit: "Piece", buy: 650, sell: 890 }
    ];

    const GENERAL_FMCG = [
        { name: "Nestle Cerelac Wheat & 3 Fruits 400g Tin", unit: "Tin", buy: 720, sell: 880 },
        { name: "Nestle Cerelac Rice 175g Box", unit: "Box", buy: 340, sell: 420 },
        { name: "Nestle Nido 1+ Growing Up Milk Powder 900g", unit: "Tin", buy: 1950, sell: 2350 },
        { name: "Meiji FM-T Infant Formula Milk 400g", unit: "Tin", buy: 1650, sell: 1980 },
        { name: "Ensure Complete Balanced Nutrition Vanilla 400g", unit: "Tin", buy: 2100, sell: 2600 },
        { name: "Glucodin Energy Powder Fast Action 450g", unit: "Pack", buy: 320, sell: 420 },
        { name: "Tang Instant Drink Powder Orange 750g Pouch", unit: "Pouch", buy: 550, sell: 700 },
        { name: "Horlicks Health Nutrition Drink 500g", unit: "Jar", buy: 820, sell: 1050 }
    ];

    /**
     * Generate 10,000 distinct items with realistic distributions
     */
    function generate10000Items() {
        const products = [];
        let idCounter = Date.now();

        // Helper random date generator (2025 to 2029, with ~5% expired and ~10% near expiry for realistic alerts)
        function generateRandomExpiry() {
            const roll = Math.random();
            const now = new Date();
            let targetDate = new Date();

            if (roll < 0.04) {
                // Expired: 10 to 180 days in past
                targetDate.setDate(now.getDate() - Math.floor(Math.random() * 180 + 10));
            } else if (roll < 0.12) {
                // Near expiry: 10 to 80 days in future
                targetDate.setDate(now.getDate() + Math.floor(Math.random() * 70 + 10));
            } else {
                // Valid: 4 months to 3 years in future
                targetDate.setDate(now.getDate() + Math.floor(Math.random() * 1000 + 120));
            }

            const yyyy = targetDate.getFullYear();
            const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
            const dd = String(targetDate.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        }

        function generateRandomBatch() {
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const prefix = letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)];
            const num = Math.floor(1000 + Math.random() * 9000);
            return `${prefix}-${num}`;
        }

        const RACKS = [
            "Shelf A-1", "Shelf A-2", "Shelf A-3", "Shelf B-1", "Shelf B-2",
            "Shelf C-1", "Shelf C-2", "Baby Section", "Cosmetics Display 1", "Cosmetics Display 2",
            "Soap Rack Left", "Syrup Cabinet 1", "Syrup Cabinet 2", "Surgical Tray 1", "Counter Display"
        ];

        console.log("Generating 10,000 items...");

        for (let i = 1; i <= 10000; i++) {
            const categoryRoll = i % 7; // 0=medicine, 1=baby, 2=cosmetics, 3=soaps, 4=syrup, 5=surgical, 6=general
            const batch = generateRandomBatch();
            const expiry = generateRandomExpiry();
            const rack = RACKS[Math.floor(Math.random() * RACKS.length)];

            if (categoryRoll === 0 || categoryRoll === 4) {
                // MEDICINES (Fractional Tablets / Capsules)
                const baseMed = MEDICINE_NAMES[i % MEDICINE_NAMES.length];
                const variantNum = Math.floor(i / MEDICINE_NAMES.length) + 1;
                const name = variantNum === 1 ? baseMed : `${baseMed} (Batch #${variantNum})`;

                const stripsPerBox = Math.random() > 0.3 ? 10 : 20;
                const tabletsPerStrip = Math.random() > 0.4 ? 10 : 14;
                const tabsPerBox = stripsPerBox * tabletsPerStrip;

                // Random stock between 2 and 40 boxes worth of tablets
                const totalBoxes = Math.floor(Math.random() * 35 + 3);
                const totalTablets = totalBoxes * tabsPerBox;

                const buyPriceBox = Math.floor(Math.random() * 900 + 80);
                const sellPriceBox = Math.round(buyPriceBox * (1.18 + Math.random() * 0.15));

                products.push({
                    id: idCounter + i,
                    category: "medicine",
                    productType: "fractional_medicine",
                    name,
                    batch,
                    expiry,
                    location: rack,
                    stripsPerBox,
                    tabletsPerStrip,
                    totalTablets,
                    buyPriceBox,
                    sellPriceBox
                });
            } else if (categoryRoll === 1) {
                // BABY CARE & PAMPERS
                const item = BABY_PAMPERS[i % BABY_PAMPERS.length];
                const size = item.sizes[Math.floor(Math.random() * item.sizes.length)];
                const variantNum = Math.floor(i / BABY_PAMPERS.length) + 1;
                const name = `${item.brand} - ${size} ${variantNum > 1 ? `(#${variantNum})` : ''}`;

                const packContains = item.packCount;
                const packs = Math.floor(Math.random() * 25 + 2);
                const totalUnits = packs * packContains;

                const buyPrice = Math.round(item.buy * (0.95 + Math.random() * 0.1));
                const sellPrice = Math.round(item.sell * (0.95 + Math.random() * 0.1));

                products.push({
                    id: idCounter + i,
                    category: "baby",
                    productType: "standard_unit",
                    name,
                    batch,
                    expiry,
                    location: "Baby Section",
                    unitName: packContains > 1 ? "Diaper" : "Piece",
                    packName: "Pack",
                    packContains,
                    totalUnits,
                    totalTablets: totalUnits,
                    buyPriceBox: buyPrice,
                    sellPriceBox: sellPrice
                });
            } else if (categoryRoll === 2) {
                // COSMETICS, CREAMS, FACE WASH, HAIR OILS
                const item = COSMETICS_CREAMS_OILS[i % COSMETICS_CREAMS_OILS.length];
                const size = item.sizes[Math.floor(Math.random() * item.sizes.length)];
                const variantNum = Math.floor(i / COSMETICS_CREAMS_OILS.length) + 1;
                const name = `${item.name} (${size}) ${variantNum > 1 ? `(#${variantNum})` : ''}`;

                const units = Math.floor(Math.random() * 45 + 5);
                const buyPrice = Math.round(item.buy * (0.95 + Math.random() * 0.1));
                const sellPrice = Math.round(item.sell * (0.95 + Math.random() * 0.1));

                products.push({
                    id: idCounter + i,
                    category: "cosmetics",
                    productType: "standard_unit",
                    name,
                    batch,
                    expiry,
                    location: "Cosmetics Rack",
                    unitName: item.unit,
                    packName: "Pack",
                    packContains: 1,
                    totalUnits: units,
                    totalTablets: units,
                    buyPriceBox: buyPrice,
                    sellPriceBox: sellPrice
                });
            } else if (categoryRoll === 3) {
                // SOAPS & PERSONAL HYGIENE
                const item = SOAPS_HYGIENE[i % SOAPS_HYGIENE.length];
                const variant = item.variants[Math.floor(Math.random() * item.variants.length)];
                const variantNum = Math.floor(i / SOAPS_HYGIENE.length) + 1;
                const name = `${item.name} - ${variant} ${variantNum > 1 ? `(#${variantNum})` : ''}`;

                const units = Math.floor(Math.random() * 80 + 10);
                const buyPrice = Math.round(item.buy * (0.95 + Math.random() * 0.1));
                const sellPrice = Math.round(item.sell * (0.95 + Math.random() * 0.1));

                products.push({
                    id: idCounter + i,
                    category: "soaps",
                    productType: "standard_unit",
                    name,
                    batch,
                    expiry,
                    location: "Soap Rack Left",
                    unitName: item.unit,
                    packName: "Pack",
                    packContains: 1,
                    totalUnits: units,
                    totalTablets: units,
                    buyPriceBox: buyPrice,
                    sellPriceBox: sellPrice
                });
            } else if (categoryRoll === 5) {
                // SURGICAL & MEDICAL DEVICES
                const item = SURGICAL_DEVICES[i % SURGICAL_DEVICES.length];
                const variantNum = Math.floor(i / SURGICAL_DEVICES.length) + 1;
                const name = `${item.name} ${variantNum > 1 ? `(#${variantNum})` : ''}`;

                const units = Math.floor(Math.random() * 30 + 5);
                const buyPrice = Math.round(item.buy * (0.95 + Math.random() * 0.1));
                const sellPrice = Math.round(item.sell * (0.95 + Math.random() * 0.1));

                products.push({
                    id: idCounter + i,
                    category: "surgical",
                    productType: "standard_unit",
                    name,
                    batch,
                    expiry,
                    location: "Surgical Tray",
                    unitName: item.unit,
                    packName: "Box",
                    packContains: 1,
                    totalUnits: units,
                    totalTablets: units,
                    buyPriceBox: buyPrice,
                    sellPriceBox: sellPrice
                });
            } else {
                // GENERAL FMCG & NUTRITION
                const item = GENERAL_FMCG[i % GENERAL_FMCG.length];
                const variantNum = Math.floor(i / GENERAL_FMCG.length) + 1;
                const name = `${item.name} ${variantNum > 1 ? `(#${variantNum})` : ''}`;

                const units = Math.floor(Math.random() * 40 + 6);
                const buyPrice = Math.round(item.buy * (0.95 + Math.random() * 0.1));
                const sellPrice = Math.round(item.sell * (0.95 + Math.random() * 0.1));

                products.push({
                    id: idCounter + i,
                    category: "general",
                    productType: "standard_unit",
                    name,
                    batch,
                    expiry,
                    location: "General Rack",
                    unitName: item.unit,
                    packName: "Pack",
                    packContains: 1,
                    totalUnits: units,
                    totalTablets: units,
                    buyPriceBox: buyPrice,
                    sellPriceBox: sellPrice
                });
            }
        }

        console.log(`Generated ${products.length} products successfully!`);
        return products;
    }

    return {
        generate10000Items
    };
})();
