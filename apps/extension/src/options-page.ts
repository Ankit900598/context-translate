import { POPULAR_LANGUAGES } from "@context-translate/core";
import { getSettings, saveSettings } from "../utils/storage";

const translateModeSelect = document.getElementById(
  "translateMode",
) as HTMLSelectElement;
const googleApiKeyInput = document.getElementById(
  "googleApiKey",
) as HTMLInputElement;
const targetSelect = document.getElementById(
  "targetLanguage",
) as HTMLSelectElement;
const sourceSelect = document.getElementById(
  "sourceLanguage",
) as HTMLSelectElement;
const googleKeySection = document.getElementById(
  "googleKeySection",
) as HTMLDivElement;
const saveBtn = document.getElementById("save") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLParagraphElement;

function updateGoogleKeyVisibility(): void {
  googleKeySection.hidden = translateModeSelect.value !== "google";
}

function fillLanguageSelect(select: HTMLSelectElement): void {
  for (const lang of POPULAR_LANGUAGES) {
    const opt = document.createElement("option");
    opt.value = lang.code;
    opt.textContent = lang.label;
    select.appendChild(opt);
  }
}

async function init(): Promise<void> {
  fillLanguageSelect(targetSelect);
  fillLanguageSelect(sourceSelect);

  const settings = await getSettings();
  translateModeSelect.value = settings.translateMode;
  googleApiKeyInput.value = settings.googleApiKey;
  targetSelect.value = settings.targetLanguage;
  sourceSelect.value = settings.sourceLanguage;
  updateGoogleKeyVisibility();
}

translateModeSelect.addEventListener("change", updateGoogleKeyVisibility);

saveBtn.addEventListener("click", async () => {
  await saveSettings({
    translateMode: translateModeSelect.value as "mock" | "google",
    googleApiKey: googleApiKeyInput.value.trim(),
    targetLanguage: targetSelect.value,
    sourceLanguage: sourceSelect.value,
  });
  statusEl.hidden = false;
  setTimeout(() => {
    statusEl.hidden = true;
  }, 2000);
});

init();
