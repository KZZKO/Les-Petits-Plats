import { recipes } from "./data/recipes.js";
import { createRecipeCard } from "./templates/recipeCard.js";
import { initFiltersController } from "./filters/filtersController.js";

import "./ui/searchbar.js";
import "./ui/tags.js";

// Affiche la liste des recettes dans la galerie
export function displayRecipes(recipesList) {
    const gallery = document.getElementById("receipe-gallery");
    if (!gallery) return;

    const n = recipesList?.length ?? 0;

    const countEl = document.getElementById("recipes-count");
    const labelEl = document.getElementById("recipes-label");

    if (countEl) countEl.textContent = String(n);
    if (labelEl) labelEl.textContent = n === 1 ? "recette" : "recettes";

    gallery.innerHTML = "";

    if (n === 0) {
        const message = document.createElement("p");
        message.classList.add("no-results");
        message.textContent = "Aucune recette ne correspond à votre recherche.";
        gallery.appendChild(message);
        return;
    }

    recipesList.forEach((recipe, index) => {
        const card = createRecipeCard(recipe);
        card.style.animationDelay = `${index * 0.08}s`;
        gallery.appendChild(card);
    });
}

// Initialise le controller (search + tags)
export const controller = initFiltersController(displayRecipes);

// Affichage initial
displayRecipes(recipes);