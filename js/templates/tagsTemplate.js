export function renderTagsUI() {
    const container = document.getElementById("filter-tags");
    if (!container) return;

    container.innerHTML = `
    <div class="filters-bar">

      <div class="filters-left">
        ${createDropdown("ingredients", "Ingrédients")}
        ${createDropdown("appliances", "Appareils")}
        ${createDropdown("ustensils", "Ustensiles")}
      </div>

      <div class="filters-right">
        <p class="recipes-count">
          <span id="recipes-count">0</span> recettes
        </p>
      </div>
    </div>

    <div class="selected-tags">
      <div class="tags-group" data-type="ingredients"></div>
      <div class="tags-group" data-type="appliances"></div>
      <div class="tags-group" data-type="ustensils"></div>
    </div>
  `;
}

function createDropdown(type, label) {
    return `
    <div class="dropdown" data-type="${type}">
      <button class="dropdown-toggle" type="button" aria-expanded="false">
        <span class="dropdown-label">${label}</span>
        <span class="dropdown-icon" aria-hidden="true">▾</span>
      </button>

      <div class="dropdown-panel" hidden>
        <div class="dropdown-search">
          <input class="dropdown-input" type="text" placeholder="Rechercher..." />
          <button class="dropdown-close" type="button" aria-label="Fermer">✕</button>
        </div>

        <ul class="dropdown-list" role="listbox"></ul>
      </div>
    </div>
  `;
}