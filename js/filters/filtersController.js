import { recipes } from "../data/recipes.js";
import { displayRecipes } from "../main.js";
import { filterBySearch } from "./filter.js";
import { debounce } from "../utils/debounce.js";

const state = {
    search: "",
};

let isFiltered = false; // false = on affiche TOUTES les recettes

function compute() {
    // ici on sait qu’on est >= 3
    const filtered = filterBySearch(recipes, state.search);
    displayRecipes(filtered);
}

const debouncedCompute = debounce(compute, 400);

export function notifyFiltersChanged(partialState) {
    Object.assign(state, partialState);

    const q = state.search.trim();

    // < 3 caractères : on annule la recherche et on évite les re-render
    if (q.length < 3) {
        debouncedCompute.cancel();

        if (isFiltered) {
            displayRecipes(recipes);
            isFiltered = false;
        }
        return;
    }

    // >= 3 : on passe en mode filtré
    isFiltered = true;
    debouncedCompute();
}