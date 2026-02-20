import { controller } from "../main.js";

(function initSearchbar() {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) return;

    // Valeur ecrite dans la searchbar
    searchInput.addEventListener("input", (event) => {
        const value = event.target.value ?? "";
        controller.notifyFiltersChanged({ search: value });
    });

    // Valeur ecrite dans la searchbar + clique loupe
    searchInput.addEventListener("search", (event) => {
        const value = event.target.value ?? "";
        controller.notifyFiltersChanged({ search: value });
    });
})();