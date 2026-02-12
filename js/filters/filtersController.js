import { recipes } from "../data/recipes.js";
import { filterBySearch, filterByTags } from "./filter.js";
import { debounce } from "../utils/debounce.js";

let renderFn = null;

export function initFiltersController(renderFunction) {
    renderFn = renderFunction;
}

const state = {
    search: "",
    tags: {
        ingredients: new Set(),
        appliances: new Set(),
        ustensils: new Set(),
    },
};

let prevSearchActive = false;

function hasAnyTags(tags) {
    return (
        tags.ingredients.size > 0 ||
        tags.appliances.size > 0 ||
        tags.ustensils.size > 0
    );
}

function compute() {
    let list = recipes;

    if (hasAnyTags(state.tags)) {
        list = filterByTags(list, state.tags);
    }

    const q = state.search.trim();
    if (q.length >= 3) {
        list = filterBySearch(list, q);
    }

    if (renderFn) renderFn(list);
}

const debouncedCompute = debounce(compute, 400);

export function notifyFiltersChanged(partialState) {
    Object.assign(state, partialState);

    const q = state.search.trim();
    const searchActive = q.length >= 3;

    const tagsChanged = Object.prototype.hasOwnProperty.call(partialState, "tags");
    const searchChanged = Object.prototype.hasOwnProperty.call(partialState, "search");

    if (tagsChanged) {
        debouncedCompute.cancel();
        compute();
        prevSearchActive = searchActive;
        return;
    }

    if (searchChanged) {
        if (!searchActive) {
            debouncedCompute.cancel();
            if (prevSearchActive) compute();
            prevSearchActive = false;
            return;
        }

        prevSearchActive = true;
        debouncedCompute();
        return;
    }

    debouncedCompute.cancel();
    compute();
}