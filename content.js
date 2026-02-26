const audio = new Audio(chrome.runtime.getURL("audio.mp3"));

const DEFAULT_PHRASES = ["you are absolutely right"];
let activePhrases = [...DEFAULT_PHRASES];

function attachPhraseDetector(messageEl) {
    const phraseObserver = new MutationObserver(() => {
        const text = messageEl.innerText || messageEl.textContent || "";
        if (activePhrases.some(phrase => text.toLowerCase().includes(phrase))) {
            audio.play();
            phraseObserver.disconnect();
        }
    });

    phraseObserver.observe(messageEl, {
        childList: true,
        subtree: true,
        characterData: true,
    });

    setTimeout(() => {
        phraseObserver.disconnect();
    }, 60000);
}

function observeNewMessages() {
    const chatContainer = document.querySelector("main");

    const messageObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) continue;
                const el = node.matches('[data-message-author-role="assistant"]') ? node : null;
                if (el) attachPhraseDetector(el);
            }
        }
    });

    messageObserver.observe(chatContainer, { childList: true, subtree: true });
}

chrome.storage.local.get("customPhrases", ({ customPhrases = [] }) => {
    activePhrases = [...DEFAULT_PHRASES, ...customPhrases];
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.customPhrases) {
        activePhrases = [...DEFAULT_PHRASES, ...(changes.customPhrases.newValue || [])];
    }
});

observeNewMessages();
