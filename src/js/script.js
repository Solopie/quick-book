document.addEventListener("DOMContentLoaded", () => {
    const fieldIds = [
        "first_name", "last_name", "email", "password", "gender",
        "dob_day", "dob_month", "dob_year", "street", "suburb",
        "state", "postcode", "home_phone", "name_on_card",
        "credit_card_number", "expiry_month", "expiry_year", "cvv_number"
    ];

    const sensitiveFieldIds = [
        "password", "name_on_card", "credit_card_number", "expiry_month", "expiry_year", "cvv_number"
    ];

    chrome.storage.local.get("formData", (res) => {
        const data = res.formData || {};
        for (const id of fieldIds) {
            const el = document.getElementById(id);
            if (el && data[id] !== undefined) {
                el.value = data[id];
            }

            el?.addEventListener("input", () => autoSave(id));
            el?.addEventListener("change", () => autoSave(id));
        }
    });

    document.getElementById("prefill").addEventListener("click", async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["/js/jquery-3.7.1.min.js", "/js/fill.js"]
        });
    });

    document.getElementById("toggle_password").addEventListener("click", togglePassword);

    document.getElementById("clear-sensitive").addEventListener("click", () => {
        if (!confirm("Are you sure you want to clear sensitive data (credit card, CVV, etc.)?")) return;

        chrome.storage.local.get("formData", (res) => {
            const data = res.formData || {};
            for (const id of sensitiveFieldIds) {
                data[id] = "";
                const el = document.getElementById(id);
                if (el) el.value = "";
            }
            chrome.storage.local.set({ formData: data });
        });
    });

    document.getElementById("clear-all").addEventListener("click", () => {
        if (!confirm("Are you sure you want to clear ALL saved data?")) return;

        chrome.storage.local.remove("formData", () => {
            for (const id of fieldIds) {
                const el = document.getElementById(id);
                if (el) el.value = "";
            }
        });
    });
});

function autoSave(fieldId) {
    const value = document.getElementById(fieldId).value;
    chrome.storage.local.get("formData", (res) => {
        const formData = res.formData || {};
        formData[fieldId] = value;
        chrome.storage.local.set({ formData });
    });
}

function togglePassword() {
    var x = document.getElementById("password");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}