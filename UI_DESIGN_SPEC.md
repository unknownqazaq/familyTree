# Genealogy Platform  —  UI Design Specification
### Developer Journey Map Approach

> **Project:** National / Educational / Cultural Genealogy Platform
> **Spirit:** Inspired by tumalas.kz — trustworthy, institutional, structured
> **Stack:** Vue 3 + Vite, vis-network, Pinia, Gin (Go) backend
> **Design-first:** Desktop-first, mobile-adaptable

---

## Table of Contents

1. [Design System & UI Kit](#1-design-system--ui-kit)
2. [Stage 1 — Discovery & Entry](#2-stage-1--discovery--entry)
3. [Stage 2 — Search & Exploration](#3-stage-2--search--exploration)
4. [Stage 3 — Core Interaction (Tree View)](#4-stage-3--core-interaction-tree-view)
5. [Stage 4 — Deep Dive (Person Profile)](#5-stage-4--deep-dive-person-profile)
6. [Stage 5 — Contribution & Moderation](#6-stage-5--contribution--moderation)
7. [Figma Page Structure](#7-figma-page-structure)
8. [Component Hierarchy](#8-component-hierarchy)

---

## 1. Design System & UI Kit

### 1.1 Color Palette

```
PRIMARY PALETTE
─────────────────────────────────────────────────────────
Brand Primary     #1A5276    Deep teal-blue — headers, primary actions
Brand Light       #2980B9    Lighter blue — links, hover states
Brand Accent      #C9A96E    Cultural gold — accent borders, highlights, ornamental elements
Brand Accent Dark #A67C52    Muted gold — hover state for accent elements

NEUTRAL PALETTE
─────────────────────────────────────────────────────────
Charcoal          #1C2833    Headings, high-emphasis text
Dark Gray         #2C3E50    Body text, secondary headings
Medium Gray       #5D6D7E    Captions, descriptions
Light Gray        #AEB6BF    Placeholder text, disabled states
Border            #D5D8DC    Card borders, dividers
Background Light  #EAECEE    Section backgrounds, zebra rows
Page Background   #F4F6F7    Body background
White             #FFFFFF    Cards, containers, inputs

STATUS COLORS
─────────────────────────────────────────────────────────
Success           #1E8449    Published/approved badges, success messages
Success Light     #D5F5E3    Badge backgrounds
Warning           #B7950B    Pending/private badges, attention states
Warning Light     #FEF9E7    Badge backgrounds
Error             #C0392B    Errors, delete actions
Error Light       #FADBD8    Error message backgrounds
Info              #2471A3    Informational badges, tooltips
Info Light        #D4E6F1    Info badge backgrounds
```

### 1.2 Typography

```
FONT STACK
─────────────────────────────────────────────────────────
Primary:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Monospace:  'JetBrains Mono', 'Fira Code', monospace  (for IDs, dates, technical data)

TYPE SCALE
─────────────────────────────────────────────────────────
Display     40px / 48px line-height / 700 weight    — Hero headlines only
H1          32px / 40px / 700                        — Page titles
H2          24px / 32px / 600                        — Section headers
H3          18px / 26px / 600                        — Card titles, subsections
H4          16px / 24px / 600                        — Inline headings, labels
Body        15px / 24px / 400                        — Default paragraph text
Body Small  14px / 20px / 400                        — Secondary descriptions, metadata
Caption     12px / 16px / 500                        — Badges, timestamps, auxiliary info
Overline    11px / 16px / 600 / UPPERCASE / 0.08em   — Section labels, category tags
```

### 1.3 Spacing System (8px grid)

```
──────────────────────────
4px    xs     Inner padding for tight elements (badges)
8px    sm     Gap between inline elements
12px   md     Internal card padding (compact), label-to-input
16px   lg     Default gap between sibling elements
20px   xl     Section inner padding
24px   2xl    Card padding
32px   3xl    Section gap
48px   4xl    Major section separation
64px   5xl    Hero section vertical padding
```

### 1.4 Border Radius

```
──────────────────────────
2px    Sharp      — Badges, tags
4px    Default    — Buttons, inputs
8px    Rounded    — Cards, panels
12px   Soft       — Modal dialogs, image containers
16px   Pill       — Full rounded (search bar, toggle pills)
50%    Circle     — Avatars, icon buttons
```

### 1.5 Elevation / Shadows

```
──────────────────────────
Level 0    none                                        — Flat elements
Level 1    0 1px 3px rgba(0,0,0,0.06)                  — Default cards
Level 2    0 2px 8px rgba(0,0,0,0.08)                  — Hovered cards, dropdowns
Level 3    0 4px 16px rgba(0,0,0,0.10)                 — Modals, floating panels
Level 4    0 8px 32px rgba(0,0,0,0.12)                 — Overlay dialogs
```

### 1.6 UI Kit — Core Components

#### Buttons

```
┌─────────────────────────────────────────────────────────────────┐
│  BUTTON VARIANTS                                                 │
│                                                                   │
│  Primary:     bg #1A5276  text white  hover #154360               │
│  Secondary:   bg transparent  border #D5D8DC  text #2C3E50       │
│               hover bg #EAECEE                                    │
│  Accent:      bg #C9A96E  text white  hover #A67C52               │
│  Success:     bg #1E8449  text white  hover #196F3D               │
│  Danger:      bg #C0392B  text white  hover #A93226               │
│  Ghost:       bg transparent  text #2980B9  hover bg #D4E6F1      │
│                                                                   │
│  SIZES                                                            │
│  Small:    h 32px  px 12px  font 13px  radius 4px                │
│  Medium:   h 40px  px 20px  font 14px  radius 4px   (default)   │
│  Large:    h 48px  px 28px  font 15px  radius 6px                │
│                                                                   │
│  STATES                                                           │
│  Disabled:  opacity 0.5  cursor not-allowed                       │
│  Loading:   spinner icon left  text "Loading…"                    │
│  Focus:     2px ring offset 2px  ring color brand-light/40%       │
└─────────────────────────────────────────────────────────────────┘
```

#### Inputs

```
┌─────────────────────────────────────────────────────────────────┐
│  TEXT INPUT                                                       │
│  Height: 40px  Padding: 8px 12px  Border: 1px #D5D8DC            │
│  Radius: 4px  Font: 14px  Placeholder color: #AEB6BF             │
│                                                                   │
│  Focus:  border #2980B9  ring 0 0 0 2px rgba(41,128,185,0.15)    │
│  Error:  border #C0392B  ring 0 0 0 2px rgba(192,57,43,0.15)     │
│  With icon: padding-left 40px  icon 16px positioned left 12px    │
│                                                                   │
│  SEARCH INPUT (special)                                           │
│  Height: 48px  Radius: 16px (pill)  Left icon: magnifying glass  │
│  Background: white  Shadow: Level 2                               │
│                                                                   │
│  TEXTAREA                                                         │
│  Min height: 100px  Resize: vertical  Same border/focus as input  │
│                                                                   │
│  SELECT                                                           │
│  Same styling as text input  Custom chevron icon right 12px       │
└─────────────────────────────────────────────────────────────────┘
```

#### Cards

```
┌─────────────────────────────────────────────────────────────────┐
│  DEFAULT CARD                                                     │
│  Background: white  Padding: 24px  Radius: 8px                   │
│  Border: 1px solid #EAECEE  Shadow: Level 1                      │
│  Hover (if interactive): Shadow Level 2, border #D5D8DC          │
│                                                                   │
│  COMPACT CARD                                                     │
│  Padding: 16px  — for list items, search results                  │
│                                                                   │
│  FEATURED CARD                                                    │
│  Same as default + top border: 3px solid #C9A96E (gold accent)   │
│                                                                   │
│  STAT CARD                                                        │
│  Center-aligned  Number: Display font  Label: Caption/Overline   │
│  Optional accent left border: 3px solid #1A5276                   │
└─────────────────────────────────────────────────────────────────┘
```

#### Badges

```
┌─────────────────────────────────────────────────────────────────┐
│  STATUS BADGES                                                    │
│  Radius: 2px  Padding: 2px 8px  Font: Caption (12px 500)         │
│                                                                   │
│  Public:     bg #D5F5E3  text #1E8449  border none                │
│  Private:    bg #FEF9E7  text #B7950B  border none                │
│  Pending:    bg #FEF9E7  text #B7950B  dot indicator left         │
│  Approved:   bg #D5F5E3  text #1E8449  check icon left            │
│  Rejected:   bg #FADBD8  text #C0392B  x icon left                │
│                                                                   │
│  ROLE BADGES                                                      │
│  Admin:      bg #1A5276  text white                               │
│  Staff:      bg #2980B9  text white                               │
│  User:       bg #EAECEE  text #5D6D7E                             │
└─────────────────────────────────────────────────────────────────┘
```

#### Icons

```
Use Lucide Icons (MIT license, consistent 24px grid, 1.5px stroke)
Key icons needed:
  Search, User, Users, TreePine, ChevronDown, ChevronRight,
  Plus, Edit, Trash2, Eye, EyeOff, Check, X, Clock,
  Shield, ShieldCheck, Download, Upload, RefreshCw,
  ZoomIn, ZoomOut, Maximize2, Move, Info, AlertTriangle,
  Link, ExternalLink, Home, Settings, LogOut, Menu
```

---

## 2. Stage 1 — Discovery & Entry

### User Needs
- Understand what this platform is within 5 seconds
- Feel institutional trust (not a startup or hobby project)
- Find a person or start exploring immediately
- See evidence of data richness (statistics)

### Friction Points (current)
- Current hero is generic ("Family Tree" + one sentence)
- No statistics or social proof
- No cultural identity — feels like a template
- Search is buried inside the tree page, not on landing

---

### 2.1 Header / Navigation Bar

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ┌────────┐                                                                  │
│  │ LOGO   │  Шежіре                    Tree    About    │  🔍  Login  │      │
│  │ icon   │  Genealogy Platform                          │             │      │
│  └────────┘                                                                  │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│  bg: white    height: 64px    shadow: Level 1    max-width: 1280px centered  │
│  brand: #1A5276 text + tree/ornament icon left                               │
│  nav links: Body Small 14px, #5D6D7E, active: #1A5276 + 600 weight          │
│  active indicator: 2px bottom border #C9A96E (gold)                          │
│                                                                              │
│  LOGGED IN STATE:                                                            │
│  ... Tree  About  Moderation* Admin*  │ UserAvatar  ▾ dropdown               │
│  Dropdown: Settings, Logout                                                  │
│  * visible by role                                                           │
│                                                                              │
│  MOBILE (< 768px):                                                           │
│  Logo + Hamburger menu → slide-in drawer from right                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Home Page — Hero Section

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌────────────────────────── HERO AREA ────────────────────────────┐         │
│  │                                                                  │         │
│  │  bg: subtle topographic/ornamental pattern at 3% opacity         │         │
│  │  OR: gradient from #F4F6F7 to #EAECEE with faint cultural motif  │         │
│  │                                                                  │         │
│  │             ┌─ gold accent line (2px, 60px wide) ─┐              │         │
│  │                                                                  │         │
│  │                    Discover Your Roots                           │         │
│  │           (Display 40px / 700 / #1C2833 / center)               │         │
│  │                                                                  │         │
│  │       Explore the genealogical heritage of our people.           │         │
│  │    Search through thousands of family records spanning           │         │
│  │              generations and regions.                             │         │
│  │        (Body 15px / #5D6D7E / center / max-w 560px)             │         │
│  │                                                                  │         │
│  │  ┌──────────────────────────────────────────────────────────┐    │         │
│  │  │  🔍  Search by name, clan, or region...                  │    │         │
│  │  │                                                          │    │         │
│  │  │  Height: 52px  Width: 600px max  Radius: 16px (pill)    │    │         │
│  │  │  Shadow: Level 2  bg: white  icon: #AEB6BF              │    │         │
│  │  │  On typing: live autocomplete dropdown appears below     │    │         │
│  │  └──────────────────────────────────────────────────────────┘    │         │
│  │                                                                  │         │
│  │        [ Explore Full Tree ]    [ How It Works ]                 │         │
│  │        (Primary Large btn)      (Secondary Large btn)            │         │
│  │                                                                  │         │
│  │  Vertical padding: 64px top, 48px bottom                        │         │
│  └──────────────────────────────────────────────────────────────────┘         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Home Page — Statistics Bar

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌─── STATS STRIP ──────────────────────────────────────────────────┐        │
│  │                                                                   │        │
│  │  bg: #1A5276 (brand primary)  text: white  py: 32px              │        │
│  │  Full width, content max-width 1280px centered                    │        │
│  │                                                                   │        │
│  │    ┌───────────┐    ┌───────────┐    ┌───────────┐               │        │
│  │    │  12,450    │    │   3,200   │    │    890    │               │        │
│  │    │  People    │    │  Families │    │ Requests  │               │        │
│  │    │  in system │    │  mapped   │    │ this month│               │        │
│  │    └───────────┘    └───────────┘    └───────────┘               │        │
│  │                                                                   │        │
│  │  Number: 32px / 700 / white                                       │        │
│  │  Label:  12px / 500 / rgba(white, 0.7) / UPPERCASE               │        │
│  │  Dividers: 1px solid rgba(white, 0.15) between columns           │        │
│  │  Layout: flex, justify space-evenly, 3 columns                    │        │
│  │                                                                   │        │
│  └───────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.4 Home Page — Feature Cards

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  Section heading: "How It Works" (H2, centered, mb 32px)                     │
│  Overline above: "PLATFORM FEATURES" (#C9A96E, 11px, uppercase)             │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                       │
│  │   ┌──────┐   │  │   ┌──────┐   │  │   ┌──────┐   │                       │
│  │   │ ICON │   │  │   │ ICON │   │  │   │ ICON │   │                       │
│  │   │ 48px │   │  │   │ 48px │   │  │   │ 48px │   │                       │
│  │   │ #1A  │   │  │   │ #C9  │   │  │   │ #1A  │   │                       │
│  │   └──────┘   │  │   └──────┘   │  │   └──────┘   │                       │
│  │              │  │              │  │              │                       │
│  │  Visual Tree │  │    Find     │  │ Collaborative │                       │
│  │   Explorer   │  │ Connections │  │   Editing    │                       │
│  │              │  │              │  │              │                       │
│  │  Interactive  │  │ Trace the   │  │ Community-   │                       │
│  │  hierarchical │  │ path between│  │ driven with  │                       │
│  │  tree with    │  │ any two     │  │ moderation   │                       │
│  │  zoom & pan.  │  │ people.     │  │ workflow.    │                       │
│  │              │  │              │  │              │                       │
│  │ top-border:   │  │ top-border:  │  │ top-border:  │                       │
│  │ 3px #C9A96E  │  │ 3px #C9A96E │  │ 3px #C9A96E │                       │
│  └──────────────┘  └──────────────┘  └──────────────┘                       │
│                                                                              │
│  Grid: 3 columns, 24px gap, max-width 960px centered                        │
│  Icon container: 64px circle, bg #EAECEE, icon color #1A5276                │
│  Title: H3 18px center, Description: Body Small 14px center #5D6D7E         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.5 Home Page — Call to Action Footer

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌─── CTA STRIP ────────────────────────────────────────────────────┐        │
│  │                                                                   │        │
│  │  bg: #EAECEE  py: 48px  border-top: 1px #D5D8DC                  │        │
│  │                                                                   │        │
│  │           Contribute to the collective memory                     │        │
│  │       (H2 centered, #1C2833)                                      │        │
│  │                                                                   │        │
│  │  Help us preserve and expand the genealogical records.            │        │
│  │  Register to add family members and connect histories.            │        │
│  │       (Body 15px centered, #5D6D7E, max-w 480px)                 │        │
│  │                                                                   │        │
│  │              [ Create Account ]                                   │        │
│  │              (Accent Large btn — #C9A96E bg)                      │        │
│  │                                                                   │        │
│  └───────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.6 Footer

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  bg: #1C2833  py: 40px  text: rgba(white, 0.6)  font: 13px                  │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Logo +     │  │  NAVIGATION │  │  RESOURCES  │  │  CONTACT    │        │
│  │  tagline    │  │  Home       │  │  About      │  │  Email      │        │
│  │             │  │  Tree       │  │  FAQ        │  │  Address    │        │
│  │             │  │  Search     │  │  Guidelines │  │             │        │
│  │             │  │  Register   │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─           │
│  bottom bar: 1px top border rgba(white,0.1)  py 16px                         │
│  Left: "© 2026 Genealogy Platform"   Right: "Privacy · Terms"               │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Stage 2 — Search & Exploration

### User Needs
- Type a name and get fast, readable results
- Understand which person is which (disambiguation via parent, dates, designation)
- Navigate from results to tree view or profile

### Friction Points (current)
- SearchBar is only an autocomplete dropdown — no full results page
- No structured result cards — just name in dropdown
- No empty-state guidance
- No filters (by region, clan, time period)

---

### 3.1 Search Results Page (new route: `/search?q=...`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  HEADER (sticky)                                                             │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌── SEARCH BAR (persistent, top of content) ──────────────────────┐         │
│  │  🔍  "Amanzhol"                                          [X]    │         │
│  │  pill shape, 48px h, shadow Level 1, max-w 720px centered       │         │
│  └──────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  Results for "Amanzhol"  ·  47 records found                                 │
│  (H3 + Caption gray, mb 24px)                                                │
│                                                                              │
│  ┌── FILTER BAR ───────────────────────────────────────────────────┐         │
│  │  Sort: [Relevance ▾]   Access: [All ▾]   ── optional future ── │         │
│  │  height 40px  bg #F4F6F7  radius 8px  py 8px px 16px           │         │
│  └─────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  ┌── RESULT CARD ──────────────────────────────────────────────────┐         │
│  │                                                                  │         │
│  │  ┌────┐  Amanzhol Nurlanuly                   [public]          │         │
│  │  │ AV │  Son of Nurlan · Designation: Elder   ─ badge           │         │
│  │  │ 48 │  "Known for contributions to…"        ─ truncated       │         │
│  │  └────┘                                                          │         │
│  │           [ View Profile ]   [ View in Tree ]                    │         │
│  │           (Ghost btn)        (Ghost btn)                         │         │
│  │                                                                  │         │
│  │  Layout: flex row, avatar left, content fill, actions right      │         │
│  │  Avatar: 48px circle, bg #EAECEE, initials #1A5276              │         │
│  │  Name: H4 16px 600  Lineage: Body Small 14px #5D6D7E            │         │
│  │  Excerpt: Body Small 14px #AEB6BF, max 1 line, ellipsis         │         │
│  │  Padding: 16px  Border-bottom: 1px #EAECEE                      │         │
│  │  Hover: bg #F4F6F7                                               │         │
│  │  Entire card is clickable → goes to profile                      │         │
│  └──────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  ┌── RESULT CARD ──────────────────────────────────────────────────┐         │
│  │  (same pattern repeats)                                          │         │
│  └──────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  ┌── PAGINATION ───────────────────────────────────────────────────┐         │
│  │                                                                  │         │
│  │         ←  1  [2]  3  4  …  12  →                               │         │
│  │                                                                  │         │
│  │  Active page: bg #1A5276 text white, radius 4px, 32x32          │         │
│  │  Inactive: bg transparent, text #5D6D7E, hover bg #EAECEE       │         │
│  │  Arrows: 32x32, border 1px #D5D8DC, hover bg #EAECEE            │         │
│  │  Center aligned, mt 32px                                         │         │
│  └──────────────────────────────────────────────────────────────────┘         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Search — Empty / No Results State

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌── EMPTY STATE CARD (centered, max-w 480px) ─────────────────────┐         │
│  │                                                                  │         │
│  │                  ┌──────────────┐                                │         │
│  │                  │  Illustration │                                │         │
│  │                  │  empty search │                                │         │
│  │                  │  (simple SVG) │                                │         │
│  │                  └──────────────┘                                │         │
│  │                                                                  │         │
│  │              No results for "Xyzabc"                             │         │
│  │              (H3, center, #1C2833)                               │         │
│  │                                                                  │         │
│  │      Try a different spelling, use fewer words,                  │         │
│  │      or browse the full tree to explore records.                 │         │
│  │      (Body Small, center, #5D6D7E)                               │         │
│  │                                                                  │         │
│  │              [ Browse Full Tree ]                                 │         │
│  │              (Primary Medium btn)                                 │         │
│  │                                                                  │         │
│  └──────────────────────────────────────────────────────────────────┘         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Search Autocomplete Dropdown (inline on any page)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌── SEARCH INPUT ──────────────────────────────┐                            │
│  │  🔍  Aman...                                  │                            │
│  └───────────────────────────────────────────────┘                            │
│  ┌── DROPDOWN ──────────────────────────────────┐                            │
│  │                                               │                            │
│  │  ┌─ ROW (hover highlight) ──────────────────┐ │                            │
│  │  │  AV  Amanzhol Nurlanuly                  │ │                            │
│  │  │      Son of Nurlan  ·  public            │ │                            │
│  │  └──────────────────────────────────────────┘ │                            │
│  │  ┌─ ROW ───────────────────────────────────┐  │                            │
│  │  │  AV  Amangeldi Serikovich                │  │                            │
│  │  │      Son of Serik  ·  public             │  │                            │
│  │  └──────────────────────────────────────────┘  │                            │
│  │  ┌─ ROW ───────────────────────────────────┐  │                            │
│  │  │  AV  Amanbay Tolegenov                   │  │                            │
│  │  │      Son of Tolegen  ·  private 🔒       │  │                            │
│  │  └──────────────────────────────────────────┘  │                            │
│  │                                               │                            │
│  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │                            │
│  │  See all 47 results →   (link, Body Small)    │                            │
│  │                                               │                            │
│  └───────────────────────────────────────────────┘                            │
│                                                                              │
│  Dropdown: bg white, shadow Level 3, radius 8px, max-h 320px scroll         │
│  Row: py 10px px 16px, hover bg #F4F6F7, cursor pointer                      │
│  Avatar: 32px circle, initials                                               │
│  Name: 14px 600 #1C2833, Meta: 13px #AEB6BF                                 │
│  "See all" link: 13px #2980B9, py 12px, border-top 1px #EAECEE              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Stage 3 — Core Interaction (Tree View)

### User Needs
- See the family tree structure clearly
- Navigate large trees (zoom, pan, center)
- Click a node to see person details without leaving the tree
- Find paths between two people

### Friction Points (current)
- Tree canvas has no zoom/pan controls (only keyboard/scroll)
- Selected person detail appears above tree (scrolling disruption)
- Path finder UI is cramped in the controls bar
- No minimap or orientation aid for large trees

---

### 4.1 Tree Page — Full Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌── TOOLBAR (top of content area) ────────────────────────────────┐         │
│  │                                                                  │         │
│  │  🔍 Search person...          │  Find Path: [From ▾] → [To ▾]  │         │
│  │  (SearchBar, pill, 40px h)    │  [ Find Path ] (Primary btn)    │         │
│  │                                                                  │         │
│  │  bg: white  border-bottom: 1px #EAECEE  py 12px px 20px         │         │
│  │  Layout: flex, space-between, wrap on mobile                     │         │
│  └──────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  ┌── PATH RESULT (conditional, shown when path found) ─────────────┐         │
│  │                                                                  │         │
│  │  Path: Amanzhol → Nurlan → Serik → Bolat (4 steps)             │         │
│  │                                                                  │         │
│  │  ┌────────┐  ──→  ┌────────┐  ──→  ┌────────┐  ──→  ┌────────┐ │         │
│  │  │Amanzhol│       │ Nurlan │       │ Serik  │       │ Bolat  │ │         │
│  │  └────────┘       └────────┘       └────────┘       └────────┘ │         │
│  │                                                                  │         │
│  │  bg: #D4E6F1  radius: 8px  py 16px  mb 8px                      │         │
│  │  Chips: bg white, radius 4px, px 12px py 6px, clickable         │         │
│  │  Arrow: → icon, #5D6D7E, 16px                                   │         │
│  │  [ ✕ Close ] (Ghost btn, top right)                              │         │
│  └──────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  ┌── MAIN AREA (flex row) ─────────────────────────────────────────┐         │
│  │                                                                  │         │
│  │  ┌── TREE CANVAS ──────────────────────┐  ┌── SIDE PANEL ────┐  │         │
│  │  │                                      │  │                   │  │         │
│  │  │  vis-network container               │  │  (Person detail)  │  │         │
│  │  │  bg: #FAFBFC (very light gray)       │  │                   │  │         │
│  │  │  border: 1px #EAECEE                 │  │  Width: 360px     │  │         │
│  │  │  radius: 8px                         │  │  bg: white        │  │         │
│  │  │  height: calc(100vh - 200px)         │  │  border-left:     │  │         │
│  │  │  min-height: 500px                   │  │  1px #EAECEE      │  │         │
│  │  │                                      │  │  shadow: Level 2  │  │         │
│  │  │  flex: 1 (fills remaining space)     │  │  overflow-y:      │  │         │
│  │  │                                      │  │  auto             │  │         │
│  │  │            ┌─ Node ─┐                │  │                   │  │         │
│  │  │            │ Person │                │  │  (see 4.3)        │  │         │
│  │  │            └───┬────┘                │  │                   │  │         │
│  │  │          ┌─────┼─────┐               │  │                   │  │         │
│  │  │      ┌───┴──┐  │  ┌──┴───┐           │  │                   │  │         │
│  │  │      │ Node │  │  │ Node │           │  │                   │  │         │
│  │  │      └──────┘  │  └──────┘           │  │                   │  │         │
│  │  │             ┌──┴───┐                 │  │                   │  │         │
│  │  │             │ Node │                 │  │                   │  │         │
│  │  │             └──────┘                 │  │                   │  │         │
│  │  │                                      │  │                   │  │         │
│  │  │  ┌── ZOOM CONTROLS (bottom-right)──┐ │  │                   │  │         │
│  │  │  │  [+]  [-]  [⊡]  [↻]            │ │  │                   │  │         │
│  │  │  │  zoom  zoom  fit   reset        │ │  │                   │  │         │
│  │  │  │                                  │ │  │                   │  │         │
│  │  │  │  bg white, shadow Level 2        │ │  │                   │  │         │
│  │  │  │  radius 8px, p 4px               │ │  │                   │  │         │
│  │  │  │  buttons: 36x36, radius 4px      │ │  │                   │  │         │
│  │  │  │  hover bg #EAECEE                │ │  │                   │  │         │
│  │  │  └──────────────────────────────────┘ │  │                   │  │         │
│  │  │                                      │  │                   │  │         │
│  │  └──────────────────────────────────────┘  └───────────────────┘  │         │
│  │                                                                  │         │
│  │  Gap between canvas and panel: 0 (panel overlays or sits beside) │         │
│  └──────────────────────────────────────────────────────────────────┘         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Tree Node Component (vis-network custom)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  NODE — DEFAULT STATE                                                        │
│  ┌──────────────────────────────────┐                                        │
│  │  Amanzhol Nurlanuly              │                                        │
│  │  · Elder                         │                                        │
│  └──────────────────────────────────┘                                        │
│  shape: box  radius: 6px  borderWidth: 2px                                   │
│  font: { size: 13, face: 'Inter', color: '#1C2833' }                         │
│  margin: { top: 8, bottom: 8, left: 14, right: 14 }                         │
│  Subtitle line (designation): font size 11, color #5D6D7E                    │
│                                                                              │
│  NODE — COLOR CODING                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │  Public:   bg #E8F6EF  border #82B366  text #1C2833             │        │
│  │  Private:  bg #FEF9E7  border #D6B656  text #1C2833             │        │
│  │  Selected: bg #D4E6F1  border #1A5276  text #1A5276             │        │
│  │  Hover:    bg #F0F4FF  border #2980B9  text #1A5276             │        │
│  │  In path:  bg #C9A96E  border #A67C52  text white (highlighted) │        │
│  └──────────────────────────────────────────────────────────────────┘        │
│                                                                              │
│  EDGE STYLING                                                                │
│  color: #AEB6BF  width: 1.5  arrow: { to: { scaleFactor: 0.6 } }            │
│  smooth: { type: 'cubicBezier', forceDirection: 'vertical' }                 │
│  Highlighted (in path): color #C9A96E, width 3                               │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Right-Side Info Panel (Selected Person)

```
┌─────────────────────────────────────────────┐
│                                              │
│  ┌── PANEL HEADER ────────────────────────┐  │
│  │                                         │  │
│  │  ┌────┐  Amanzhol Nurlanuly            │  │
│  │  │ AV │  [public] badge                │  │
│  │  │ 56 │                                │  │
│  │  └────┘  Avatar: 56px circle            │  │
│  │          Initials, bg #EAECEE           │  │
│  │                                         │  │
│  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  │
│  └─────────────────────────────────────────┘  │
│                                              │
│  ┌── DETAILS ──────────────────────────────┐  │
│  │                                          │  │
│  │  DESIGNATION                             │  │
│  │  Elder of the Western Clan               │  │
│  │  (Overline label + Body value)           │  │
│  │                                          │  │
│  │  REFERENCE                               │  │
│  │  Historical archive vol. 3, p. 42        │  │
│  │                                          │  │
│  │  HISTORY                                 │  │
│  │  Known for contributions to the region…  │  │
│  │  (truncated to 3 lines with "Read more") │  │
│  │                                          │  │
│  │  PARENT                                  │  │
│  │  ┌─ clickable chip ─────────────────┐    │  │
│  │  │  Nurlan Serikovich    →          │    │  │
│  │  └──────────────────────────────────┘    │  │
│  │                                          │  │
│  │  CHILDREN  (3)                           │  │
│  │  ┌─ chip ─────┐  ┌─ chip ─────┐         │  │
│  │  │  Bolat     │  │  Serik     │         │  │
│  │  └────────────┘  └────────────┘         │  │
│  │  ┌─ chip ─────┐                         │  │
│  │  │  Marat     │                         │  │
│  │  └────────────┘                         │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                              │
│  ┌── ACTIONS ──────────────────────────────┐  │
│  │                                          │  │
│  │  [ View Full Profile ]  (Primary, full)  │  │
│  │  [ Edit ]  [ View Subtree ]  (Secondary) │  │
│  │                                          │  │
│  │  Button stack: full width, gap 8px       │  │
│  └──────────────────────────────────────────┘  │
│                                              │
│  Panel padding: 24px   Width: 360px          │
│  Slides in from right with 200ms ease-out    │
│  Close: [✕] button top-right of panel        │
│                                              │
└─────────────────────────────────────────────┘
```

### 4.4 Tree Page — Empty State

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  (Toolbar still visible at top)                                              │
│                                                                              │
│  ┌── EMPTY CANVAS (full height, centered content) ─────────────────┐         │
│  │                                                                  │         │
│  │                   ┌───────────────┐                              │         │
│  │                   │  Tree icon    │                              │         │
│  │                   │  64px, #AEB6BF│                              │         │
│  │                   └───────────────┘                              │         │
│  │                                                                  │         │
│  │              The family tree is empty                            │         │
│  │              (H3, #1C2833, center)                               │         │
│  │                                                                  │         │
│  │     Start by adding the first person to build your tree.         │         │
│  │     (Body Small, #5D6D7E, center)                                │         │
│  │                                                                  │         │
│  │              [ Add First Person ]                                │         │
│  │              (Primary Large btn)                                  │         │
│  │                                                                  │         │
│  └──────────────────────────────────────────────────────────────────┘         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Stage 4 — Deep Dive (Person Profile)

### User Needs
- See all information about a person in a clean layout
- Understand relationships at a glance (parent, children, editors)
- Navigate to related people
- Edit or suggest changes if authorized

### Friction Points (current)
- No dedicated profile page — only PersonCard inside tree page
- PersonCard is compact, not suited for detailed reading
- No visual hierarchy for relationships

---

### 5.1 Person Profile Page (new route: `/person/:id`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌── BREADCRUMB ───────────────────────────────────────────────────┐         │
│  │  Home  /  Tree  /  Amanzhol Nurlanuly                           │         │
│  │  font: 13px #AEB6BF, links #2980B9, current #1C2833            │         │
│  └─────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  ┌── PROFILE HEADER CARD ──────────────────────────────────────────┐         │
│  │                                                                  │         │
│  │  ┌────────┐                                                      │         │
│  │  │   AV   │  Amanzhol Nurlanuly              [public]           │         │
│  │  │  72px  │  Elder of the Western Clan        ─ badge           │         │
│  │  │ circle │  Added by user@example.com · Jan 15, 2026           │         │
│  │  └────────┘                                                      │         │
│  │             (name: H1 32px, designation: Body 15px #5D6D7E,     │         │
│  │              meta: Caption 12px #AEB6BF)                         │         │
│  │                                                                  │         │
│  │             [ Edit Person ]  [ View in Tree ]  [ ··· ]          │         │
│  │             (Primary btn)    (Secondary btn)   (more menu)      │         │
│  │                                                                  │         │
│  │  shadow: Level 1  padding: 32px  border-bottom: 3px #C9A96E     │         │
│  └──────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  ┌── TWO-COLUMN LAYOUT (gap 24px) ─────────────────────────────────┐         │
│  │                                                                  │         │
│  │  ┌── LEFT (flex: 2, ~640px) ─────────┐  ┌── RIGHT (flex: 1) ──┐ │         │
│  │  │                                    │  │                      │ │         │
│  │  │  ┌── INFO SECTION ──────────────┐  │  │  ┌── RELATIONSHIPS ┐ │ │         │
│  │  │  │                              │  │  │  │                  │ │ │         │
│  │  │  │  ABOUT                       │  │  │  │  PARENT          │ │ │         │
│  │  │  │  ─────                       │  │  │  │  ┌────────────┐ │ │ │         │
│  │  │  │                              │  │  │  │  │ AV Nurlan  │ │ │ │         │
│  │  │  │  Reference                   │  │  │  │  │ Serikovich │ │ │ │         │
│  │  │  │  Historical archive vol. 3   │  │  │  │  │     →      │ │ │ │         │
│  │  │  │  page 42                     │  │  │  │  └────────────┘ │ │ │         │
│  │  │  │                              │  │  │  │                  │ │ │         │
│  │  │  │  History                     │  │  │  │  CHILDREN (3)   │ │ │         │
│  │  │  │  Known for major contrib-    │  │  │  │  ┌────────────┐ │ │ │         │
│  │  │  │  utions to the development   │  │  │  │  │ AV Bolat   │ │ │ │         │
│  │  │  │  of the Western region.      │  │  │  │  │ Amanzholuly│ │ │ │         │
│  │  │  │  Active participant in       │  │  │  │  │     →      │ │ │ │         │
│  │  │  │  community governance and    │  │  │  │  └────────────┘ │ │ │         │
│  │  │  │  cultural preservation       │  │  │  │  ┌────────────┐ │ │ │         │
│  │  │  │  efforts during the early    │  │  │  │  │ AV Serik   │ │ │ │         │
│  │  │  │  20th century.               │  │  │  │  │ Amanzholuly│ │ │ │         │
│  │  │  │                              │  │  │  │  │     →      │ │ │ │         │
│  │  │  │  Each field:                 │  │  │  │  └────────────┘ │ │ │         │
│  │  │  │  Label: Overline 11px        │  │  │  │  ┌────────────┐ │ │ │         │
│  │  │  │  Value: Body 15px            │  │  │  │  │ AV Marat   │ │ │ │         │
│  │  │  │  Separator: 1px #EAECEE      │  │  │  │  │ Amanzholuly│ │ │ │         │
│  │  │  │  mb between fields: 20px     │  │  │  │  │     →      │ │ │ │         │
│  │  │  │                              │  │  │  │  └────────────┘ │ │ │         │
│  │  │  └──────────────────────────────┘  │  │  │                  │ │ │         │
│  │  │                                    │  │  │  Relation cards: │ │ │         │
│  │  │  ┌── MINI TREE PREVIEW ─────────┐  │  │  │  bg #F4F6F7     │ │ │         │
│  │  │  │                              │  │  │  │  radius 8px     │ │ │         │
│  │  │  │  3-level subtree centered    │  │  │  │  p 12px         │ │ │         │
│  │  │  │  on this person, small       │  │  │  │  hover shadow   │ │ │         │
│  │  │  │  vis-network embed           │  │  │  │  Level 1        │ │ │         │
│  │  │  │  height: 250px               │  │  │  │  clickable →    │ │ │         │
│  │  │  │  [ Open Full Tree → ]        │  │  │  │  profile        │ │ │         │
│  │  │  │                              │  │  │  │                  │ │ │         │
│  │  │  └──────────────────────────────┘  │  │  └──────────────────┘ │ │         │
│  │  │                                    │  │                      │ │         │
│  │  └────────────────────────────────────┘  │  ┌── EDITORS ──────┐ │ │         │
│  │                                          │  │                  │ │ │         │
│  │                                          │  │  user1@mail.com  │ │ │         │
│  │                                          │  │  user2@mail.com  │ │ │         │
│  │                                          │  │                  │ │ │         │
│  │                                          │  │  Caption list    │ │ │         │
│  │                                          │  │  with avatars    │ │ │         │
│  │                                          │  └──────────────────┘ │ │         │
│  │                                          │                      │ │         │
│  └──────────────────────────────────────────────────────────────────┘         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Relationship Block Component

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  RELATIONSHIP CARD (used in profile sidebar)                                 │
│                                                                              │
│  ┌─────────────────────────────────────────────┐                             │
│  │  ┌────┐  Nurlan Serikovich              →   │                             │
│  │  │ AV │  Elder  ·  [public]                 │                             │
│  │  │ 40 │                                      │                             │
│  │  └────┘                                      │                             │
│  │                                              │                             │
│  │  bg: #F4F6F7  hover: white + shadow Level 1  │                             │
│  │  padding: 12px  radius: 8px  cursor: pointer │                             │
│  │  border: 1px solid transparent               │                             │
│  │  hover border: #D5D8DC                        │                             │
│  │  Avatar: 40px  Name: 14px 600  Meta: 12px     │                             │
│  │  Arrow →: 16px icon, #AEB6BF, right-aligned  │                             │
│  └──────────────────────────────────────────────┘                             │
│                                                                              │
│  Section header above:                                                       │
│  "PARENT" or "CHILDREN (3)" — Overline style, mb 12px                        │
│  If no parent: "No parent recorded" — Caption italic #AEB6BF                 │
│  If no children: "No children recorded"                                      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Action Buttons Bar

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  PROFILE ACTIONS (in header card, right-aligned)                             │
│                                                                              │
│  [ ✏️ Edit Person ]   [ 🌳 View in Tree ]   [ ··· ]                          │
│    Primary btn           Secondary btn       Icon btn (more)                 │
│                                                                              │
│  MORE MENU (dropdown from ···):                                              │
│  ┌──────────────────────────────┐                                            │
│  │  Share Link           🔗     │                                            │
│  │  View History         📋     │                                            │
│  │  ─────────────────────       │                                            │
│  │  Report Issue         ⚠️     │  ← gray text                               │
│  │  Delete Person        🗑️     │  ← red text, admin only                    │
│  └──────────────────────────────┘                                            │
│  shadow Level 3, radius 8px, py 4px, min-w 200px                            │
│  items: py 10px px 16px, hover bg #F4F6F7                                    │
│                                                                              │
│  CONDITIONAL VISIBILITY:                                                     │
│  - "Edit Person": shown if user is creator, editor, or admin/staff           │
│  - "Delete Person": admin only                                               │
│  - "View in Tree": always shown                                              │
│  - Not logged in: only "View in Tree" and "Share Link"                       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Stage 5 — Contribution & Moderation

### User Needs
- Add a new person or edit existing data
- See what status their submission has (pending, published)
- Moderators: review queue, approve/reject efficiently

### Friction Points (current)
- PersonForm is a full page — could be a modal for quick edits
- No feedback after submission (just redirect)
- Moderation view is a basic list with no batch actions
- No inline status indicators showing submission state

---

### 6.1 Add / Edit Person Modal

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌── MODAL OVERLAY ────────────────────────────────────────────────┐         │
│  │  bg: rgba(0,0,0,0.4)  backdrop-filter: blur(2px)               │         │
│  │                                                                  │         │
│  │  ┌── MODAL DIALOG (max-w 640px, centered) ───────────────────┐  │         │
│  │  │                                                            │  │         │
│  │  │  ┌── MODAL HEADER ──────────────────────────────────────┐  │  │         │
│  │  │  │  Add New Person                            [✕]       │  │  │         │
│  │  │  │  (H2 24px 600)                    (close icon btn)   │  │  │         │
│  │  │  │  border-bottom: 1px #EAECEE  py 20px px 32px         │  │  │         │
│  │  │  └──────────────────────────────────────────────────────┘  │  │         │
│  │  │                                                            │  │         │
│  │  │  ┌── MODAL BODY (py 24px px 32px, max-h 70vh scroll) ──┐  │  │         │
│  │  │  │                                                       │  │  │         │
│  │  │  │  Full Name *                                          │  │  │         │
│  │  │  │  ┌────────────────────────────────────────────┐       │  │  │         │
│  │  │  │  │  Amanzhol Nurlanuly                        │       │  │  │         │
│  │  │  │  └────────────────────────────────────────────┘       │  │  │         │
│  │  │  │                                                       │  │  │         │
│  │  │  │  Parent                                               │  │  │         │
│  │  │  │  ┌────────────────────────────────────────────┐       │  │  │         │
│  │  │  │  │  🔍  Search for parent...                  │       │  │  │         │
│  │  │  │  └────────────────────────────────────────────┘       │  │  │         │
│  │  │  │  Selected: ┌─ chip ─────────────── ✕ ─┐               │  │  │         │
│  │  │  │            │  Nurlan Serikovich        │               │  │  │         │
│  │  │  │            └──────────────────────────┘               │  │  │         │
│  │  │  │                                                       │  │  │         │
│  │  │  │  Designation                                          │  │  │         │
│  │  │  │  ┌────────────────────────────────────────────┐       │  │  │         │
│  │  │  │  │  Elder                                     │       │  │  │         │
│  │  │  │  └────────────────────────────────────────────┘       │  │  │         │
│  │  │  │                                                       │  │  │         │
│  │  │  │  Reference                                            │  │  │         │
│  │  │  │  ┌────────────────────────────────────────────┐       │  │  │         │
│  │  │  │  │  Historical archive vol. 3, page 42        │       │  │  │         │
│  │  │  │  └────────────────────────────────────────────┘       │  │  │         │
│  │  │  │                                                       │  │  │         │
│  │  │  │  History / Notes                                      │  │  │         │
│  │  │  │  ┌────────────────────────────────────────────┐       │  │  │         │
│  │  │  │  │  Known for contributions to...             │       │  │  │         │
│  │  │  │  │                                            │       │  │  │         │
│  │  │  │  │  (textarea, min-h 100px)                   │       │  │  │         │
│  │  │  │  └────────────────────────────────────────────┘       │  │  │         │
│  │  │  │                                                       │  │  │         │
│  │  │  │  Access                                               │  │  │         │
│  │  │  │  ┌──────────────────────────────────────┐             │  │  │         │
│  │  │  │  │  (●) Private  — Requires moderation  │             │  │  │         │
│  │  │  │  │  ( ) Public   — Visible to everyone  │             │  │  │         │
│  │  │  │  └──────────────────────────────────────┘             │  │  │         │
│  │  │  │  (radio group, Body Small, description #5D6D7E)       │  │  │         │
│  │  │  │                                                       │  │  │         │
│  │  │  │  ┌── INFO BANNER ──────────────────────────────────┐  │  │  │         │
│  │  │  │  │  ℹ️  New entries default to "private" and must   │  │  │  │         │
│  │  │  │  │     be reviewed by a moderator before publishing │  │  │  │         │
│  │  │  │  │  bg: #D4E6F1  border-left: 3px #2471A3          │  │  │  │         │
│  │  │  │  │  p: 12px 16px  radius: 4px  font: 13px          │  │  │  │         │
│  │  │  │  └─────────────────────────────────────────────────┘  │  │  │         │
│  │  │  │                                                       │  │  │         │
│  │  │  └───────────────────────────────────────────────────────┘  │  │         │
│  │  │                                                            │  │         │
│  │  │  ┌── MODAL FOOTER ──────────────────────────────────────┐  │  │         │
│  │  │  │                                                       │  │  │         │
│  │  │  │  [Cancel]                      [Save Person]          │  │  │         │
│  │  │  │  (Secondary btn)               (Primary btn)          │  │  │         │
│  │  │  │                                                       │  │  │         │
│  │  │  │  border-top: 1px #EAECEE  py 20px px 32px             │  │  │         │
│  │  │  │  justify: space-between                               │  │  │         │
│  │  │  └───────────────────────────────────────────────────────┘  │  │         │
│  │  │                                                            │  │         │
│  │  │  radius: 12px  shadow: Level 4  bg: white                  │  │         │
│  │  │  Entrance: scale(0.95) → scale(1) + opacity, 200ms         │  │         │
│  │  └────────────────────────────────────────────────────────────┘  │         │
│  │                                                                  │         │
│  └──────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  EDIT MODE differences:                                                      │
│  - Title: "Edit Person"                                                      │
│  - Fields pre-populated                                                      │
│  - Footer adds: [Delete] (Danger btn, left side) for admin                   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Submission Status Indicators

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  AFTER SUCCESSFUL SUBMISSION — Toast notification (top-right)                │
│                                                                              │
│  ┌─────────────────────────────────────────────────┐                         │
│  │  ✓  Person added successfully                    │                         │
│  │     Your entry is pending moderator review.      │                         │
│  │     ──────────────── progress bar (auto-close) ─ │                         │
│  └─────────────────────────────────────────────────┘                         │
│  bg: white  shadow: Level 3  radius: 8px  p: 16px                            │
│  left accent border: 3px #1E8449  width: 360px                               │
│  auto-dismiss: 5 seconds  icon: ✓ in green circle                            │
│                                                                              │
│                                                                              │
│  STATUS BADGES (on PersonCard, search results, profile)                      │
│                                                                              │
│  ┌──────────────────────┐                                                    │
│  │  ● Pending Review    │  bg #FEF9E7  text #B7950B  dot: #B7950B            │
│  └──────────────────────┘                                                    │
│  ┌──────────────────────┐                                                    │
│  │  ✓ Published         │  bg #D5F5E3  text #1E8449  check icon              │
│  └──────────────────────┘                                                    │
│  ┌──────────────────────┐                                                    │
│  │  🔒 Private          │  bg #EAECEE  text #5D6D7E  lock icon              │
│  └──────────────────────┘                                                    │
│                                                                              │
│  Shown in: PersonCard header, search result right side, profile header       │
│                                                                              │
│                                                                              │
│  USER'S OWN SUBMISSIONS LIST (in Settings page)                              │
│                                                                              │
│  MY SUBMISSIONS                                                              │
│  ┌──────────────────────────────────────────────────────┐                    │
│  │  Amanzhol Nurlanuly    ● Pending Review    Jan 15    │                    │
│  │  Bolat Amanzholuly     ✓ Published          Jan 12    │                    │
│  │  Serik Amanzholuly     ● Pending Review    Jan 14    │                    │
│  └──────────────────────────────────────────────────────┘                    │
│  Compact list, border-bottom between rows, hover bg #F4F6F7                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Admin / Moderator Dashboard

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌── PAGE HEADER ──────────────────────────────────────────────────┐         │
│  │                                                                  │         │
│  │  Moderation Dashboard                                            │         │
│  │  (H1 32px)                                                       │         │
│  │                                                                  │         │
│  │  ┌── TAB BAR ───────────────────────────────────────────────┐    │         │
│  │  │                                                           │    │         │
│  │  │  [Pending (12)]   [Published]   [All Entries]   [Backups] │    │         │
│  │  │                                                           │    │         │
│  │  │  Active: text #1A5276, border-bottom 2px #C9A96E          │    │         │
│  │  │  Inactive: text #5D6D7E, hover text #1C2833               │    │         │
│  │  │  Count badge: bg #FADBD8 text #C0392B (for pending)       │    │         │
│  │  │  font: 14px 500, px 16px, py 12px                         │    │         │
│  │  └───────────────────────────────────────────────────────────┘    │         │
│  │                                                                  │         │
│  └──────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  ┌── PENDING TAB CONTENT ──────────────────────────────────────────┐         │
│  │                                                                  │         │
│  │  ┌── STATS ROW ──────────────────────────────────────────────┐  │         │
│  │  │                                                            │  │         │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐                   │  │         │
│  │  │  │   12    │  │   342   │  │   28    │                   │  │         │
│  │  │  │ Pending │  │ Total   │  │ This    │                   │  │         │
│  │  │  │         │  │ Published│  │  Week   │                   │  │         │
│  │  │  └─────────┘  └─────────┘  └─────────┘                   │  │         │
│  │  │                                                            │  │         │
│  │  │  Stat cards: compact, bg white, left-border accent         │  │         │
│  │  └────────────────────────────────────────────────────────────┘  │         │
│  │                                                                  │         │
│  │  ┌── MODERATION CARD ────────────────────────────────────────┐  │         │
│  │  │                                                            │  │         │
│  │  │  ┌────┐  Amanzhol Nurlanuly          ● Pending Review     │  │         │
│  │  │  │ AV │  Submitted by user@mail.com  · 2 hours ago        │  │         │
│  │  │  │ 48 │                                                    │  │         │
│  │  │  └────┘  Designation: Elder                                │  │         │
│  │  │          Reference: Historical archive vol. 3              │  │         │
│  │  │          Parent: Nurlan Serikovich                         │  │         │
│  │  │                                                            │  │         │
│  │  │  History:                                                  │  │         │
│  │  │  "Known for contributions to the region…" (expandable)     │  │         │
│  │  │                                                            │  │         │
│  │  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │  │         │
│  │  │                                                            │  │         │
│  │  │  [ ✓ Publish ]   [ ✏️ Edit First ]   [ ✕ Reject ]         │  │         │
│  │  │  (Success btn)    (Secondary btn)    (Danger Ghost btn)   │  │         │
│  │  │                                                            │  │         │
│  │  │  Card: bg white, radius 8px, p 24px, shadow Level 1       │  │         │
│  │  │  mb 12px between cards                                     │  │         │
│  │  └────────────────────────────────────────────────────────────┘  │         │
│  │                                                                  │         │
│  │  (more cards follow same pattern…)                               │         │
│  │                                                                  │         │
│  └──────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  ┌── BACKUPS TAB (admin only) ─────────────────────────────────────┐         │
│  │                                                                  │         │
│  │  [ Create Backup ]  (Primary btn, top right)                     │         │
│  │                                                                  │         │
│  │  ┌── TABLE ──────────────────────────────────────────────────┐   │         │
│  │  │                                                            │   │         │
│  │  │  FILENAME           SIZE      DATE             ACTIONS    │   │         │
│  │  │  ─────────────────────────────────────────────────────── │   │         │
│  │  │  backup_2026-02-11  4.2 MB   Feb 11, 2026    [Restore]  │   │         │
│  │  │  backup_2026-02-10  4.1 MB   Feb 10, 2026    [Restore]  │   │         │
│  │  │  backup_2026-02-09  3.9 MB   Feb 09, 2026    [Restore]  │   │         │
│  │  │                                                            │   │         │
│  │  │  Table: font 14px, header Overline style, rows py 12px    │   │         │
│  │  │  Zebra: even rows bg #F4F6F7                               │   │         │
│  │  │  Restore btn: Ghost Danger — confirms via inline dialog    │   │         │
│  │  └────────────────────────────────────────────────────────────┘   │         │
│  │                                                                  │         │
│  └──────────────────────────────────────────────────────────────────┘         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Figma Page Structure

Recommended Figma file organization:

```
📁 Genealogy Platform — UI Design
│
├── 📄 Page 1: Cover
│   Title card, project name, version, date
│
├── 📄 Page 2: Design System
│   ├── Colors (swatches with hex + names)
│   ├── Typography scale (all levels with examples)
│   ├── Spacing & Grid (8px grid visualization)
│   ├── Elevation levels (shadow previews)
│   ├── Iconography (Lucide icon set sample)
│   └── Cultural accent patterns (ornamental elements)
│
├── 📄 Page 3: UI Kit — Components
│   ├── Buttons (all variants × sizes × states)
│   ├── Inputs (text, search, textarea, select, radio)
│   ├── Cards (default, compact, featured, stat)
│   ├── Badges (status, role, access)
│   ├── Navigation (header, breadcrumb, tabs, pagination)
│   ├── Modals (dialog frame, header, body, footer)
│   ├── Dropdowns (menu, autocomplete)
│   ├── Toast notifications (success, error, info)
│   ├── Empty states (template)
│   ├── Avatar (sizes: 32, 40, 48, 56, 72)
│   └── Relationship card, Person node
│
├── 📄 Page 4: Home Page
│   ├── Desktop (1440px viewport)
│   ├── Tablet (768px)
│   └── Mobile (375px)
│
├── 📄 Page 5: Search & Results
│   ├── Search results page (with results)
│   ├── Search results (empty state)
│   ├── Autocomplete dropdown states
│   └── Responsive variants
│
├── 📄 Page 6: Tree View
│   ├── Tree page with data + side panel open
│   ├── Tree page with path result shown
│   ├── Tree page empty state
│   ├── Zoom controls detail
│   └── Node component states
│
├── 📄 Page 7: Person Profile
│   ├── Full profile page (desktop)
│   ├── Profile with all relationships
│   ├── Profile actions expanded
│   └── Responsive variants
│
├── 📄 Page 8: Contribution Flow
│   ├── Add person modal (empty)
│   ├── Add person modal (filled)
│   ├── Edit person modal
│   ├── Submission toast
│   └── Status indicators
│
├── 📄 Page 9: Moderation Dashboard
│   ├── Pending queue tab
│   ├── Backups tab
│   ├── Moderation card states
│   └── Stats summary
│
├── 📄 Page 10: Auth Pages
│   ├── Login
│   ├── Register
│   └── Settings / Profile
│
└── 📄 Page 11: Flows & Prototyping
    ├── User journey: Discovery → Search → Tree → Profile → Edit
    ├── Moderator journey: Login → Dashboard → Review → Publish
    └── Interaction annotations
```

---

## 8. Component Hierarchy

```
App
├── NavBar
│   ├── Logo
│   ├── NavLink (×N)
│   ├── SearchTrigger (icon → opens search modal/bar)
│   └── UserMenu (avatar + dropdown)
│
├── HomePage
│   ├── HeroSection
│   │   ├── AccentLine
│   │   ├── Headline
│   │   ├── Subheadline
│   │   ├── SearchBarLarge
│   │   │   └── AutocompleteDropdown
│   │   └── CTAButtons (Primary + Secondary)
│   ├── StatsStrip
│   │   └── StatCard (×3)
│   ├── FeaturesSection
│   │   └── FeatureCard (×3)
│   │       ├── IconCircle
│   │       ├── Title
│   │       └── Description
│   ├── CTASection
│   └── Footer
│       ├── FooterColumn (×4)
│       └── FooterBottom
│
├── SearchResultsPage
│   ├── SearchBarPersistent
│   ├── ResultsHeader (count + sort)
│   ├── FilterBar
│   ├── ResultCard (×N)
│   │   ├── Avatar
│   │   ├── PersonInfo (name, lineage, excerpt)
│   │   ├── StatusBadge
│   │   └── QuickActions
│   ├── EmptyState
│   └── Pagination
│
├── TreePage
│   ├── TreeToolbar
│   │   ├── SearchBar
│   │   └── PathFinder
│   │       ├── SearchBar (from)
│   │       ├── SearchBar (to)
│   │       └── FindPathButton
│   ├── PathResult (conditional)
│   │   └── PathNode (×N, chips with arrows)
│   ├── TreeCanvas
│   │   ├── vis-network (TreeView component)
│   │   └── ZoomControls
│   │       └── IconButton (×4: +, -, fit, reset)
│   ├── SidePanel (conditional, slides in)
│   │   ├── PanelHeader (avatar + name + badge + close)
│   │   ├── DetailFields (label-value pairs)
│   │   ├── RelationshipSection
│   │   │   ├── SectionLabel
│   │   │   └── RelationshipCard (×N)
│   │   └── PanelActions
│   └── EmptyState
│
├── PersonProfilePage
│   ├── Breadcrumb
│   ├── ProfileHeaderCard
│   │   ├── Avatar (large)
│   │   ├── NameBlock (name, designation, meta)
│   │   ├── StatusBadge
│   │   └── ActionButtons + MoreMenu
│   ├── TwoColumnLayout
│   │   ├── LeftColumn
│   │   │   ├── InfoSection
│   │   │   │   └── LabelValuePair (×N)
│   │   │   └── MiniTreePreview
│   │   └── RightColumn
│   │       ├── RelationshipsPanel
│   │       │   ├── ParentSection → RelationshipCard
│   │       │   └── ChildrenSection → RelationshipCard (×N)
│   │       └── EditorsPanel
│   │           └── EditorRow (×N)
│   └── Breadcrumb
│
├── PersonModal (Add/Edit)
│   ├── ModalOverlay
│   ├── ModalDialog
│   │   ├── ModalHeader (title + close)
│   │   ├── ModalBody
│   │   │   ├── FormField (name) *
│   │   │   ├── FormField (parent search) + SelectedChip
│   │   │   ├── FormField (designation)
│   │   │   ├── FormField (reference)
│   │   │   ├── FormField (history, textarea)
│   │   │   ├── RadioGroup (access)
│   │   │   └── InfoBanner
│   │   └── ModalFooter (cancel + save)
│   └── ToastNotification (on success)
│
├── ModerationDashboard
│   ├── PageHeader
│   ├── TabBar
│   │   └── Tab (×4: Pending, Published, All, Backups)
│   ├── StatsRow
│   │   └── MiniStatCard (×3)
│   ├── ModerationCard (×N)
│   │   ├── Avatar
│   │   ├── PersonSummary
│   │   ├── StatusBadge
│   │   ├── ExpandableHistory
│   │   └── ActionBar (publish, edit, reject)
│   └── BackupsTable (admin tab)
│       ├── TableHeader
│       └── TableRow (×N)
│
├── LoginPage
│   └── AuthCard (email, password, submit, register link)
│
├── RegisterPage
│   └── AuthCard (name fields, email, password, confirm, submit)
│
└── SettingsPage
    ├── ProfileForm
    ├── SubmissionsList
    └── DangerZone (delete account)
```

---

## Appendix: Responsive Breakpoints

```
─────────────────────────────────────────────────────────
Desktop XL    ≥ 1440px    max-width: 1280px centered
Desktop       ≥ 1024px    max-width: 1280px centered
Tablet        ≥ 768px     single column, side panel below
Mobile        < 768px     hamburger nav, stacked layout
─────────────────────────────────────────────────────────

Key responsive changes:
- Tree side panel: ≥1024 = right side | <1024 = bottom sheet overlay
- Feature cards: ≥768 = 3 col | <768 = 1 col stacked
- Search results: always single column, card width adapts
- Profile: ≥1024 = 2 col | <1024 = single col, relationships below
- Moderation cards: always full width, actions stack on mobile
- NavBar: ≥768 = inline links | <768 = hamburger + drawer
- Stats strip: ≥768 = row | <768 = 2×2 grid or vertical stack
- Modal: ≥640 = max-w 640px centered | <640 = full-screen sheet
```

## Appendix: Cultural Accent Guidelines

```
The gold accent (#C9A96E) is the primary cultural marker. Use it:
  ✓  Top borders on featured cards (3px)
  ✓  Active tab indicator (2px bottom)
  ✓  Decorative accent lines (section separators)
  ✓  CTA button variant (special actions like registration)
  ✓  Hero section ornamental patterns at very low opacity (3-5%)
  ✓  Node highlight in tree for path results

Do NOT use gold as:
  ✗  Primary button color (that's the deep teal-blue)
  ✗  Text color (low contrast, accessibility failure)
  ✗  Large background fills (overwhelming)
  ✗  Status indicator (conflicts with warning yellow)

The tone should be understated and institutional — closer to a museum
or government archive than a consumer product.
```
