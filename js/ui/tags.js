import { recipes } from "../data/recipes.js";
import { displayRecipes } from "../main.js";
import { renderTagsUI } from "../templates/tagsTemplate.js";
import { getAllTagOptions, filterDropdownOptions, filterByTags } from "../filters/filter.js";

const tagsState = {
    ingredients: new Set(),
    appliances: new Set(),
    ustensils: new Set(),
};

let allOptions = null;

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function updateCount(n) {
    const el = document.getElementById("recipes-count");
    if (el) el.textContent = String(n);
}

function renderDropdownList(dropdownEl, type, query = "") {
    const listEl = dropdownEl.querySelector(".dropdown-list");
    if (!listEl) return;

    const base = allOptions[type];
    const filtered = filterDropdownOptions(base, query);

    // selected en haut
    const selected = [...tagsState[type]];
    const selectedInFiltered = selected.filter((v) =>
        filtered.some((x) => x === v)
    );
    const rest = filtered.filter((v) => !tagsState[type].has(v));
    const ordered = [...selectedInFiltered, ...rest];

    listEl.innerHTML = ordered
        .map((value) => {
            const isSel = tagsState[type].has(value);
            return `
        <li class="dropdown-item ${isSel ? "is-selected" : ""}">
          <button type="button" class="dropdown-item-btn" data-value="${escapeHtml(value)}">
            ${escapeHtml(value)}
          </button>
        </li>
      `;
        })
        .join("");
}

function renderSelectedTags() {
    const container = document.getElementById("filter-tags");
    if (!container) return;

    ["ingredients", "appliances", "ustensils"].forEach((type) => {
        const group = container.querySelector(`.tags-group[data-type="${type}"]`);
        if (!group) return;

        group.innerHTML = [...tagsState[type]]
            .map(
                (tag) => `
        <button type="button" class="tag-chip" data-type="${type}" data-value="${escapeHtml(tag)}">
          <span class="tag-label">${escapeHtml(tag)}</span>
          <span class="tag-remove" aria-hidden="true">✕</span>
        </button>
      `
            )
            .join("");
    });
}

function applyTagsFilterToRecipes() {
    const filtered = filterByTags(recipes, tagsState);
    displayRecipes(filtered);
    updateCount(filtered.length);
}

function closeDropdown(dd) {
    const btn = dd.querySelector(".dropdown-toggle");
    const panel = dd.querySelector(".dropdown-panel");
    if (!btn || !panel) return;

    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    dd.classList.remove("is-open");

    const input = dd.querySelector(".dropdown-input");
    if (input) input.value = "";
}

function openDropdown(dd) {
    const btn = dd.querySelector(".dropdown-toggle");
    const panel = dd.querySelector(".dropdown-panel");
    if (!btn || !panel) return;

    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    dd.classList.add("is-open");

    const input = dd.querySelector(".dropdown-input");
    if (input) input.focus();
}

function closeAll(container) {
    container.querySelectorAll(".dropdown").forEach(closeDropdown);
}

(function initTags() {
    const container = document.getElementById("filter-tags");
    if (!container) return;

    // 1) render structure
    renderTagsUI();

    // 2) build options once
    allOptions = getAllTagOptions(recipes);

    // init count = toutes les recettes
    updateCount(recipes.length);

    // init lists
    container.querySelectorAll(".dropdown").forEach((dd) => {
        const type = dd.dataset.type;
        renderDropdownList(dd, type, "");
    });

    // EVENTS

    // click (open/close, pick option, remove chip)
    container.addEventListener("click", (e) => {
        const toggle = e.target.closest(".dropdown-toggle");
        if (toggle) {
            const dd = toggle.closest(".dropdown");
            container.querySelectorAll(".dropdown").forEach((other) => {
                if (other !== dd) closeDropdown(other);
            });

            dd.classList.contains("is-open") ? closeDropdown(dd) : openDropdown(dd);
            return;
        }

        const closeBtn = e.target.closest(".dropdown-close");
        if (closeBtn) {
            const dd = closeBtn.closest(".dropdown");
            if (dd) closeDropdown(dd);
            return;
        }

        const itemBtn = e.target.closest(".dropdown-item-btn");
        if (itemBtn) {
            const dd = itemBtn.closest(".dropdown");
            const type = dd.dataset.type;
            const value = itemBtn.dataset.value;

            // toggle tag
            if (tagsState[type].has(value)) tagsState[type].delete(value);
            else tagsState[type].add(value);

            // UI updates
            const input = dd.querySelector(".dropdown-input");
            renderDropdownList(dd, type, input?.value || "");
            renderSelectedTags();

            // SEUL moment où on filtre les recettes (choix utilisateur)
            applyTagsFilterToRecipes();
            return;
        }

        const chip = e.target.closest(".tag-chip");
        if (chip) {
            const type = chip.dataset.type;
            const value = chip.dataset.value;

            tagsState[type].delete(value);

            renderSelectedTags();

            const dd = container.querySelector(`.dropdown[data-type="${type}"]`);
            if (dd) {
                const input = dd.querySelector(".dropdown-input");
                renderDropdownList(dd, type, input?.value || "");
            }

            applyTagsFilterToRecipes();
            return;
        }
    });

    // input inside dropdown => filtre UNIQUEMENT la liste visible
    container.addEventListener("input", (e) => {
        const input = e.target.closest(".dropdown-input");
        if (!input) return;

        const dd = input.closest(".dropdown");
        const type = dd.dataset.type;

        renderDropdownList(dd, type, input.value);
    });

    // click outside => close
    document.addEventListener("click", (e) => {
        const root = document.getElementById("filter-tags");
        if (root && !root.contains(e.target)) closeAll(root);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAll(document.getElementById("filter-tags"));
    });
})();