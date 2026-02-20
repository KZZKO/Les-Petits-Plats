export function createRecipeCard(recipe) {
    const {
        image,
        name,
        time,
        description,
        ingredients
    } = recipe;

    const article = document.createElement("article");
    article.classList.add("recipe-card");

    article.innerHTML = `
    <div class="card-img">
        <img src="./assets/JSON recipes/${image}" alt="${name}">
        <span class="recipe-time">${time}min</span>
    </div>
    <div class="recipe-content">
        <div class="recipe-header">
            <h2>${name}</h2>
            <p class="recette-txt">Recette</p>
            <p class="description">${description}</p>
        </div>

        <div class="recipe-body">
        <p class="ingredients-txt">Ingrédients</p>
            <ul class="ingredients">
                ${ingredients.map(ing => `
                    <li>
                        <strong>${ing.ingredient}</strong>
                        ${ing.quantity ? `${ing.quantity}` : ""}
                        ${ing.unit ? `${ing.unit}` : ""}
                    </li>
                `).join("")}
            </ul>
        </div>
    </div>
    `;

    return article;
}