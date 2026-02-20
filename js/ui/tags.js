import { recipes } from "../data/recipes.js";
import { renderTagsUI } from "../templates/tagsTemplate.js";
import { getAllTagOptions, filterDropdownOptions } from "../filters/filter.js";
import { subscribeToResults } from "../filters/filtersController.js";
import { controller } from "../main.js";

// État local des tags sélectionnés
const tagsState = {
    ingredients: new Set(),
    appliances: new Set(),
    ustensils: new Set(),
};

let allOptions = getAllTagOptions(recipes);

// Protège l’affichage contre l’injection HTML
function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// Clone pour éviter de partager les mêmes Set avec le controller
function cloneTagsState() {
    return {
        ingredients: new Set(tagsState.ingredients),
        appliances: new Set(tagsState.appliances),
        ustensils: new Set(tagsState.ustensils),
    };
}

// Ferme un dropdown (UI + aria + reset input)
function closeDropdown(dropdown) {
    const toggleButton = dropdown.querySelector(".dropdown-toggle");
    const dropdownPanel = dropdown.querySelector(".dropdown-panel");
    if (!toggleButton || !dropdownPanel) return;

    dropdownPanel.hidden = true;
    toggleButton.setAttribute("aria-expanded", "false");
    dropdown.classList.remove("is-open");

    const dropdownInput = dropdown.querySelector(".dropdown-input");
    if (dropdownInput) dropdownInput.value = "";
}

// Ouvre un dropdown (UI + aria + focus input)
function openDropdown(dropdown) {
    const toggleButton = dropdown.querySelector(".dropdown-toggle");
    const dropdownPanel = dropdown.querySelector(".dropdown-panel");
    if (!toggleButton || !dropdownPanel) return;

    dropdownPanel.hidden = false;
    toggleButton.setAttribute("aria-expanded", "true");
    dropdown.classList.add("is-open");

    const dropdownInput = dropdown.querySelector(".dropdown-input");
    if (dropdownInput) dropdownInput.focus();
}

// Met à jour les chips de tags sélectionnés
function renderSelectedTags() {
    const tagsContainer = document.getElementById("filter-tags");
    if (!tagsContainer) return;

    ["ingredients", "appliances", "ustensils"].forEach((type) => {
        const group = tagsContainer.querySelector(`.tags-group[data-type="${type}"]`);
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

// Met à jour la liste d’un dropdown (selected sticky + liste filtrée)
function renderDropdownList(dropdown, type, query = "") {
    const selectedList = dropdown.querySelector(".dropdown-selected");
    const optionsList = dropdown.querySelector(".dropdown-list");
    if (!selectedList || !optionsList) return;

    const baseOptions = allOptions[type] || [];
    const selectedValues = [...tagsState[type]];

    const mergedOptions = [
        ...selectedValues,
        ...baseOptions.filter((value) => !tagsState[type].has(value)),
    ];

    const filteredOptions = filterDropdownOptions(mergedOptions, query);

    // Zone sticky : uniquement les tags déjà sélectionnés
    selectedList.innerHTML = selectedValues
        .map(
            (value) => `
        <li class="dropdown-item is-selected">
          <button
            type="button"
            class="dropdown-item-btn"
            data-value="${escapeHtml(value)}"
          >
            ${escapeHtml(value)}
          </button>
        </li>
      `
        )
        .join("");

    // Liste scrollable : uniquement les non sélectionnés
    const remainingOptions = filteredOptions.filter((value) => !tagsState[type].has(value));

    optionsList.innerHTML = remainingOptions
        .map(
            (value) => `
        <li class="dropdown-item">
          <button
            type="button"
            class="dropdown-item-btn"
            data-value="${escapeHtml(value)}"
          >
            ${escapeHtml(value)}
          </button>
        </li>
      `
        )
        .join("");
}

// Re-render toutes les listes en gardant la saisie en cours
function rerenderAllDropdownLists(container) {
    container.querySelectorAll(".dropdown").forEach((dropdown) => {
        const type = dropdown.dataset.type;
        const query = dropdown.querySelector(".dropdown-input")?.value || "";
        renderDropdownList(dropdown, type, query);
    });
}

// Envoie l’état des tags au controller
function notifyController() {
    controller.notifyFiltersChanged({ tags: cloneTagsState() });
}

(function initTags() {
    const tagsContainer = document.getElementById("filter-tags");
    if (!tagsContainer) return;

    // Structure HTML des dropdowns + groupes
    renderTagsUI();

    // Rendu initial
    tagsContainer.querySelectorAll(".dropdown").forEach((dropdown) => {
        renderDropdownList(dropdown, dropdown.dataset.type);
    });
    renderSelectedTags();

    // Quand la liste filtrée change, on recalcule les options possibles
    subscribeToResults((currentList) => {
        allOptions = getAllTagOptions(currentList || []);
        rerenderAllDropdownLists(tagsContainer);
    });

    // Clicks : toggle dropdown, selection, suppression chip
    tagsContainer.addEventListener("click", (event) => {
        const toggleButton = event.target.closest(".dropdown-toggle");
        if (toggleButton) {
            const dropdown = toggleButton.closest(".dropdown");

            tagsContainer.querySelectorAll(".dropdown").forEach((otherDropdown) => {
                if (otherDropdown !== dropdown) closeDropdown(otherDropdown);
            });

            dropdown.classList.contains("is-open") ? closeDropdown(dropdown) : openDropdown(dropdown);
            return;
        }

        const optionButton = event.target.closest(".dropdown-item-btn");
        if (optionButton) {
            const dropdown = optionButton.closest(".dropdown");
            const type = dropdown.dataset.type;
            const value = optionButton.dataset.value;

            if (tagsState[type].has(value)) tagsState[type].delete(value);
            else tagsState[type].add(value);

            renderDropdownList(dropdown, type, dropdown.querySelector(".dropdown-input")?.value || "");
            renderSelectedTags();
            notifyController();
            return;
        }

        const chipButton = event.target.closest(".tag-chip");
        if (chipButton) {
            const type = chipButton.dataset.type;
            const value = chipButton.dataset.value;

            tagsState[type].delete(value);
            renderSelectedTags();

            const dropdown = tagsContainer.querySelector(`.dropdown[data-type="${type}"]`);
            if (dropdown) {
                renderDropdownList(dropdown, type, dropdown.querySelector(".dropdown-input")?.value || "");
            }

            notifyController();
            return;
        }
    });

    // Recherche dans un dropdown (filtre la liste visible uniquement)
    tagsContainer.addEventListener("input", (event) => {
        const dropdownInput = event.target.closest(".dropdown-input");
        if (!dropdownInput) return;

        const dropdown = dropdownInput.closest(".dropdown");
        renderDropdownList(dropdown, dropdown.dataset.type, dropdownInput.value);
    });

    // Clear via le "X" natif (input[type="search"])
    tagsContainer.addEventListener("search", (event) => {
        const dropdownInput = event.target.closest(".dropdown-input");
        if (!dropdownInput) return;

        const dropdown = dropdownInput.closest(".dropdown");
        renderDropdownList(dropdown, dropdown.dataset.type, "");
    });

    // Click hors zone : ferme tout
    document.addEventListener("click", (event) => {
        if (!tagsContainer.contains(event.target)) {
            tagsContainer.querySelectorAll(".dropdown").forEach(closeDropdown);
        }
    });

    // ESC : ferme tout
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            tagsContainer.querySelectorAll(".dropdown").forEach(closeDropdown);
        }
    });
})();