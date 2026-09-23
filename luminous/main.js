// Progressive enhancement for the Luminous landing page. The English page is
// complete without this script; it adds the EN/FR switch and the theme slideshow.

import fr from "./i18n/fr.js";

const STORAGE_KEY = "luminous-lang";
const THEME_CYCLE_INTERVAL_MS = 2600;

// English lives in the markup, so it is the fallback for any missing key.
const TRANSLATIONS = { fr };
const SUPPORTED_LANGS = ["en", ...Object.keys(TRANSLATIONS)];

/**
 * Translatable elements are marked up as:
 *   data-i18n="key"                       replaces textContent
 *   data-i18n="key" data-i18n-attr="alt"  replaces the named attribute instead
 *   data-i18n-html="key"                  replaces innerHTML (trusted, author-written strings only)
 *   data-localized-src                    swaps the "-EN." suffix in src for the active language
 *
 * The English originals are read from the DOM once so switching back needs no
 * separate English dictionary.
 */
function createTranslator(root) {
  const entries = [...root.querySelectorAll("[data-i18n], [data-i18n-html], [data-localized-src]")].map((el) => {
    const attr = el.dataset.i18nAttr;
    return {
      el,
      attr,
      key: el.dataset.i18n,
      htmlKey: el.dataset.i18nHtml,
      text: attr ? el.getAttribute(attr) : el.textContent,
      html: el.innerHTML,
      src: el.hasAttribute("data-localized-src") ? el.getAttribute("src") : null,
    };
  });

  return function apply(lang) {
    const strings = TRANSLATIONS[lang] ?? {};
    const lookup = (key, fallback) => {
      if (lang !== "en" && !(key in strings)) console.warn(`Missing "${lang}" translation for "${key}"`);
      return strings[key] ?? fallback;
    };

    for (const { el, attr, key, htmlKey, text, html, src } of entries) {
      if (key) {
        const value = lookup(key, text);
        if (attr) el.setAttribute(attr, value);
        else el.textContent = value;
      }
      if (htmlKey) el.innerHTML = lookup(htmlKey, html);
      if (src) el.setAttribute("src", src.replace("-EN.", `-${lang.toUpperCase()}.`));
    }
    root.documentElement.lang = lang;
  };
}

// Storage can be unavailable (private mode, blocked site data); the choice then
// just isn't remembered.
function readSavedLang() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveLang(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Not persisting is harmless.
  }
}

function initialLang() {
  const saved = readSavedLang();
  if (SUPPORTED_LANGS.includes(saved)) return saved;
  const browser = (navigator.languages ?? [navigator.language])
    .map((tag) => tag.slice(0, 2).toLowerCase())
    .find((code) => SUPPORTED_LANGS.includes(code));
  return browser ?? "en";
}

function initLanguageSwitch() {
  const applyLang = createTranslator(document);
  const switcher = document.querySelector(".lang-switch");
  const buttons = [...switcher.querySelectorAll("[data-lang]")];

  const setLang = (lang) => {
    applyLang(lang);
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
    }
  };

  switcher.addEventListener("click", (event) => {
    const button = event.target.closest("[data-lang]");
    if (!button) return;
    saveLang(button.dataset.lang);
    setLang(button.dataset.lang);
  });

  const lang = initialLang();
  if (lang !== "en") setLang(lang);
  switcher.hidden = false;
}

// Cross-fades the stacked frames. Skipped for reduced-motion users, and paused
// while the slideshow is off screen or the tab is hidden.
function initThemeCycle(container) {
  const frames = container.querySelectorAll(".theme-cycle__frame");
  if (frames.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let index = 0;
  let timer = null;

  const advance = () => {
    frames[index].classList.remove("is-active");
    index = (index + 1) % frames.length;
    frames[index].classList.add("is-active");
  };
  const start = () => {
    timer ??= setInterval(advance, THEME_CYCLE_INTERVAL_MS);
  };
  const stop = () => {
    clearInterval(timer);
    timer = null;
  };

  let onScreen = false;
  const update = () => (onScreen && !document.hidden ? start() : stop());

  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    update();
  }).observe(container);
  document.addEventListener("visibilitychange", update);
}

initLanguageSwitch();
document.querySelectorAll("[data-theme-cycle]").forEach(initThemeCycle);
