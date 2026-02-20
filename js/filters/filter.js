// --------------------------------- SEARCHBAR --------------------------------

// Filtre les recettes via la recherche (min 3 caractères)
export function filterBySearch(recipes, search) {
    const query = search.toLowerCase().trim();
    if (query.length < 3) return recipes;

    // version for-loop
    const results = [];

    for (let i = 0; i < recipes.length; i++) {
        const recipe = recipes[i];

        const nameMatch = recipe.name.toLowerCase().includes(query);
        const descMatch = recipe.description.toLowerCase().includes(query);

        let ingredientMatch = false;
        for (let j = 0; j < recipe.ingredients.length; j++) {
            const ingredientItem = recipe.ingredients[j];
            if (ingredientItem.ingredient.toLowerCase().includes(query)) {
                ingredientMatch = true;
                break;
            }
        }

        if (nameMatch || descMatch || ingredientMatch) results.push(recipe);
    }

    return results;
}

// --------------------------------- TAGS ------------------------------------

// Normalise une valeur pour comparer facilement
function normalize(value) {
    return String(value || "").trim().toLowerCase();
}

// Met une valeur en "Titre" (1ère lettre maj)
function capitalize(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// Récupère toutes les options de tags uniques
export function getAllTagOptions(recipes) {
    const ingredientMap = new Map();
    const applianceMap = new Map();
    const ustensilMap = new Map();

    recipes.forEach((recipe) => {
        recipe.ingredients?.forEach((ingredientItem) => {
            const raw = ingredientItem?.ingredient;
            const key = normalize(raw);
            if (key) ingredientMap.set(key, capitalize(raw));
        });

        const applianceKey = normalize(recipe.appliance);
        if (applianceKey) applianceMap.set(applianceKey, capitalize(recipe.appliance));

        recipe.ustensils?.forEach((ustensil) => {
            const key = normalize(ustensil);
            if (key) ustensilMap.set(key, capitalize(ustensil));
        });
    });

    return {
        ingredients: [...ingredientMap.values()].sort((a, b) => a.localeCompare(b, "fr")),
        appliances: [...applianceMap.values()].sort((a, b) => a.localeCompare(b, "fr")),
        ustensils: [...ustensilMap.values()].sort((a, b) => a.localeCompare(b, "fr")),
    };
}

// Filtre les options d’un dropdown via la recherche interne
export function filterDropdownOptions(optionsList, query) {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return optionsList;

    return optionsList.filter((option) => normalize(option).includes(normalizedQuery));
}

// Filtre les recettes selon les tags sélectionnés
export function filterByTags(recipes, tagsState) {
    const selectedIngredientTags = [...tagsState.ingredients].map(normalize);
    const selectedApplianceTags = [...tagsState.appliances].map(normalize);
    const selectedUstensilTags = [...tagsState.ustensils].map(normalize);

    return recipes.filter((recipe) => {
        const recipeIngredients = recipe.ingredients.map((i) => normalize(i.ingredient));
        const recipeAppliance = normalize(recipe.appliance);
        const recipeUstensils = recipe.ustensils.map(normalize);

        const matchIngredients =
            selectedIngredientTags.length === 0 ||
            selectedIngredientTags.every((tag) => recipeIngredients.includes(tag));

        const matchAppliances =
            selectedApplianceTags.length === 0 ||
            selectedApplianceTags.every((tag) => recipeAppliance === tag);

        const matchUstensils =
            selectedUstensilTags.length === 0 ||
            selectedUstensilTags.every((tag) => recipeUstensils.includes(tag));

        return matchIngredients && matchAppliances && matchUstensils;
    });
}