import { recipes } from "../data/recipes.js";
import { displayRecipes } from "../main.js";
import { filterBySearch, filterByTags } from "./filter.js";
import { debounce } from "../utils/debounce.js";

const state = {
    search: "",
    tags: {
        ingredients: new Set(),
        appliances: new Set(),
        ustensils: new Set(),
    },
};

// Pour éviter certains re-render inutiles pendant que l’utilisateur tape < 3
let prevSearchActive = false;

function hasAnyTags(tags) {
    return (
        tags.ingredients.size > 0 ||
        tags.appliances.size > 0 ||
        tags.ustensils.size > 0
    );
}

function updateCount(n) {
    const el = document.getElementById("recipes-count");
    if (el) el.textContent = String(n);
}

function compute() {
    // 1) base = toutes les recettes
    let list = recipes;

    // 2) tags (toujours appliqués si au moins 1 tag)
    if (hasAnyTags(state.tags)) {
        list = filterByTags(list, state.tags);
    }

    // 3) search (uniquement si >= 3 caractères)
    const q = state.search.trim();
    if (q.length >= 3) {
        list = filterBySearch(list, q);
    }

    displayRecipes(list);
    updateCount(list.length);
}

const debouncedCompute = debounce(compute, 400);

export function notifyFiltersChanged(partialState) {
    // merge shallow
    Object.assign(state, partialState);

    const q = state.search.trim();
    const searchActive = q.length >= 3;
    const tagsActive = hasAnyTags(state.tags);

    const tagsChanged = Object.prototype.hasOwnProperty.call(partialState, "tags");
    const searchChanged = Object.prototype.hasOwnProperty.call(partialState, "search");

    // Si les tags changent => on veut un update immédiat (pas de debounce)
    if (tagsChanged) {
        debouncedCompute.cancel();
        compute();

        // met à jour l’état de référence pour le search
        prevSearchActive = searchActive;
        return;
    }

    // Si la search change (input principal)
    if (searchChanged) {
        // < 3 caractères : on ne déclenche pas de recherche
        // MAIS: si on avait une recherche active avant, il faut recalculer une fois
        // (soit tags-only, soit all recipes)
        if (!searchActive) {
            debouncedCompute.cancel();

            if (prevSearchActive) {
                // on vient de “désactiver” la search => recalcul immédiat
                compute();
            } else {
                // on tapote < 3 : ne re-render pas pour rien
                // (sauf si tags actifs ? non, car tags ne changent pas ici)
                // donc on ne fait rien
            }

            prevSearchActive = false;
            return;
        }

        // >= 3 caractères : on applique debounce
        prevSearchActive = true;
        debouncedCompute();
        return;
    }

    // fallback (si un jour tu passes autre chose dans partialState)
    debouncedCompute.cancel();
    compute();
}