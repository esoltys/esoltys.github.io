// Progressive enhancement for the Luminous landing page. The English page is
// complete without this script; it adds the language menu and the theme slideshow.

import de from "./i18n/de.js";
import es from "./i18n/es.js";
import fr from "./i18n/fr.js";
import it from "./i18n/it.js";
import ru from "./i18n/ru.js";
import uk from "./i18n/uk.js";

const STORAGE_KEY = "luminous-lang";
const THEME_CYCLE_INTERVAL_MS = 2600;

// English lives in the markup, so it is the fallback for any missing key.
const TRANSLATIONS = { fr, de, es, it, ru, uk };
const SUPPORTED_LANGS = ["en", ...Object.keys(TRANSLATIONS)];

/**
 * Translatable elements are marked up as:
 *   data-i18n="key"                       replaces textContent
 *   data-i18n="key" data-i18n-attr="alt"  replaces the named attribute instead
 *   data-i18n-html="key"                  replaces innerHTML (trusted, author-written strings only)
 *   data-localized-src                    swaps the "-EN." suffix in src for the active language
 *                                         (e.g. home-EN.webp -> home-DE.webp)
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

// A menu button: the trigger shows the active code; the list holds one
// menuitemradio per language, navigable with the arrow keys.
function initLanguageSwitch() {
  const applyLang = createTranslator(document);
  const menu = document.querySelector(".lang-menu");
  const trigger = menu.querySelector(".lang-menu__button");
  const current = menu.querySelector(".lang-menu__current");
  const list = menu.querySelector(".lang-menu__list");
  const items = [...list.querySelectorAll("[data-lang]")];

  const setLang = (lang) => {
    applyLang(lang);
    current.textContent = lang.toUpperCase();
    for (const item of items) {
      item.setAttribute("aria-checked", String(item.dataset.lang === lang));
    }
  };

  const isOpen = () => !list.hidden;
  const open = (focusIndex) => {
    list.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    const checked = items.findIndex((item) => item.getAttribute("aria-checked") === "true");
    items[focusIndex ?? Math.max(checked, 0)].focus();
  };
  const close = ({ restoreFocus = false } = {}) => {
    if (!isOpen()) return;
    list.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) trigger.focus();
  };

  trigger.addEventListener("click", () => (isOpen() ? close() : open()));
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      open(event.key === "ArrowUp" ? items.length - 1 : undefined);
    }
  });

  list.addEventListener("click", (event) => {
    const item = event.target.closest("[data-lang]");
    if (!item) return;
    saveLang(item.dataset.lang);
    setLang(item.dataset.lang);
    close({ restoreFocus: true });
  });

  list.addEventListener("keydown", (event) => {
    const index = items.indexOf(document.activeElement);
    const focusAt = (i) => items[(i + items.length) % items.length].focus();
    switch (event.key) {
      case "ArrowDown": focusAt(index + 1); break;
      case "ArrowUp": focusAt(index - 1); break;
      case "Home": focusAt(0); break;
      case "End": focusAt(items.length - 1); break;
      case "Escape": close({ restoreFocus: true }); break;
      case "Tab": close(); return;
      default: return;
    }
    event.preventDefault();
  });

  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target)) close();
  });

  const lang = initialLang();
  if (lang !== "en") setLang(lang);
  menu.hidden = false;
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

// Without a saved choice the page follows the system theme; the toggle then
// pins the opposite one. Needs JavaScript, so the button starts hidden.
function initThemeToggle() {
  const THEME_KEY = "luminous-theme";
  const root = document.documentElement;
  const button = document.querySelector(".theme-toggle");
  const systemLight = matchMedia("(prefers-color-scheme: light)");

  const applied = () => root.dataset.theme ?? (systemLight.matches ? "light" : "dark");
  const sync = () => {
    root.dataset.themeApplied = applied();
    button.setAttribute("aria-pressed", String(applied() === "light"));
  };

  button.addEventListener("click", () => {
    const next = applied() === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Not persisting is harmless.
    }
    sync();
  });
  systemLight.addEventListener("change", sync);

  button.hidden = false;
  sync();
}

// A missing light screenshot just falls back to its dark twin.
document.querySelectorAll(".shot-light").forEach((img) => {
  img.addEventListener("error", () => img.remove());
});

initLanguageSwitch();
initThemeToggle();
document.querySelectorAll("[data-theme-cycle]").forEach(initThemeCycle);
