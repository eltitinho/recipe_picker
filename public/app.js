// --- API (redirige vers l'écran de connexion sur 401) ---

async function request(method, path, body) {
  const options = { method };
  if (body !== undefined) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }
  const res = await fetch(path, options);
  if (res.status === 401 && !path.startsWith('/api/auth/')) {
    showAuth();
    throw new Error('Non connecté');
  }
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  delete: (path) => request('DELETE', path),
};

function el(tag, text) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

// --- État global ---

let stepCatalog = { actions: [], utensils: [] };
let allIngredients = [];
let myRecipes = { created: [], saved: [], savedIds: [] };

// Sélection du formulaire de recette : Map(id -> { name, quantity, unit })
// Vit en dehors du DOM pour survivre au filtrage/recherche.
const recipeSelection = new Map();

function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

// --- Authentification ---

function showAuth() {
  document.getElementById('auth-screen').hidden = false;
  document.getElementById('app-screen').hidden = true;
}

async function showApp(username) {
  document.getElementById('auth-screen').hidden = true;
  document.getElementById('app-screen').hidden = false;
  document.getElementById('current-user').textContent = `👤 ${username}`;
  await Promise.all([loadCategories(), loadStepCatalog()]);
  refreshAll();
}

document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const error = document.getElementById('login-error');
  error.textContent = '';
  try {
    const user = await api.post('/api/auth/login', {
      username: document.getElementById('login-username').value,
      password: document.getElementById('login-password').value,
    });
    showApp(user.username);
  } catch (err) {
    error.textContent = err.message;
  }
};

document.getElementById('register-form').onsubmit = async (e) => {
  e.preventDefault();
  const error = document.getElementById('register-error');
  error.textContent = '';
  try {
    const user = await api.post('/api/auth/register', {
      username: document.getElementById('register-username').value,
      password: document.getElementById('register-password').value,
    });
    showApp(user.username);
  } catch (err) {
    error.textContent = err.message;
  }
};

document.getElementById('logout-btn').onclick = async () => {
  await api.post('/api/auth/logout');
  showAuth();
};

// --- Navigation par onglets ---

document.querySelectorAll('nav.tabs button').forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll('nav.tabs button').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('section.tab-panel').forEach((s) => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  };
});

// --- Utilitaires ---

function groupByCategory(ingredients) {
  const groups = new Map();
  for (const ing of ingredients) {
    if (!groups.has(ing.category)) groups.set(ing.category, []);
    groups.get(ing.category).push(ing);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, 'fr'));
}

async function loadCategories() {
  const categories = await api.get('/api/categories');
  const select = document.getElementById('ingredient-category');
  select.innerHTML = '';
  for (const cat of categories) {
    const option = el('option', cat);
    option.value = cat;
    select.append(option);
  }
  const filter = document.getElementById('ingredient-filter');
  filter.innerHTML = '';
  const all = el('option', 'Toutes les catégories');
  all.value = '';
  filter.append(all);
  for (const cat of categories) {
    const option = el('option', cat);
    option.value = cat;
    filter.append(option);
  }
  filter.onchange = renderIngredientPicker;
  document.getElementById('ingredient-search').oninput = renderIngredientPicker;
}

async function loadStepCatalog() {
  stepCatalog = await api.get('/api/step-catalog');
}

function getCheckedRecipeIngredients() {
  return [...recipeSelection.entries()].map(([id, sel]) => ({ id, name: sel.name }));
}

// --- Sélecteur d'ingrédients (recherche + filtre + panneau scrollable) ---

function renderIngredientPicker() {
  const container = document.getElementById('recipe-ingredients-checkboxes');
  const search = normalize(document.getElementById('ingredient-search').value.trim());
  const categoryFilter = document.getElementById('ingredient-filter').value;

  const visible = allIngredients.filter((ing) =>
    (!search || normalize(ing.name).includes(search)) &&
    (!categoryFilter || ing.category === categoryFilter)
  );

  container.innerHTML = '';
  if (visible.length === 0) {
    const empty = el('p', 'Aucun ingrédient ne correspond.');
    empty.className = 'picker-empty';
    container.append(empty);
    return;
  }

  for (const [category, items] of groupByCategory(visible)) {
    const title = el('h3', category);
    title.className = 'category';
    container.append(title);
    const grid = el('div');
    grid.className = 'checkbox-grid';
    for (const ing of items) {
      const selected = recipeSelection.get(ing.id);
      const wrapper = el('div');
      wrapper.className = 'ingredient-choice';
      if (selected) wrapper.classList.add('checked');

      const label = el('label');
      const checkbox = el('input');
      checkbox.type = 'checkbox';
      checkbox.value = ing.id;
      checkbox.checked = !!selected;
      label.append(checkbox, ` ${ing.name}`);

      const qty = el('input');
      qty.type = 'number';
      qty.min = '0';
      qty.step = 'any';
      qty.placeholder = 'Qté';
      qty.className = 'quantity-input';
      qty.value = selected?.quantity ?? '';

      const unit = el('span', ing.defaultUnit || 'g');
      unit.className = 'unit-label';

      checkbox.onchange = () => {
        wrapper.classList.toggle('checked', checkbox.checked);
        if (checkbox.checked) {
          recipeSelection.set(ing.id, { name: ing.name, quantity: '' });
          qty.focus();
        } else {
          recipeSelection.delete(ing.id);
          qty.value = '';
        }
        refreshStepChips();
      };

      qty.oninput = () => {
        const sel = recipeSelection.get(ing.id);
        if (sel) sel.quantity = qty.value;
      };

      wrapper.append(label, qty, unit);
      grid.append(wrapper);
    }
    container.append(grid);
  }
}

// --- Gestion des étapes du formulaire ---

function renumberSteps() {
  document.querySelectorAll('#steps-list .step-row').forEach((row, i) => {
    row.querySelector('.step-num').textContent = `${i + 1}.`;
  });
}

function refreshStepChips() {
  const available = getCheckedRecipeIngredients();
  document.querySelectorAll('#steps-list .step-row').forEach((row) => {
    const container = row.querySelector('.step-ings');
    const previouslyChecked = new Set(
      [...container.querySelectorAll('input:checked')].map((cb) => Number(cb.value))
    );
    container.innerHTML = '';
    for (const ing of available) {
      const label = el('label');
      const checkbox = el('input');
      checkbox.type = 'checkbox';
      checkbox.value = ing.id;
      checkbox.checked = previouslyChecked.has(ing.id);
      label.append(checkbox, ing.name);
      container.append(label);
    }
  });
}

function addStepRow() {
  const row = el('div');
  row.className = 'step-row';

  const num = el('span');
  num.className = 'step-num';

  const actionSelect = el('select');
  actionSelect.className = 'step-action';
  for (const action of stepCatalog.actions) {
    const option = el('option', `${action.emoji} ${action.label}`);
    option.value = action.key;
    actionSelect.append(option);
  }

  const utensilSelect = el('select');
  utensilSelect.className = 'step-utensil';
  const none = el('option', '— ustensile —');
  none.value = '';
  utensilSelect.append(none);
  for (const utensil of stepCatalog.utensils) {
    const option = el('option', utensil);
    option.value = utensil;
    utensilSelect.append(option);
  }

  const ings = el('div');
  ings.className = 'step-ings';

  const desc = el('input');
  desc.type = 'text';
  desc.className = 'step-desc';
  desc.placeholder = 'Détails (ex. en petits dés, à feu doux 10 min...)';

  const remove = el('button', '✕');
  remove.type = 'button';
  remove.className = 'delete';
  remove.onclick = () => {
    row.remove();
    renumberSteps();
  };

  row.append(num, actionSelect, utensilSelect, ings, desc, remove);
  document.getElementById('steps-list').append(row);
  refreshStepChips();
  renumberSteps();
}

document.getElementById('add-step-btn').onclick = addStepRow;

// --- Affichage des recettes ---

function formatIngredient(ing) {
  return ing.quantity != null ? `${ing.name} (${ing.quantity} ${ing.unit})` : ing.name;
}

function formatStep(step) {
  const action = stepCatalog.actions.find((a) => a.key === step.action);
  const parts = [`${action?.emoji ?? ''} ${action?.label ?? step.action}`];
  if (step.utensil) parts.push(`— ${step.utensil}`);
  if (step.ingredients.length > 0) {
    parts.push(`[${step.ingredients.map((i) => i.name).join(', ')}]`);
  }
  if (step.description) parts.push(`— ${step.description}`);
  return parts.join(' ');
}

function createImagePlaceholder() {
  const div = el('div', '🍽️');
  div.className = 'recipe-img-placeholder';
  return div;
}

// buttons : [{ label, className, onClick }]
function renderRecipe(recipe, buttons = [], badge = null) {
  const div = el('div');
  div.className = 'recipe';
  const title = el('strong', recipe.name);
  div.append(title);
  if (recipe.imageUrl) {
    const img = el('img');
    img.src = recipe.imageUrl;
    img.alt = recipe.name;
    img.loading = 'lazy';
    img.className = 'recipe-img';
    img.onerror = () => { img.replaceWith(createImagePlaceholder()); };
    div.append(img);
  } else {
    div.append(createImagePlaceholder());
  }
  if (badge) {
    const b = el('span', badge);
    b.className = 'badge';
    div.append(b);
  }
  const ingDiv = el('div');
  ingDiv.className = 'ing-list';
  ingDiv.append(el('div', 'Ingrédients :'));
  const ul = el('ul');
  ul.className = 'ing-vertical';
  for (const ing of recipe.ingredients) {
    ul.append(el('li', formatIngredient(ing)));
  }
  ingDiv.append(ul);
  div.append(ingDiv);
  if (recipe.steps && recipe.steps.length > 0) {
    const ol = el('ol');
    ol.className = 'steps';
    for (const step of recipe.steps) {
      ol.append(el('li', formatStep(step)));
    }
    div.append(ol);
  }
  if (buttons.length > 0) {
    const actions = el('div');
    actions.className = 'recipe-actions';
    for (const { label, className, onClick } of buttons) {
      const btn = el('button', label);
      btn.className = className;
      btn.onclick = onClick;
      actions.append(btn);
    }
    div.append(actions);
  }
  return div;
}

async function refreshMyRecipes() {
  myRecipes = await api.get('/api/my/recipes');
  const container = document.getElementById('my-recipes');
  container.innerHTML = '';
  if (myRecipes.created.length === 0 && myRecipes.saved.length === 0) {
    const empty = el('p', 'Aucune recette pour l\'instant. Crée-en une dans l\'onglet "Ajout de recette" ou choisis-en dans le catalogue ci-dessous !');
    empty.className = 'picker-empty';
    container.append(empty);
  }
  for (const recipe of myRecipes.created) {
    container.append(renderRecipe(recipe, [{
      label: 'Supprimer',
      className: 'delete',
      onClick: async () => {
        await api.delete(`/api/my/recipes/${recipe.id}`);
        refreshAll();
      },
    }]));
  }
  for (const recipe of myRecipes.saved) {
    container.append(renderRecipe(recipe, [{
      label: 'Retirer de mes recettes',
      className: 'secondary',
      onClick: async () => {
        await api.delete(`/api/my/recipes/save/${recipe.id}`);
        refreshAll();
      },
    }], 'catalogue'));
  }
}

let catalogCache = [];

async function refreshCatalogRecipes() {
  catalogCache = await api.get('/api/catalog/recipes');
  renderCatalogRecipes();
}

function renderCatalogRecipes() {
  const savedIds = new Set(myRecipes.savedIds);
  const container = document.getElementById('catalog-recipes');
  container.innerHTML = '';
  if (catalogCache.length === 0) {
    const empty = el('p', 'Le catalogue est vide. Publie une recette avec la case "Publier dans le catalogue" !');
    empty.className = 'picker-empty';
    container.append(empty);
    return;
  }
  const search = normalize(document.getElementById('catalog-search').value.trim());
  const matches = (recipe) =>
    !search ||
    normalize(recipe.name).includes(search) ||
    recipe.ingredients.some((ing) => normalize(ing.name).includes(search));
  const visible = catalogCache.filter(matches);
  if (visible.length === 0) {
    const empty = el('p', 'Aucune recette ne correspond à la recherche.');
    empty.className = 'picker-empty';
    container.append(empty);
    return;
  }
  for (const recipe of visible) {
    const isSaved = savedIds.has(recipe.id);
    container.append(renderRecipe(recipe, [{
      label: isSaved ? '✓ Dans mes recettes' : '＋ Ajouter à mes recettes',
      className: 'secondary',
      onClick: async () => {
        if (isSaved) {
          await api.delete(`/api/my/recipes/save/${recipe.id}`);
        } else {
          await api.post(`/api/my/recipes/save/${recipe.id}`);
        }
        refreshAll();
      },
    }]));
  }
}

document.getElementById('catalog-search').oninput = renderCatalogRecipes;

async function refreshIngredients() {
  allIngredients = await api.get('/api/ingredients');

  // Retire de la sélection les ingrédients qui n'existent plus
  const knownIds = new Set(allIngredients.map((i) => i.id));
  for (const id of recipeSelection.keys()) {
    if (!knownIds.has(id)) recipeSelection.delete(id);
  }

  // Liste des ingrédients (onglet gestion), groupée par catégorie
  const list = document.getElementById('ingredient-list');
  list.innerHTML = '';
  for (const [category, items] of groupByCategory(allIngredients)) {
    const title = el('h3', `${category} (${items.length})`);
    title.className = 'category';
    list.append(title);
    const tags = el('div');
    tags.className = 'tags';
    for (const ing of items) {
      const tag = el('span');
      tag.className = 'tag';
      tag.append(el('span', ing.name));
      const btn = el('button', '✕');
      btn.className = 'delete';
      btn.onclick = async () => {
        await api.delete(`/api/ingredients/${ing.id}`);
        refreshAll();
      };
      tag.append(btn);
      tags.append(tag);
    }
    list.append(tags);
  }

  renderIngredientPicker();
}

// --- Formulaires ---

document.getElementById('ingredient-form').onsubmit = async (e) => {
  e.preventDefault();
  const input = document.getElementById('ingredient-name');
  const category = document.getElementById('ingredient-category');
  const error = document.getElementById('ingredient-error');
  error.textContent = '';
  try {
    await api.post('/api/ingredients', { name: input.value, category: category.value });
    input.value = '';
    refreshAll();
  } catch (err) {
    error.textContent = err.message;
  }
};

document.getElementById('recipe-form').onsubmit = async (e) => {
  e.preventDefault();
  const error = document.getElementById('recipe-error');
  error.textContent = '';
  const ingredients = [...recipeSelection.entries()].map(([id, sel]) => ({
    id,
    quantity: sel.quantity || null,
  }));
  const steps = [...document.querySelectorAll('#steps-list .step-row')].map((row) => ({
    action: row.querySelector('.step-action').value,
    utensil: row.querySelector('.step-utensil').value || null,
    description: row.querySelector('.step-desc').value,
    ingredientIds: [...row.querySelectorAll('.step-ings input:checked')].map((cb) => Number(cb.value)),
  }));
  try {
    await api.post('/api/my/recipes', {
      name: document.getElementById('recipe-name').value,
      ingredients,
      steps,
      publish: document.getElementById('recipe-publish').checked,
    });
    document.getElementById('recipe-form').reset();
    recipeSelection.clear();
    document.getElementById('steps-list').innerHTML = '';
    renderIngredientPicker();
    refreshAll();
  } catch (err) {
    error.textContent = err.message;
  }
};

function refreshAll() {
  refreshIngredients();
  refreshMyRecipes().then(refreshCatalogRecipes);
}

// --- Démarrage : session existante ? ---

(async () => {
  try {
    const me = await api.get('/api/auth/me');
    showApp(me.username);
  } catch {
    showAuth();
  }
})();
