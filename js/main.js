import { recipes } from "./data/recipes.js";
import { createRecipeCard } from "./templates/recipeCard.js";
import "./utils/searchbar.js";

const gallery = document.getElementById("receipe-gallery");

export function displayRecipes(recipesList) {
    gallery.innerHTML = "";

    // Aucun résultat
    if (!recipesList || recipesList.length === 0) {
        const message = document.createElement("p");
        message.classList.add("no-results");
        message.textContent =
            "Aucune recette ne correspond à votre recherche.";
        gallery.appendChild(message);
        return;
    }

    // Affichage normal des cards
    recipesList.forEach((recipe, index) => {
        const card = createRecipeCard(recipe);
        card.style.animationDelay = `${index * 0.08}s`;
        gallery.appendChild(card);
    });
}

// affichage initial
displayRecipes(recipes);