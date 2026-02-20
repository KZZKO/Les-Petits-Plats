import { recipes } from "../data/recipes.js";
import { filterBySearch, filterByTags } from "./filter.js";
import { debounce } from "../utils/debounce.js";

let renderFn = null;

// État global des filtres
const state = {
    search: "",
    tags: {
        ingredients: new Set(),
        appliances: new Set(),
        ustensils: new Set(),
    },
};

let prevSearchActive = false;

// Liste filtrée courante + abonnés
let lastFilteredList = recipes;
const resultsListeners = new Set();

// Donne la liste filtrée courante aux modules UI (ex: tags)
export function subscribeToResults(callback) {
    resultsListeners.add(callback);
    callback(lastFilteredList);
    return () => resultsListeners.delete(callback);
}

// Notifie les abonnés après chaque recalcul
function emitResults(list) {
    lastFilteredList = list;
    resultsListeners.forEach((callback) => callback(list));
}

// Branche la fonction de rendu
export function initFiltersController(renderFunction) {
    renderFn = renderFunction;
}

// Vérifie si au moins un tag est actif
function hasAnyTags(tags) {
    return (
        tags.ingredients.size > 0 ||
        tags.appliances.size > 0 ||
        tags.ustensils.size > 0
    );
}

// Recalcule la liste filtrée (tags + search), puis render + emit
function compute() {
    let list = recipes;

    if (hasAnyTags(state.tags)) {
        list = filterByTags(list, state.tags);
    }

    const query = state.search.trim();
    if (query.length >= 3) {
        list = filterBySearch(list, query);
    }

    if (renderFn) renderFn(list);

    // IMPORTANT : les tags doivent toujours recevoir la liste finale
    emitResults(list);
}

const debouncedCompute = debounce(compute, 400);

// Point d’entrée unique : search / tags appellent ça
export function notifyFiltersChanged(partialState) {
    Object.assign(state, partialState);

    const query = state.search.trim();
    const searchActive = query.length >= 3;

    const tagsChanged = Object.prototype.hasOwnProperty.call(partialState, "tags");
    const searchChanged = Object.prototype.hasOwnProperty.call(partialState, "search");

    // Tags : update immédiat
    if (tagsChanged) {
        debouncedCompute.cancel();
        compute();
        prevSearchActive = searchActive;
        return;
    }

    // Search
    if (searchChanged) {
        // < 3 caractères : ne rerender PAS à chaque frappe
        if (!searchActive) {
            debouncedCompute.cancel();

            // On recompute seulement si on vient de quitter une search "active"
            if (prevSearchActive) {
                compute();
            }

            prevSearchActive = false;
            return;
        }

        // >= 3 : debounce
        prevSearchActive = true;
        debouncedCompute();
        return;
    }

    debouncedCompute.cancel();
    compute();
}