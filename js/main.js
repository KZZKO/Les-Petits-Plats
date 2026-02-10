import { recipes } from "./data/recipes.js";
import { createRecipeCard } from "./templates/recipeCard.js";
import "./ui/searchbar.js";
import "./ui/tags.js";

export function displayRecipes(recipesList) {
    const gallery = document.getElementById("receipe-gallery");
    if (!gallery) return;

    const n = recipesList?.length ?? 0;

    // Compteur + pluriel
    const countEl = document.getElementById("recipes-count");
    const labelEl = document.getElementById("recipes-label");
    if (countEl) countEl.textContent = String(n);
    if (labelEl) labelEl.textContent = n === 1 ? "recette" : "recettes";

    gallery.innerHTML = "";

    // Aucune recette correspondante
    if (n === 0) {
        const message = document.createElement("p");
        message.classList.add("no-results");
        message.textContent = "Aucune recette ne correspond à votre recherche.";
        gallery.appendChild(message);
        return;
    }

    // Affichage normal des cards + délai animation
    recipesList.forEach((recipe, index) => {
        const card = createRecipeCard(recipe);
        card.style.animationDelay = `${index * 0.08}s`;
        gallery.appendChild(card);
    });
}

// affichage initial
displayRecipes(recipes);