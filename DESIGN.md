---
name: Chez Mamie
description: Une salle de restaurant vibrante dont on cuisine — un seul rouge banquette partout, or moutarde, vert basilic.
colors:
  red: "#CE3A24"
  red-panel: "#A82118"
  red-deep: "#8A1A12"
  red-dark: "#5F100B"
  cream: "#FFF6E8"
  cream-soft: "#F3D9B4"
  field: "#FFFBF2"
  ink: "#2B1A12"
  gold: "#E8A020"
  gold-bright: "#F4B23A"
  gold-soft: "#F6D9A0"
  gold-line: "rgba(246,217,160,0.45)"
  gold-line-soft: "rgba(246,217,160,0.28)"
  green: "#2F7D4F"
  green-deep: "#256842"
  green-tint: "rgba(47,125,79,0.45)"
  error: "#FFC9BD"
  placeholder: "#7A5F4A"
  tab-idle: "rgba(46,6,8,0.32)"
typography:
  brand:
    fontFamily: "'Amatic SC', 'Trebuchet MS', cursive"
    fontSize: "2.3rem"
    fontWeight: 700
    letterSpacing: "0.05em"
  brand-auth:
    fontFamily: "'Amatic SC', 'Trebuchet MS', cursive"
    fontSize: "3.1rem"
    fontWeight: 700
    letterSpacing: "0.05em"
  brand-mobile:
    fontFamily: "'Amatic SC', 'Trebuchet MS', cursive"
    fontSize: "1.9rem"
    fontWeight: 700
    letterSpacing: "0.05em"
  display:
    fontFamily: "'Lilita One', 'Trebuchet MS', sans-serif"
    fontSize: "2.1rem"
    fontWeight: 400
    letterSpacing: "0.02em"
  display-mobile:
    fontFamily: "'Lilita One', 'Trebuchet MS', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
  headline:
    fontFamily: "'Lilita One', 'Trebuchet MS', sans-serif"
    fontSize: "1.55rem"
    fontWeight: 400
  title:
    fontFamily: "'Lilita One', 'Trebuchet MS', sans-serif"
    fontSize: "1.3rem"
    fontWeight: 400
  subtitle:
    fontFamily: "'Lilita One', 'Trebuchet MS', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
  category:
    fontFamily: "'Lilita One', 'Trebuchet MS', sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    letterSpacing: "0.05em"
  icon-figure:
    fontSize: "2.5rem"
  body:
    fontFamily: "'Karla', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "'Karla', system-ui, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 800
    letterSpacing: "0.03em"
  label-small:
    fontFamily: "'Karla', system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 800
  badge-text:
    fontFamily: "'Karla', system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 800
    letterSpacing: "0.06em"
rounded:
  focus: "4px"
  choice: "6px"
  field: "8px"
  inset: "10px"
  pill: "999px"
spacing:
  page: "1.25rem"
  section-gap: "1.4rem"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.55rem 1.1rem"
  button-primary-hover:
    backgroundColor: "{colors.gold-bright}"
    textColor: "{colors.ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.gold-soft}"
    rounded: "{rounded.pill}"
  nav-tab:
    backgroundColor: "rgba(46,6,8,0.32)"
    textColor: "{colors.gold-soft}"
    border: "1.5px solid {colors.gold-line}"
    rounded: "{rounded.pill}"
    typography: "display"
  nav-tab-active:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.red-dark}"
    border: "1.5px solid {colors.gold}"
  section:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0.5rem 0.65rem"
  chip:
    backgroundColor: "{colors.green}"
    textColor: "{colors.cream}"
    rounded: "{rounded.pill}"
  badge:
    backgroundColor: "{colors.green}"
    textColor: "{colors.cream}"
    rounded: "{rounded.pill}"
---

# Design System: Chez Mamie

## Overview

**Creative North Star: "Le menu dont on cuisine"**

Chez Mamie is a vibrant restaurant dining room you cook from: one flat banquette red (#A82118) carries the whole room — ground, sections, and the auth door alike, no panels, no paper — with mustard-gold brass for service and basil green for everything fresh. The world is pinned by the product's owner — red as the background, the whole site as a friendly restaurant — and it reaches the screen the way a working app allows: through type, palette, density, and one signature move, never through re-invented controls.

The signature move is the menu line: every recipe entry sets its name in chunky display lettering and runs a dotted leader across the line to the portion count, exactly like a dish and its price on a printed menu. Section headings close with a double gold rule, the way menu sections are ruled off. The auth screen is the restaurant's door: the same flat red, straight into the room.

Density stays working-app dense; controls stay standard (pill tabs, pill buttons, familiar fields). Color does real jobs: red is the room, gold is the brass that serves, green is everything fresh from the kitchen.

**Key Characteristics:**
- One flat banquette-red ground (#A82118) edge to edge — the room itself, no panels, no paper, no page gradient
- Lilita One display lettering over a Karla text face
- Dotted-leader menu lines as the recipe list's signature
- Mustard gold for service (rules, focus, primary actions, the active tab) and basil green for freshness (ingredients, provenance, checked states)
- Deeper red insets (#8A1A12) only where a control needs a recess (ingredient picker, step rows, image placeholders)

## Colors

The palette is drenched: the red family owns ground and surfaces, gold owns service marks, green owns freshness, cream is only a voice — never a surface.

### Primary
- **Rouge Banquette** (#A82118): the page ground — the dining room itself, flat and edge to edge. Every section, the topbar, and the auth screen sit directly on it. Holds cream text at ≈6.7:1.
- **Rouge Salle** (#CE3A24): a brighter red kept only for small accents on light fields (the input caret).
- **Rouge Profond** (#8A1A12): recessed zones on the ground (ingredient picker, step rows, image placeholders).

### Secondary
- **Or Moutarde** (#E8A020): the brass — double rules under section headings, focus rings, scrollbars, text selection, primary buttons, the active tab. Always paired with dark ink when it carries text (ink on gold ≈7.4:1).
- **Or Vif** (#F4B23A): primary-button hover.
- **Or Pâle** (#F6D9A0): large secondary display text on red (sub-headings, portion counts, tab lettering), gold-tinted hairlines at 45%/28% alpha.

### Tertiary
- **Vert Basilic** (#2F7D4F): the fresh third color — ingredient tags, the « catalogue » provenance badge, checked ingredient rows (at 45% alpha), checked step chips, checkbox accent. Always carries cream text (≈4.7:1), never body paragraphs.
- **Vert Foncé** (#256842): chip borders and green-on-green edges.

### Neutral
- **Crème** (#FFF6E8): all primary text on red — a voice, never a surface.
- **Crème Atténuée** (#F3D9B4): secondary text on red (ingredient lists, help text); tinted from the cream, never gray.
- **Champ Clair** (#FFFBF2): input fields and unselected step chips — the order slip you write on, with Encre Brune text.
- **Encre Brune** (#2B1A12): text on gold and on light fields, never pure black.
- **Erreur Saumon** (#FFC9BD): error text on red (≈4.8:1 on banquette).
- **Ombre de Salle** (rgba(46,6,8,0.32), 0.5 on hover): the room's own shadow as a tint — inactive tab pills recede into it.

### Named Rules
**The Red Is the Room Rule.** Everything is the red room: one flat banquette red carries the whole page, insets go deeper still. No panel, card, or cover sits between the content and the room. No cream, white, or gray surface ever ships — cream exists only as text, and light fields only as small writing slips.
**The Gold Is a Waiter Rule.** Gold serves; it never speaks paragraphs. It appears as rules, rings, buttons, and the active tab — always with dark ink when it carries text, or as large display lettering when it speaks on red.
**The Basil Rule.** Green marks freshness and provenance: ingredients, the catalogue badge, checked states. It is always a filled mark with cream text, never a text color on red.

## Brand Asset

**Logo:** `public/logo.png` — a cartoon-grandma medallion (round glasses, hair in a bun, cream face on a gold-ringed cream circle). The brand block is a centered column: the medallion on top (3.8rem in the topbar, 5.2rem on the auth screen), the « Chez Mamie » wordmark underneath in Amatic SC 700 — the cozy hand-lettered sign of the house. The medallion also serves as the favicon. Generated with openrouter/microsoft/mai-image-2.7 (2026-11-25), circular-cropped to transparency and palette-quantized with ImageMagick; 512×512, ~60 Ko.

## Typography

**Display Font:** Lilita One (with 'Trebuchet MS' fallback) — self-hosted OFL woff2 in `public/fonts/`
**Brand Font:** Amatic SC 700 (with 'Trebuchet MS' fallback) — self-hosted OFL woff2 in `public/fonts/` — only for the « Chez Mamie » wordmark
**Body Font:** Karla variable 200–800 (with system-ui fallback) — self-hosted OFL woff2 in `public/fonts/`

**Character:** Amatic SC is the hand-painted sign above the door — tall, narrow, cozy capitals for the brand name alone. Lilita One is the restaurant's painted lettering — round, plump, unhurried; Karla is the waiter's clear handwriting for everything functional. Weights in Karla do the emphasis work (700/800), since Lilita One exists only at 400.

### Hierarchy
- **Brand** (Amatic SC 700, 2.3rem, 0.05em tracking): the « Chez Mamie » wordmark under the medallion, centered; 3.1rem on the auth screen, 1.9rem on mobile.
- **Headline** (400, 1.55rem): section headings in Or Moutarde, closed by a 4px double gold rule.
- **Title** (400, 1.3rem): recipe names in menu lines, in Crème; 1.25rem in Or Pâle for sub-headings; category labels at 1.05rem uppercase with 0.05em tracking.
- **Body** (400, 1rem, 1.45): all functional text on red.
- **Label** (800, 0.92rem, 0.03em): buttons, tags, badges (badges uppercase at 0.72rem).

### Named Rules
**The Two Voices Rule.** Display lettering speaks names and sections; Karla speaks everything actionable. A button or a paragraph never gets the display face, a recipe name never gets the body face.

## Layout

Single column, max-width 1000px, page padding 1.25rem. The topbar (brand + user) sits directly on the red ground; the five tabs (Mes recettes, Catalogue, Gestion de recettes, Gestion des ingrédients, Liste de courses) form a right-aligned pill row on the red ground just under it, and the active section's content lies directly on the same ground — no panel, rim, or shadow in between. Section headings take more space above than below; recipe entries separate with dashed gold-tinted rules, not boxes. On desktop (≥768px) each recipe entry composes in three columns under its menu line — framed photo left, ingredients middle, preparation right — the columns ruled apart by a 4px double gold vertical line (the horizontal section rule turned upright). Ingredient pickers use an auto-fill grid (minmax 220px). Below 768px the recipe columns stack (photo, ingredients, steps) and the vertical rules lift; below 640px: page padding 0.8rem, tabs wrap two-per-row, the brand takes its own line.

## Elevation & Depth

Depth is soft, low, and rare: the room is flat, so shadow belongs only to small interactive things — buttons carry a small soft shadow that deepens on hover with a 1px lift, and recipe photos a light framed float, all in a dark-red (never neutral-black) tone. No hard offset block shadows, no glass.

### Shadow Vocabulary
- **Button rest** (`box-shadow: 0 3px 10px rgba(46,6,8,0.3)`), **Button hover** (`0 5px 14px rgba(46,6,8,0.35)` + `translateY(-1px)`).
- **Framed photo** (`box-shadow: 0 4px 12px rgba(46,6,8,0.18)`): recipe images on the red ground.

### Named Rules
**The Soft Landing Rule.** Every shadow carries an offset and a blur in the red-dark hue; a zero-blur block shadow never ships.

## Shapes

Pills for anything clickable-small (buttons, tabs, tags, chips, badges); 8–10px radii for fields and insets. Separators are dashed or dotted (menu leaders, entry rules), never solid hairlines.

## Components

### Buttons
- **Shape:** pill (999px radius)
- **Primary:** Or Moutarde background, Encre Brune text, Label typography (800, 0.03em tracking), soft shadow with a 1px hover lift to Or Vif.
- **Ghost (secondary/delete):** transparent with a 1.5px border — gold-tinted with Or Pâle text for neutral actions, cream-tinted with Crème text for destructive ones; fills with a translucent tint on hover.
- **Focus:** 3px gold outline, 2px offset, everywhere.

### Chips (tags)
- **Style:** Vert Basilic background, Vert Foncé border, Crème 700 text, pill.
- **State:** step-ingredient chips start as light slips (Champ Clair, gold-tinted border, Encre Brune) and turn Vert Basilic with Crème text when checked.

### Cards / Containers
- **Sections:** no cards — content lies directly on the flat Rouge Banquette ground, transparent, unpadded.
- **Insets:** recessed controls (ingredient picker, step rows, image placeholders) in Rouge Profond with a gold-tinted 1–1.5px border and a 10px radius.

### Inputs / Fields
- **Style:** 1.5px gold-tinted border, Champ Clair background, 8px radius; placeholder in #7A5F4A.
- **Focus:** gold border plus a 3px gold ring at 35% opacity; caret in Rouge Salle.

### Navigation
- Pill tabs on the red ground, right-aligned under the topbar: inactive tabs translucent dark-red with a 1.5px gold-tinted border and Or Pâle display lettering; the active tab turns Or Moutarde with Rouge Foncé (#5F100B) lettering and a soft button shadow. Mobile: two-per-row pills.

### Menu Line (signature)
- **Style:** recipe name in Title display type (Crème), dotted 2px leader (40% Or Pâle) running to the portion count in Or Pâle; name and count carry a Rouge Banquette background to cut the dots. Entries separate with a 1px dashed gold-tinted rule.
- **Composition (desktop):** under the menu line, a three-column grid (210px photo | ingredients | preparation) divided by 4px double gold vertical rules; each text column opens with its small label (« Ingrédients : », « Préparation : »); action buttons close the entry full-width. Mobile stacks the columns.

### Auth Screen
- The door into the restaurant stands directly in the room: same flat red ground, no card, no frame — a centered 440px column with the brand in Display type and the Connexion / Inscription headings ruled in double gold.

## Do's and Don'ts

### Do:
- **Do** keep every surface in the red family — one flat banquette ground, deep insets; cream is only ever text.
- **Do** write headings in Lilita One and close them with the 4px double gold rule.
- **Do** reserve gold for rules, focus, primary actions, and the active tab — always with dark ink when it carries text.
- **Do** reserve green for freshness marks (ingredients, provenance badge, checked states) — always as a filled mark with cream text.
- **Do** tint secondary text from the cream (#F3D9B4), never neutral gray.
- **Do** theme browser surfaces from the palette (selection, caret, scrollbars, focus rings, `accent-color` in Vert Basilic).

### Don't:
- **Don't** put cream, white, or gray panels on the red ground — the room is red or it isn't this design.
- **Don't** use gold or green as body-text color on red (gold speaks only large, green never speaks; both are marks, not voices).
- **Don't** ship hard offset block shadows or solid hairline separators — shadows are soft, separators are dashed or dotted.
- **Don't** re-invent controls in the restaurant's image: tabs, inputs, and buttons stay standard and scannable; the world lives in type, palette, density, and the dotted leader.
