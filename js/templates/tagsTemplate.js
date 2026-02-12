export function renderTagsUI() {
  const container = document.getElementById("filter-tags");
  if (!container) return;

  container.innerHTML = `
    <div class="filters-bar">

      <div class="filter-top">
        <div class="filters-left">
          ${createDropdown("ingredients", "Ingrédients")}
          ${createDropdown("appliances", "Appareils")}
          ${createDropdown("ustensils", "Ustensiles")}
        </div>

        <div class="filters-right">
          <p class="recipes-count">
            <span id="recipes-count">0</span>
            <span id="recipes-label">recettes</span>
          </p>
        </div>
      </div>

      <div class="selected-tags">
        <div class="tags-group" data-type="ingredients"></div>
        <div class="tags-group" data-type="appliances"></div>
        <div class="tags-group" data-type="ustensils"></div>
      </div>

    </div>
  `;
}

function createDropdown(type, label) {
  return `
    <div class="dropdown" data-type="${type}">
      <button class="dropdown-toggle" type="button" aria-expanded="false">
        <span class="dropdown-label">${label}</span>
        <i class="fa-solid fa-chevron-down dropdown-icon" aria-hidden="true"></i>
      </button>

      <div class="dropdown-panel" hidden>
        <div class="dropdown-search">
          <input
            class="dropdown-input"
            type="search"
            placeholder="Rechercher..."
            aria-label="Rechercher dans ${label}"
          />
          <i class="fa-solid fa-magnifying-glass dropdown-search-icon" aria-hidden="true"></i>
        </div>

        <!-- Zone sticky des tags sélectionnés (toujours visible) -->
        <ul class="dropdown-selected" role="listbox" aria-label="Sélectionnés"></ul>

        <!-- Zone scrollable -->
        <ul class="dropdown-list" role="listbox" aria-label="Options"></ul>
      </div>
    </div>
  `;
}