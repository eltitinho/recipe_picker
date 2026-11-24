---
version: 1
slug: "public-index-html"
primary_target: "public/index.html"
related_targets: ["public/app.js"]
---

# Surface brief — Recipe Picker app shell (public/index.html, public/app.js)

## Scope & mode
Whole web app (auth screen + 4 tabs: Sélection de recettes, Gestion de recettes, Gestion des ingrédients, Liste de courses). Mode: **Operate**. Full redesign of the visual world; all function, ids, classes, copy, and JS behavior preserved.

## Audience / job / constraints
French-speaking home cooks; ingredient-first recipe picking and shopping-list generation. Vanilla HTML/CSS/JS, no build step; styles live inline in `index.html`; recipe rows are generated in `app.js` (`.recipe > strong + .servings + img/.recipe-img-placeholder + .badge + .ing-list + ol.steps + .recipe-actions`).

## Direction contract

THESIS: the app is a vibrant French restaurant menu you cook from — a red room with cream menu paper — refusing the generic light-gray SaaS panel the old build shipped.

OWN-WORLD: saturated red page ground (#C1272D family, subtle vignette + faint tablecloth gingham), cream menu-paper panels (#FFF7EA), dark brown ink (#2B1A12), mustard-gold accents (#E8A020) for selection, badges, rules, and focus. Display face Lilita One (brand, headings, tabs) over a clean sans body. Signature move: each recipe entry is a menu line — dish name in display type with a dotted leader running to the portion count, entries separated like menu items, section heads closed by a double menu rule.

STORY: the cook opens the menu, picks what they have, and leaves with tonight's dish and a shopping list; the red room makes the tool feel like a place you eat, not a database.

FIRST VIEWPORT: red ground edge to edge; topbar with 🍳 Recipe Picker in cream display type with a gold flourish and a ghost Déconnexion button; four folder tabs (cream active, translucent dark-red inactive) opening onto a cream menu-paper panel whose first section is « Mes recettes », each entry a dotted-leader menu line. Primary action per tab stays the standard control (buttons, tabs, inputs — nothing re-invented).

FORM: seed: none (pinned) — « The main color will be red mainly as a background. The website desing should look like a vibrant restaurant menu. » The world (vibrant restaurant menu) and its dominant material (red background) are pinned by the brief; within Operate mode it lends type, palette, density, and one signature move while navigation and controls stay standard.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
