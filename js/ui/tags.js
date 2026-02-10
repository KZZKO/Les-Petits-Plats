import { recipes } from "../data/recipes.js";
import { renderTagsUI } from "../templates/tagsTemplate.js";
import { getAllTagOptions, filterDropdownOptions } from "../filters/filter.js";
import { notifyFiltersChanged } from "../filters/filtersController.js";

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

function renderDropdownList(dropdownEl, type, query = "") {
    const selectedEl = dropdownEl.querySelector(".dropdown-selected");
    const listEl = dropdownEl.querySelector(".dropdown-list");
    if (!selectedEl || !listEl) return;

    const base = allOptions[type];
    const filtered = filterDropdownOptions(base, query);

    // Selected (sticky)
    const selected = [...tagsState[type]];
    selectedEl.innerHTML = selected
        .map(
            (value) => `
        <li class="dropdown-item is-selected">
          <button type="button" class="dropdown-item-btn" data-value="${escapeHtml(value)}">
            ${escapeHtml(value)}
          </button>
        </li>
      `
        )
        .join("");

    // List scrollable (non selected only)
    const rest = filtered.filter((v) => !tagsState[type].has(v));
    listEl.innerHTML = rest
        .map(
            (value) => `
        <li class="dropdown-item">
          <button type="button" class="dropdown-item-btn" data-value="${escapeHtml(value)}">
            ${escapeHtml(value)}
          </button>
        </li>
      `
        )
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
          <button
            type="button"
            class="tag-chip"
            data-type="${type}"
            data-value="${escapeHtml(tag)}"
          >
            <span class="tag-label">${escapeHtml(tag)}</span>
            <span class="tag-remove" aria-hidden="true">✕</span>
          </button>
        `
            )
            .join("");
    });
}

function closeDropdown(dd) {
    const btn = dd.querySelector(".dropdown-toggle");
    const panel = dd.querySelector(".dropdown-panel");

    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    dd.classList.remove("is-open");

    const input = dd.querySelector(".dropdown-input");
    if (input) input.value = "";
}

function openDropdown(dd) {
    const btn = dd.querySelector(".dropdown-toggle");
    const panel = dd.querySelector(".dropdown-panel");

    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    dd.classList.add("is-open");

    const input = dd.querySelector(".dropdown-input");
    if (input) input.focus();
}

(function initTags() {
    const container = document.getElementById("filter-tags");
    if (!container) return;

    // Render structure
    renderTagsUI();

    // Build options once
    allOptions = getAllTagOptions(recipes);

    // Init lists
    container.querySelectorAll(".dropdown").forEach((dd) => {
        renderDropdownList(dd, dd.dataset.type);
    });

    // EVENTS

    container.addEventListener("click", (e) => {
        // Open/close dropdown
        const toggle = e.target.closest(".dropdown-toggle");
        if (toggle) {
            const dd = toggle.closest(".dropdown");
            container.querySelectorAll(".dropdown").forEach((d) => {
                if (d !== dd) closeDropdown(d);
            });
            dd.classList.contains("is-open") ? closeDropdown(dd) : openDropdown(dd);
            return;
        }

        // Click item in dropdown (selected or not)
        const itemBtn = e.target.closest(".dropdown-item-btn");
        if (itemBtn) {
            const dd = itemBtn.closest(".dropdown");
            const type = dd.dataset.type;
            const value = itemBtn.dataset.value;

            // Toggle selection
            tagsState[type].has(value) ? tagsState[type].delete(value) : tagsState[type].add(value);

            // Update dropdown UI + chips
            renderDropdownList(dd, type, dd.querySelector(".dropdown-input")?.value);
            renderSelectedTags();

            // SEUL endroit où on déclenche le filtrage global : controller
            notifyFiltersChanged({ tags: tagsState });
            return;
        }

        // Remove chip
        const chip = e.target.closest(".tag-chip");
        if (chip) {
            const type = chip.dataset.type;
            const value = chip.dataset.value;

            tagsState[type].delete(value);
            renderSelectedTags();

            const dd = container.querySelector(`.dropdown[data-type="${type}"]`);
            if (dd) renderDropdownList(dd, type, dd.querySelector(".dropdown-input")?.value || "");

            notifyFiltersChanged({ tags: tagsState });
            return;
        }
    });

    // Search inside dropdown => filter list only
    container.addEventListener("input", (e) => {
        const input = e.target.closest(".dropdown-input");
        if (!input) return;

        const dd = input.closest(".dropdown");
        renderDropdownList(dd, dd.dataset.type, input.value);
    });

    // Native “x” on input[type="search"] triggers "search" event when cleared
    container.addEventListener("search", (e) => {
        const input = e.target.closest(".dropdown-input");
        if (!input) return;

        const dd = input.closest(".dropdown");
        renderDropdownList(dd, dd.dataset.type, "");
    });

    // Click outside => close
    document.addEventListener("click", (e) => {
        if (!container.contains(e.target)) {
            container.querySelectorAll(".dropdown").forEach(closeDropdown);
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            container.querySelectorAll(".dropdown").forEach(closeDropdown);
        }
    });
})();