import { recipes } from "../data/recipes.js";
import { filterBySearch, filterByTags } from "./filter.js";
import { debounce } from "../utils/debounce.js";

// État global des filtres (search + tags sélectionnés)
const state = {
    search: "",
    tags: {
        ingredients: new Set(),
        appliances: new Set(),
        ustensils: new Set(),
    },
};

// Sert à savoir si la search était active (>= 3 caractères)
let prevSearchActive = false;

// Stocke la dernière liste filtrée calculée
let lastFilteredList = recipes;

// Liste des modules abonnés aux résultats (ex: tags)
const resultsListeners = new Set();

// Abonne un module UI à la liste filtrée courante
export function subscribeToResults(callback) {
    resultsListeners.add(callback);
    callback(lastFilteredList);
    return () => resultsListeners.delete(callback);
}

// Envoie la nouvelle liste filtrée à tous les abonnés
function emitResults(list) {
    lastFilteredList = list;
    resultsListeners.forEach((callback) => callback(list));
}

// Vérifie s’il y a au moins un tag actif
function hasAnyTags(tags) {
    return (
        tags.ingredients.size > 0 ||
        tags.appliances.size > 0 ||
        tags.ustensils.size > 0
    );
}

// Recalcule la liste filtrée puis déclenche render + update des options
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

    // Version debounced du compute pour la search
    const debouncedCompute = debounce(() => compute(renderFn), 400);

    // Point d’entrée unique : l’UI envoie search/tags ici
    function notifyFiltersChanged(partialState) {
        Object.assign(state, partialState);

        const query = state.search.trim();
        const searchActive = query.length >= 3;

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

                // On recalcule une fois quand on repasse sous 3 chars
                if (prevSearchActive) {
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