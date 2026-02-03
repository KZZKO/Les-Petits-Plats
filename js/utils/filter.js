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





// --------------------------------- COMBINED ---------------------------------

