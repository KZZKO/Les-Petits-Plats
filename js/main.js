import { recipes } from "./data/recipes.js";
import { createRecipeCard } from "./templates/recipeCard.js";

const gallery = document.getElementById("receipe-gallery");

function displayRecipes(recipesList) {
    gallery.innerHTML = "";

    recipesList.forEach(recipe => {
        const card = createRecipeCard(recipe);
        gallery.appendChild(card);
    });
}

// affichage initial
displayRecipes(recipes);