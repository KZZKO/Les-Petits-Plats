import { notifyFiltersChanged } from "../filters/filtersController.js";

const searchInput = document.getElementById("search-input");
const searchForm = document.querySelector(".search-bar");

if (searchInput && searchForm) {
    // Submit (au cas où)
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        notifyFiltersChanged({ search: searchInput.value });
    });

    // Saisie
    searchInput.addEventListener("input", (event) => {
        notifyFiltersChanged({ search: event.target.value });
    });

    // Clear via le "X" natif (input[type="search"])
    searchInput.addEventListener("search", (event) => {
        notifyFiltersChanged({ search: event.target.value });
    });
}