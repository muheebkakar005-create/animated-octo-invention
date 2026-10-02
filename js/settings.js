/**
 * AHSAN PHARMACY POS - SETTINGS & SECURITY MODULE
 * Manages store profile, security lock, and offline backup/reset.
 */

const SettingsManager = (function () {

    function populateForm(settings) {
        document.getElementById('settingPharmName').value = settings.pharmName || "";
        document.getElementById('settingPharmAddress').value = settings.pharmAddress || "";
        document.getElementById('settingPharmPhone').value = settings.pharmPhone || "";
        document.getElementById('settingPharmNotice').value = settings.pharmNotice || "";
        document.getElementById('settingMasterPin').value = settings.masterPin || "1234";
    }

    function readForm() {
        return {
            pharmName: document.getElementById('settingPharmName').value.trim() || "AHSAN PHARMACY",
            pharmAddress: document.getElementById('settingPharmAddress').value.trim() || "",
            pharmPhone: document.getElementById('settingPharmPhone').value.trim() || "",
            pharmNotice: document.getElementById('settingPharmNotice').value.trim() || "",
            masterPin: document.getElementById('settingMasterPin').value.trim() || "1234"
        };
    }

    function openLock() {
        const pinInput = document.getElementById('unlockPinInput');
        if (pinInput) pinInput.value = '';
        const modal = document.getElementById('lockModal');
        if (modal) modal.classList.add('active');
    }

    function unlock(masterPin) {
        const entered = document.getElementById('unlockPinInput').value;
        if (entered === masterPin) {
            const modal = document.getElementById('lockModal');
            if (modal) modal.classList.remove('active');
            return true;
        } else {
            alert('❌ Incorrect Master PIN!');
            return false;
        }
    }

    return {
        populateForm,
        readForm,
        openLock,
        unlock
    };
})();
