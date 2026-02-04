import { notifyFiltersChanged } from "../filters/filtersController.js";

const searchInput = document.getElementById("search-input");
const form = document.querySelector(".search-bar");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    notifyFiltersChanged({
        search: searchInput.value,
    });
});

searchInput.addEventListener("input", (e) => {
    notifyFiltersChanged({
        search: e.target.value,
    });
});