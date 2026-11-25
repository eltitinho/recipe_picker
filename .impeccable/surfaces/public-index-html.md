---
version: 1
slug: "public-index-html"
primary_target: "public/index.html"
related_targets: ["public/app.js"]
---

# Surface brief — Chez Mamie app shell (public/index.html, public/app.js)

## Scope & mode
Whole web app (auth screen + 5 tabs whose chips read « Mes plats » (Mes recettes), « Les recettes de mamie » (Catalogue), « Mamie invente une recette » (Gestion de recettes), « Les petites mains » (Liste de courses), and « Le petit enfant » (user chip hiding Gestion des ingrédients + Déconnexion); each chip reveals its former name on hover). Mode: **Operate**. All function, ids, classes, copy, and JS behavior preserved; the tab split moved existing DOM only (`tab-selection` → `tab-my-recipes` + `tab-catalog`).

## Audience / job / constraints
French-speaking home cooks; ingredient-first recipe picking and shopping-list generation. Vanilla HTML/CSS/JS, no build step; styles live inline in `index.html`; recipe rows are generated in `app.js` (`.recipe > strong + .servings + img/.recipe-img-placeholder + .badge + .ing-list + ol.steps + .recipe-actions`).

## Direction contract

THESIS: the app is the dining room itself — one flat banquette-red room where every surface is the same red — refusing panels, cards, the old cream menu paper, and the generic light-gray SaaS panel. Lighter means no container at all: you are directly in the red.

OWN-WORLD: one flat banquette-red ground (#A82118) edge to edge carrying everything (topbar, tabs, sections, auth screen — no panel, rim, or page gradient), deeper insets (#8A1A12) only for recessed controls, cream as text only (#FFF6E8), mustard-gold brass (#E8A020) for rules, focus, primary buttons and the active tab, and basil green (#2F7D4F) — the third color — for freshness: ingredient tags, the catalogue provenance badge, checked states, checkbox accent. Lilita One display over Karla body. Signature move unchanged: the dotted-leader menu line (cream name, gold-soft count) over a three-column spread ruled by double gold verticals.

STORY: the cook walks into the red room, opens their recipes or the house catalogue (now separate rooms), picks tonight's dish, and leaves with a shopping list; the room feels like a friendly trattoria, not a database.

FIRST VIEWPORT: flat red ground edge to edge; a centered top bar of hand-lettered Amatic SC chips — painted words straight on the red, active chip underlined in gold, hover reveals the former name in a small Or Pâle caption; below it the centered brand sign (cartoon-grandma medallion above « Chez Mamie »); then the « Mes recettes » gold heading closed by a double gold rule sits directly on the ground, each entry a dotted-leader menu line over the three-column spread. Primary action per tab stays the standard control.

FORM: seed: none (pinned) — « The kind of beige background should be removed and we should be directly into the red background. Find a more vibrant red that makes us feel in a very friendly restaurant. My recipies should be in another tab than the catalogue. Add a third color that goes well with these two (gold and red). » The world (friendly restaurant, all-red room) and the tab split are pinned by the brief; the third color (basil green) was chosen for the classic red-gold-green trattoria triad and the ingredient/freshness semantics.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
