// --------------------------------- SEARCHBAR --------------------------------

export function filterBySearch(recipes, search) {
    const query = search.toLowerCase().trim();

    if (query.length < 3) return recipes;

    return recipes.filter(recipe => {
        return (
            recipe.name.toLowerCase().includes(query) ||
            recipe.description.toLowerCase().includes(query) ||
            recipe.ingredients.some(ing =>
                ing.ingredient.toLowerCase().includes(query)
            )
        );
    });
}


// --------------------------------- TAGS ------------------------------------

function normalize(str) {
    return String(str || "").trim().toLowerCase();
}

function capitalize(str) {
    const s = String(str || "").trim();
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// 1) Récupérer toutes les options uniques depuis recipes
export function getAllTagOptions(recipes) {
    const ing = new Map();
    const app = new Map();
    const ust = new Map();

    recipes.forEach((r) => {
        r.ingredients?.forEach((i) => {
            const raw = i?.ingredient;
            const key = normalize(raw);
            if (key) ing.set(key, capitalize(raw));
        });

        const appKey = normalize(r.appliance);
        if (appKey) app.set(appKey, capitalize(r.appliance));

        r.ustensils?.forEach((u) => {
            const key = normalize(u);
            if (key) ust.set(key, capitalize(u));
        });
    });

    return {
        ingredients: [...ing.values()].sort((a, b) => a.localeCompare(b, "fr")),
        appliances: [...app.values()].sort((a, b) => a.localeCompare(b, "fr")),
        ustensils: [...ust.values()].sort((a, b) => a.localeCompare(b, "fr")),
    };
}

// 2) Filtrer la liste affichée DANS un dropdown (search interne)
export function filterDropdownOptions(optionsList, query) {
    const q = normalize(query);
    if (!q) return optionsList;
    return optionsList.filter((opt) => normalize(opt).includes(q));
}

// 3) Filtrer les recettes avec tags sélectionnés
// tagsState = { ingredients:Set, appliances:Set, ustensils:Set }
export function filterByTags(recipes, tagsState) {
    const ingTags = [...tagsState.ingredients].map(normalize);
    const appTags = [...tagsState.appliances].map(normalize);
    const ustTags = [...tagsState.ustensils].map(normalize);

    return recipes.filter((recipe) => {
        const recipeIngs = recipe.ingredients.map((i) => normalize(i.ingredient));
        const recipeApp = normalize(recipe.appliance);
        const recipeUst = recipe.ustensils.map(normalize);

        const matchIngredients =
            ingTags.length === 0 || ingTags.every((t) => recipeIngs.includes(t));

        const matchAppliances =
            appTags.length === 0 || appTags.every((t) => recipeApp === t);

        const matchUstensils =
            ustTags.length === 0 || ustTags.every((t) => recipeUst.includes(t));

        return matchIngredients && matchAppliances && matchUstensils;
    });
}


// --------------------------------- COMBINED ---------------------------------

