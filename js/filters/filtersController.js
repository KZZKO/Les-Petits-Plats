import { recipes } from "../data/recipes.js";
import { filterBySearch, filterByTags } from "./filter.js";
import { debounce } from "../utils/debounce.js";

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

// Liste filtrée courante + abonnés (utile pour recalculer les options de tags)
let lastFilteredList = recipes;
const resultsListeners = new Set();

// Permet à l’UI (tags) de recevoir la liste filtrée à chaque update
export function subscribeToResults(callback) {
    resultsListeners.add(callback);
    callback(lastFilteredList);
    return () => resultsListeners.delete(callback);
}

// Notifie tous les abonnés avec la nouvelle liste filtrée
function emitResults(list) {
    lastFilteredList = list;
    resultsListeners.forEach((callback) => callback(list));
}

// Vérifie si au moins un tag est actif
function hasAnyTags(tags) {
    return (
        tags.ingredients.size > 0 ||
        tags.appliances.size > 0 ||
        tags.ustensils.size > 0
    );
}

// Recalcule la liste filtrée et déclenche le rendu + l’emit pour les tags
function compute(renderFn) {
    let list = recipes;

    if (hasAnyTags(state.tags)) {
        list = filterByTags(list, state.tags);
    }

    const query = state.search.trim();
    if (query.length >= 3) {
        list = filterBySearch(list, query);
    }

    renderFn(list);
    emitResults(list);
}

// Initialise le controller et renvoie l’API utilisée par l’UI
export function initFiltersController(renderFn) {
    const debouncedCompute = debounce(() => compute(renderFn), 400);

    // Point d’entrée unique : l’UI envoie ici les changements (search / tags)
    function notifyFiltersChanged(partialState) {
        Object.assign(state, partialState);

        const query = state.search.trim();
        const searchActive = query.length >= 3;
        const tagsActive = hasAnyTags(state.tags);

        const tagsChanged = Object.prototype.hasOwnProperty.call(partialState, "tags");
        const searchChanged = Object.prototype.hasOwnProperty.call(partialState, "search");

        // Tags : update immédiat
        if (tagsChanged) {
            debouncedCompute.cancel();
            compute(renderFn);
            prevSearchActive = searchActive;
            return;
        }

        // Search : debounce seulement si >= 3 caractères
        if (searchChanged) {
            if (!searchActive) {
                debouncedCompute.cancel();

                if (prevSearchActive) {
                    compute(renderFn);
                } else if (tagsActive) {
                    compute(renderFn);
                }

                prevSearchActive = false;
                return;
            }

            prevSearchActive = true;
            debouncedCompute();
            return;
        }

        debouncedCompute.cancel();
        compute(renderFn);
    }

    return { notifyFiltersChanged };
}