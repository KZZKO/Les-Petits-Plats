import { recipes } from "../data/recipes.js";
import { displayRecipes } from "../main.js";
import { filterBySearch } from "./filter.js";

const searchInput = document.getElementById("search-input");
const form = document.querySelector(".search-bar");

let debounceTimer;
let isFiltered = true; // pour éviter de re-render pour rien

form.addEventListener("submit", (e) => e.preventDefault());

searchInput.addEventListener("input", (e) => {
    const value = e.target.value;
    const query = value.trim();

    // Si moins de 3 caractères : on annule toute recherche en attente
    if (query.length < 3) {
        clearTimeout(debounceTimer);

        // On ne ré-affiche toutes les recettes que si on n'est pas déjà dans cet état
        if (!isFiltered) {
            displayRecipes(recipes);
            isFiltered = true;
        }
        return;
    }

    // À partir de 3 caractères : on active debounce + recherche
    isFiltered = false;
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        const filtered = filterBySearch(recipes, value);
        displayRecipes(filtered);
    }, 400);
});