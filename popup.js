const input = document.getElementById("phraseInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("phraseList");

function renderList(phrases) {
    list.innerHTML = "";

    if (phrases.length === 0) {
        list.innerHTML = '<div class="empty">No custom phrases yet.</div>';
        return;
    }

    phrases.forEach((phrase, index) => {
        const item = document.createElement("div");
        item.className = "phrase-item";
        item.innerHTML = `
            <span>${phrase}</span>
            <button class="delete-btn" data-index="${index}" title="Remove">✕</button>
        `;
        list.appendChild(item);
    });

    list.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const i = parseInt(btn.dataset.index);  
            console.log(i);
            chrome.storage.local.get("customPhrases", ({ customPhrases = [] }) => {
                customPhrases.splice(i, 1);
                chrome.storage.local.set({ customPhrases });
            });
        });
    });
}

function loadAndRender() {
    chrome.storage.local.get("customPhrases", ({ customPhrases = [] }) => {
        renderList(customPhrases);
    });
}

function addPhrase() {
    const phrase = input.value.trim().toLowerCase();
    if (!phrase) return;

    chrome.storage.local.get("customPhrases", ({ customPhrases = [] }) => {
        if (!customPhrases.includes(phrase)) {
            customPhrases.push(phrase);
            chrome.storage.local.set({ customPhrases });
        }
        input.value = "";
    });
}

addBtn.addEventListener("click", addPhrase);
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addPhrase();
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.customPhrases) {
        renderList(changes.customPhrases.newValue || []);
    }
});

loadAndRender();
