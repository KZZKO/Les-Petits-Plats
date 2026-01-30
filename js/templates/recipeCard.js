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
        <img src="../../assets/JSON recipes/${image}" alt="${name}">
        
        <div class="recipe-content">
            <div class="recipe-header">
                <h2>${name}</h2>
                <span class="recipe-time">
                    <i class="fa-regular fa-clock"></i> ${time} min
                </span>
            </div>

            <div class="recipe-body">
                <ul class="ingredients">
                    ${ingredients.map(ing => `
                        <li>
                            <strong>${ing.ingredient}</strong>
                            ${ing.quantity ? `: ${ing.quantity}` : ""}
                            ${ing.unit ? ` ${ing.unit}` : ""}
                        </li>
                    `).join("")}
                </ul>

                <p class="description">${description}</p>
            </div>
        </div>
    `;

    return article;
}