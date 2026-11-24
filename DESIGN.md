---
name: Recipe Picker
description: Un menu de restaurant vibrant dont on cuisine — fond rouge, papier crème, encre brune, or moutarde.
colors:
  red: "#C1272D"
  red-bright: "#C83138"
  red-btn: "#A91F24"
  red-deep: "#8F1A1F"
  red-dark: "#6E1418"
  paper: "#FFF7EA"
  paper-soft: "#FCEED6"
  paper-input: "#FFFBF2"
  ink: "#2B1A12"
  ink-soft: "#6B5445"
  gold: "#E8A020"
  gold-soft: "#F6D9A0"
  gold-line: "#D9B36C"
  border-soft: "#E4CFA8"
  placeholder: "#7A5F4A"
typography:
  display:
    fontFamily: "'Lilita One', 'Trebuchet MS', sans-serif"
    fontWeight: 400
    letterSpacing: "0.02em"
  headline:
    fontFamily: "'Lilita One', 'Trebuchet MS', sans-serif"
    fontSize: "1.55rem"
    fontWeight: 400
  title:
    fontFamily: "'Lilita One', 'Trebuchet MS', sans-serif"
    fontSize: "1.3rem"
    fontWeight: 400
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
rounded:
  field: "8px"
  inset: "10px"
  panel: "12px"
  cover: "16px"
  pill: "999px"
spacing:
  page: "1.25rem"
  panel: "1.4rem 1.6rem 1.6rem"
  section-gap: "1.4rem"
components:
  button-primary:
    backgroundColor: "{colors.red-btn}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0.55rem 1.1rem"
  button-primary-hover:
    backgroundColor: "{colors.red-deep}"
    textColor: "{colors.paper}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
  nav-tab:
    backgroundColor: "rgba(46,6,8,0.38)"
    textColor: "#F3D9B0"
    rounded: "10px 10px 0 0"
    typography: "display"
  nav-tab-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.red-deep}"
  panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel}"
  input:
    backgroundColor: "{colors.paper-input}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0.5rem 0.65rem"
  chip:
    backgroundColor: "{colors.gold-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  badge:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
---

# Design System: Recipe Picker

## Overview

**Creative North Star: "Le menu dont on cuisine"**

Recipe Picker is a vibrant restaurant menu you cook from: a saturated red room, cream menu paper, dark brown ink, mustard-gold service marks. The world is pinned by the product's owner — red as the background, the whole site as a restaurant menu — and it reaches the screen the way a working app allows: through type, palette, density, and one signature move, never through re-invented controls.

The signature move is the menu line: every recipe entry sets its name in chunky display lettering and runs a dotted leader across the line to the portion count, exactly like a dish and its price on a printed menu. Section headings close with a double gold rule, the way menu sections are ruled off. The auth screen is the menu's cover: cream card, thin gold inner frame.

Density stays working-app dense; controls stay standard (folder tabs, pill buttons, familiar fields). Color does real jobs: red is the room, cream is the paper, gold marks selection, badges, rules, and focus.

**Key Characteristics:**
- Saturated red page ground with a warm top glow and a darker foot (never a neutral app gray)
- Cream menu-paper panels carrying all work surfaces
- Lilita One display lettering over a Karla text face
- Dotted-leader menu lines as the recipe list's signature
- Mustard gold reserved for service marks: rules, selection, badges, focus

## Colors

The palette is drenched: the red family owns the ground, cream owns the work surfaces, gold owns the accents.

### Primary
- **Rouge Salle** (#C1272D): the page ground — the restaurant room. Runs as a vertical gradient from bright (#C83138) at the top to deep (#8F1A1F) at the foot, with a warm radial glow at the top and a dark vignette at the foot.
- **Rouge Service** (#A91F24): primary buttons, checked chips, error text on paper. Dark enough to hold cream text at ≥7:1.

### Secondary
- **Or Moutarde** (#E8A020): the waiter’s mark — double rules under section headings, focus rings, badges, scrollbars, text selection. Never body text on cream (2:1); always paired with dark ink or used as a non-text mark.
- **Or Pâle** (#F6D9A0): chip backgrounds, the current-user name on the red bar.

### Neutral
- **Papier Menu** (#FFF7EA): panels, auth card, and all text that sits directly on the red ground.
- **Papier Inset** (#FCEED6): recessed zones inside panels (ingredient picker, step rows).
- **Papier Champ** (#FFFBF2): input fields.
- **Encre Brune** (#2B1A12): primary text on paper — printed menu ink, never pure black.
- **Encre Atténuée** (#6B5445): secondary text on paper (ingredient lists, help text); tinted from the brown, never gray.
- **Bordure Sable** (#E4CFA8): field borders, dashed separators between menu entries.

### Named Rules
**The Red Is the Room Rule.** The red ground owns everything outside the panels; work surfaces never carry the red as a full-bleed background, and panels never turn gray or white-neutral — the paper is always cream.
**The Gold Is a Waiter Rule.** Gold serves; it never speaks paragraphs. It appears as rules, rings, chips, and badges, always with dark ink when it carries text.

## Typography

**Display Font:** Lilita One (with 'Trebuchet MS' fallback) — self-hosted OFL woff2 in `public/fonts/`
**Body Font:** Karla variable 200–800 (with system-ui fallback) — self-hosted OFL woff2 in `public/fonts/`

**Character:** Lilita One is the menu's painted lettering — round, plump, unhurried; Karla is the waiter’s clear handwriting for everything functional. Weights in Karla do the emphasis work (700/800), since Lilita One exists only at 400.

### Hierarchy
- **Display** (400, 2.1rem, balance): the 🍳 Recipe Picker brand on the red bar; 2.2rem on the auth cover.
- **Headline** (400, 1.55rem): section headings on paper, closed by a 4px double gold rule.
- **Title** (400, 1.3rem): recipe names in menu lines; 1.25rem for in-panel sub-headings; category labels at 1.05rem uppercase with 0.05em tracking.
- **Body** (400, 1rem, 1.45): all functional text on paper.
- **Label** (800, 0.92rem, 0.03em): buttons, tags, badges (badges uppercase at 0.72rem).

### Named Rules
**The Two Voices Rule.** Display lettering speaks names and sections; Karla speaks everything actionable. A button or a paragraph never gets the display face, a recipe name never gets the body face.

## Layout

Single column, max-width 1000px, page padding 1.25rem. The topbar (brand + user) sits directly on the red ground; four folder tabs open onto one cream panel (`border-radius: 0 12px 12px 12px`, the active tab merging into it). Panels pad at 1.4–1.6rem; section headings take more space above than below; recipe entries separate with dashed sandy rules, not boxes. Ingredient pickers use an auto-fill grid (minmax 220px). Below 640px: page padding 0.8rem, tabs wrap two-per-row as rounded pills, the brand takes its own line, panels pad at ~1rem.

## Elevation & Depth

Depth is soft and low: panels and the auth cover float over the red room with offset, blurred shadows in a dark-red (never neutral-black) tone; buttons carry a small soft shadow that deepens on hover with a 1px lift. No hard offset block shadows, no glass.

### Shadow Vocabulary
- **Panel float** (`box-shadow: 0 14px 34px rgba(46,6,8,0.4)`): every cream panel over the red ground.
- **Cover float** (`box-shadow: 0 22px 55px rgba(46,6,8,0.5)`): the auth menu-cover.
- **Button rest** (`box-shadow: 0 3px 10px rgba(46,6,8,0.3)`), **Button hover** (`0 5px 14px rgba(46,6,8,0.35)` + `translateY(-1px)`).
- **Framed photo** (`box-shadow: 0 4px 12px rgba(46,6,8,0.18)`): recipe images inside panels.

### Named Rules
**The Soft Landing Rule.** Every shadow carries an offset and a blur in the red-dark hue; a zero-blur block shadow never ships.

## Shapes

Pills for anything clickable-small (buttons, tags, chips, badges); 8–10px radii for fields and insets; 12px for panels; 16px for the menu cover. Separators are dashed or dotted (menu leaders, entry rules), never solid hairlines. The auth cover carries a thin double-stroke gold inner frame (2px at 65% gold, inset 10px).

## Components

### Buttons
- **Shape:** pill (999px radius)
- **Primary:** Rouge Service background, Papier text, Label typography (800, 0.03em tracking), soft shadow with a 1px hover lift
- **Ghost (secondary/delete):** transparent with a 1.5px border — brown for neutral actions, Rouge Service for destructive ones; fills on hover. On the red bar the ghost flips to cream border/text.
- **Focus:** 3px gold outline, 2px offset, everywhere.

### Chips (tags)
- **Style:** Or Pâle background, gold-line border, Encre Brune 700 text, pill.
- **State:** step-ingredient chips invert to Rouge Service with Papier text when checked.

### Cards / Containers
- **Corner Style:** 12px gently rounded; square top-left where the active tab merges.
- **Background:** Papier Menu; insets in Papier Inset with a sandy 1.5px border.
- **Shadow Strategy:** Panel float (see Elevation).
- **Internal Padding:** 1.4–1.6rem.

### Inputs / Fields
- **Style:** 1.5px sandy border, Papier Champ background, 8px radius; placeholder in #7A5F4A.
- **Focus:** gold border plus a 3px gold ring at 30% opacity; caret in Rouge Service.

### Navigation
- Folder tabs on the red ground: inactive tabs translucent dark-red with #F3D9B0 display lettering; the active tab turns Papier with Rouge Service lettering and merges into the panel. Mobile: two-per-row rounded tabs.

### Menu Line (signature)
- **Style:** recipe name in Title display type, dotted 2px leader (45% Encre Atténuée) running to the right-floated portion count; name and count carry a Papier background to cut the dots. Entries separate with a 1px dashed sandy rule.

### Auth Cover
- Cream 16px card, Cover float shadow, thin gold inner frame, brand in Display type; the door into the restaurant.

## Do's and Don'ts

### Do:
- **Do** keep every work surface on cream paper over the red ground.
- **Do** write headings in Lilita One and close them with the 4px double gold rule.
- **Do** reserve gold for rules, selection, badges, and focus — always with dark ink when it carries text.
- **Do** tint secondary text from the brown ink (#6B5445), never neutral gray.
- **Do** theme browser surfaces from the palette (selection, caret, scrollbars, focus rings, `accent-color`).

### Don't:
- **Don't** put neutral white or gray panels on the red ground — paper is cream or it isn't this design.
- **Don't** use gold as body-text color on cream (fails contrast; gold is a mark, not a voice).
- **Don't** ship hard offset block shadows or solid hairline separators — shadows are soft, separators are dashed or dotted.
- **Don't** re-invent controls in the menu's image: tabs, inputs, and buttons stay standard and scannable; the world lives in type, palette, density, and the dotted leader.
