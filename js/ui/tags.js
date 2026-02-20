import { recipes } from "../data/recipes.js";
import { renderTagsUI } from "../templates/tagsTemplate.js";
import { getAllTagOptions, filterDropdownOptions } from "../filters/filter.js";
import { subscribeToResults } from "../filters/filtersController.js";
import { controller } from "../main.js";

const tagsState = {
    ingredients: new Set(),
    appliances: new Set(),
    ustensils: new Set(),
};

let allOptions = getAllTagOptions(recipes);

// Sécurise le HTML injecté dans le DOM
function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// Normalise une valeur pour comparer sans prise de tête
function normalize(value) {
    return String(value || "").trim().toLowerCase();
}

// Récupère la search active (>=3) pour éviter de proposer le même tag
function getActiveSearchQuery() {
    const searchInput = document.getElementById("search-input");
    const query = searchInput?.value ?? "";
    const normalizedQuery = normalize(query);
    return normalizedQuery.length >= 3 ? normalizedQuery : "";
}

// Clone l’état des tags (on évite de partager les mêmes Set)
function cloneTagsState() {
    return {
        ingredients: new Set(tagsState.ingredients),
        appliances: new Set(tagsState.appliances),
        ustensils: new Set(tagsState.ustensils),
    };
}

// Ferme un dropdown et reset son champ de recherche
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

// Ouvre un dropdown et focus le champ de recherche
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

// Met à jour l’affichage des tags sélectionnés (chips)
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

// Rend la liste d’un dropdown (selected sticky + options filtrées)
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

    // Sticky selected
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

    const activeSearchQuery = getActiveSearchQuery();

    // Options visibles (hors sélection + hors search exacte)
    const remainingOptions = filteredOptions
        .filter((value) => !tagsState[type].has(value))
        .filter((value) => normalize(value) !== activeSearchQuery);

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

// Rafraîchit toutes les listes de dropdowns (en gardant la saisie)
function rerenderAllDropdownLists(tagsContainer) {
    tagsContainer.querySelectorAll(".dropdown").forEach((dropdown) => {
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

    renderTagsUI();

    // Rendu initial
    tagsContainer.querySelectorAll(".dropdown").forEach((dropdown) => {
        renderDropdownList(dropdown, dropdown.dataset.type);
    });
    renderSelectedTags();

    // Recalcule les options compatibles à chaque changement de résultats
    subscribeToResults((currentList) => {
        allOptions = getAllTagOptions(currentList || []);
        rerenderAllDropdownLists(tagsContainer);
    });

    // --------------------------------- EVENTS --------------------------------

    tagsContainer.addEventListener("click", (event) => {
        const toggleButton = event.target.closest(".dropdown-toggle");
        if (toggleButton) {
            const dropdown = toggleButton.closest(".dropdown");

            tagsContainer.querySelectorAll(".dropdown").forEach((otherDropdown) => {
                if (otherDropdown !== dropdown) closeDropdown(otherDropdown);
            });

            dropdown.classList.contains("is-open")
                ? closeDropdown(dropdown)
                : openDropdown(dropdown);
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

    // Filtre la liste du dropdown quand on tape dedans
    tagsContainer.addEventListener("input", (event) => {
        const dropdownInput = event.target.closest(".dropdown-input");
        if (!dropdownInput) return;

        const dropdown = dropdownInput.closest(".dropdown");
        renderDropdownList(dropdown, dropdown.dataset.type, dropdownInput.value);
    });

    // Reset la liste quand on clique sur la croix du champ
    tagsContainer.addEventListener("search", (event) => {
        const dropdownInput = event.target.closest(".dropdown-input");
        if (!dropdownInput) return;

        const dropdown = dropdownInput.closest(".dropdown");
        renderDropdownList(dropdown, dropdown.dataset.type, "");
    });

    // Ferme tout si on clique en dehors
    document.addEventListener("click", (event) => {
        if (!tagsContainer.contains(event.target)) {
            tagsContainer.querySelectorAll(".dropdown").forEach(closeDropdown);
        }
    });

    // Ferme tout avec ESC
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            tagsContainer.querySelectorAll(".dropdown").forEach(closeDropdown);
        }
    });
})();