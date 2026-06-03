import "../src/content.css";

interface TranslationPayload {
  original: string;
  translated: string;
  targetLanguage: string;
  cached: boolean;
  mock: boolean;
  error: string | null;
}

let popupEl: HTMLDivElement | null = null;

function truncate(text: string, max = 280): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

function removePopup(): void {
  popupEl?.remove();
  popupEl = null;
}

function showPopup(payload: TranslationPayload): void {
  removePopup();

  const el = document.createElement("div");
  el.id = "context-translate-popup";
  el.className = "ct-popup";

  const langLabel = payload.targetLanguage
    ? payload.targetLanguage.toUpperCase()
    : "";

  if (payload.error) {
    el.innerHTML = `
      <div class="ct-header">
        <span class="ct-title">Context Translate</span>
        <button class="ct-close" aria-label="Close">×</button>
      </div>
      <p class="ct-error">${escapeHtml(payload.error)}</p>
      <p class="ct-original">${escapeHtml(truncate(payload.original))}</p>
    `;
  } else {
    el.innerHTML = `
      <div class="ct-header">
        <span class="ct-title">Context Translate</span>
        <span class="ct-chip">${escapeHtml(langLabel)}${payload.mock ? " · demo" : ""}${payload.cached ? " · cached" : ""}</span>
        <button class="ct-close" aria-label="Close">×</button>
      </div>
      <p class="ct-translated">${escapeHtml(payload.translated)}</p>
      <p class="ct-original">${escapeHtml(truncate(payload.original))}</p>
      <button class="ct-copy">Copy translation</button>
    `;
  }

  document.body.appendChild(el);
  popupEl = el;

  el.querySelector(".ct-close")?.addEventListener("click", removePopup);

  const copyBtn = el.querySelector(".ct-copy");
  copyBtn?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(payload.translated);
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = "Copy translation";
    }, 1500);
  });

  const onDocClick = (e: MouseEvent) => {
    if (!el.contains(e.target as Node)) {
      removePopup();
      document.removeEventListener("mousedown", onDocClick);
    }
  };
  setTimeout(() => document.addEventListener("mousedown", onDocClick), 0);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default defineContentScript({
  matches: ["<all_urls>", "file:///*"],
  runAt: "document_idle",
  main() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message?.type === "SHOW_TRANSLATION") {
        showPopup(message.payload as TranslationPayload);
      }
    });
  },
});
