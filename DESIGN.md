---
name: Oit
description: High-performance real-time community communication with a High-Voltage dark aesthetic
colors:
  primary: "#FF5C00"
  primary-hover: "#ff751a"
  primary-glow: "rgba(255, 92, 0, 0.4)"
  neutral-void: "#000000"
  neutral-rail: "#0a0a0c"
  neutral-base: "#121215"
  neutral-surface: "#161619"
  neutral-hover: "#1c1c21"
  neutral-border: "#27272a"
  text-primary: "#f4f4f5"
  text-secondary: "#a1a1aa"
  text-muted: "#71717a"
  state-online: "#10b981"
  state-danger: "#ef4444"
  state-warning: "#f59e0b"
  pure-white: "#ffffff"
  orange-deep: "#ea580c"
typography:
  display:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.05em"
  micro:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.02em"
  nano:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.5625rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.04em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.neutral-hover}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "10px 18px"
  card-surface:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "16px 20px"
---

# Design System: Oit

## Overview

**Creative North Star: "The High-Voltage Command Center"**

Oit is engineered as an ultra-responsive, zero-latency collaboration hub for developers, open-source maintainers, and digital creators. The interface rejects generic corporate monotony in favor of an unapologetic, high-contrast dark aesthetic that feels immediate, tactile, and alive. Deep obsidian and charcoal background planes provide an uncompromising backdrop where vibrant orange accents ignite interactivity and signal real-time activity.

The aesthetic architecture is built on progressive tonal depth and crisp spatial hierarchy. Rather than relying on decorative blur effects or faux 3D shadows, Oit establishes elevation through deliberate luminance layering: pitch-black navigation rails anchor the far left, progressing to deep slate chat streams, elevated midnight message cards, and luminous glass overlays for interactive modals.

**Key Characteristics:**
- **High-Voltage Contrast:** Deep `#000000` void base with sharp `#FF5C00` electric orange accents for instant visual orientation.
- **Tonal Elevation Hierarchy:** Four discrete background tiers (`#0a0a0c` → `#121215` → `#161619` → `#1c1c21`) creating structural depth without visual noise.
- **Tactile Micro-Interactions:** Snappy exponential easing (`cubic-bezier(0.4, 0, 0.2, 1)`), 60fps GPU transforms, and subtle 1px luminous border highlights.
- **Single-DOM Fluidity:** Seamless layout transitions between direct messages, servers, and persistent floating calls without context loss.

## Colors

The Oit color palette is defined by high-contrast functional roles, using intense electric orange as a singular accent against deep dark tones.

### Primary
- **High-Voltage Orange** (`#FF5C00`): The signature brand accent. Used selectively for active server indicators, primary CTA buttons, unread notification badges, active speaker halos, and audio level indicators.
- **Electric Orange Glow** (`rgba(255, 92, 0, 0.4)`): Diffuse luminous aura applied to primary interactive states and audio pulses.

### Neutral
- **Void Black** (`#000000`): The absolute root canvas and full-bleed overlay background.
- **Rail Black** (`#0a0a0c`): Dedicated to the far-left server navigation rail, anchoring the visual canvas.
- **Deep Base** (`#121215`): The primary work plane for chat message streams and header toolbars.
- **Elevated Surface** (`#161619`): Sidebars, contact lists, member rosters, and modal containers.
- **Hover Surface** (`#1c1c21`): Interactive item hover states and secondary action pills.
- **Zinc Border** (`#27272a` / `rgba(255, 255, 255, 0.08)`): Subtle 1px structural dividing lines.
- **Primary Text** (`#f4f4f5`): High-legibility crisp off-white for headers and active message text.
- **Secondary Text** (`#a1a1aa`): Muted silver for timestamps, user handles, and supporting labels.
- **Muted Text** (`#71717a`): Subtle gray for placeholder text and inactive icons.

### Status Indicators
- **Emerald Pulse** (`#10b981`): Real-time online presence dots and call connected indicators.
- **Signal Red** (`#ef4444` / `#1c1416` surface): Moderation warnings, mute badges, and failed upload states.
- **Amber Crown** (`#f59e0b`): Server owner badges and security credentials.

### Named Rules
**The 10% Voltage Rule.** Electric orange is an active signal, never a wallpaper. It must occupy ≤10% of any given screen area. When everything is glowing, nothing is important.  
**The No-Gray-on-Color Rule.** On colored warning or alert surfaces (e.g., failed upload bars), secondary text must be tinted from the alert hue (`text-red-200`), never washed-out gray.

## Typography

**Display & Body Font:** Modern Sans System Stack (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`) with fallback to clean geometric sans-serif.

**Character:** Technical, crisp, and dense. Optimized for fast scanning during high-throughput chat streams and low-latency voice collaboration.

### Hierarchy
- **Display** (800 weight, `clamp(1.5rem, 3vw, 2.25rem)`, line-height 1.15, tracking `-0.03em`): Modal headlines, landing page titles, and prominent section banners.
- **Headline** (700 weight, `1.125rem`, line-height 1.3, tracking `-0.02em`): Server titles, channel names, and user profile display names.
- **Title** (700 weight, `0.875rem`, line-height 1.4, tracking `-0.01em`): Sidebar category labels, active chat header titles, and form group labels.
- **Body** (400/500 weight, `0.8125rem` / 13px, line-height 1.5, normal tracking): Chat messages, modal descriptions, and notification content. Measure is constrained to 65–75ch for optimal reading comfort.
- **Label** (700/800 weight, `0.6875rem` / 11px, line-height 1.2, uppercase tracking `0.05em`): Moderation tags, section headers, unread counts, and status indicators.

### Named Rules
**The Tabular Numbers Rule.** All timestamps, durations, latency measurements, and unread counts use tabular figures (`font-variant-numeric: tabular-nums`) to prevent layout jitter during real-time updates.

## Layout

Oit employs an asymmetrical multi-pane command layout that flows seamlessly from global context to focused interaction:

1. **Left Nav Rail (`w-16` / 64px):** Fixed-width dark rail hosting Oit home logo, server icon avatars, add server button, and global user profile icon.
2. **Channel / Direct Message Sidebar (`w-60` to `w-72` / 240–288px):** Channel lists, voice rooms, search bars, and active direct message threads.
3. **Primary Chat Stream (`flex-1`):** Dynamic message timeline featuring sticky date separators, virtualized message bubbles, and rich attachment previews.
4. **Right Context / Members Panel (`w-64` / 256px):** Discord-style collapsible member roster grouped by RBAC role weights (Owner, Admin, Moderator, Member).

### Responsive Strategy
- **Desktop (≥1024px):** Complete 4-column command layout displayed simultaneously.
- **Tablet (768px–1023px):** Left navigation rail and chat stream remain pinned; channel sidebar and member panels toggle as high-performance slide-overs.
- **Mobile (<768px):** Single-DOM off-canvas drawer with hardware-accelerated transforms (`translate-x-0` vs `-translate-x-full`). Tap targets maintain a strict minimum bounding box of 40×40px (recommended 44×44px).

## Elevation & Depth

Oit uses **Tonal Layering** rather than traditional drop-shadow cascades. Depth is expressed by stacking increasingly light charcoal surfaces on top of darker planes, reinforced by delicate 1px border strokes.

### Elevation Vocabulary
- **Level 0 (Void Canvas):** `#000000` base with no elevation.
- **Level 1 (Rail & Base):** `#0a0a0c` to `#121215` with `1px solid rgba(255, 255, 255, 0.06)` border.
- **Level 2 (Elevated Surfaces):** `#161619` with `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4)` and `1px solid rgba(255, 255, 255, 0.08)`.
- **Level 3 (Interactive Overlays & Modals):** `#161619`/`95%` with `backdrop-filter: blur(16px)` and `box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8)`.

### Named Rules
**The Single-Border Rule.** Elevate with either a 1px border or a soft shadow, never thick double borders. Side-tab thick borders (`border-l-4`) are strictly prohibited.

## Shapes

- **Base Radius (`12px` / `--radius-md`):** Buttons, message bubbles, input fields, and hover highlight containers.
- **Large Radius (`16px`–`24px` / `--radius-lg`):** Modals, notification cards, server icon tiles, and dropdown menus.
- **Circular (`9999px` / `rounded-full`):** User avatars, status presence badges, and icon action pills.

## Components

### Buttons
- **Primary Action (`.btn-orange`):** Solid `#FF5C00` background with `12px` radius, bold white text, and `0 4px 14px rgba(255, 92, 0, 0.4)` glow. On hover, shifts to `#ff751a` with `-1px` transform.
- **Secondary Action:** Dark slate `#1c1c21` surface with `1px solid #27272a` border and white text. On hover, shifts to `#25252b`.
- **Destructive / Danger:** Dark crimson `#1c1416` with `1px solid rgba(239, 68, 68, 0.4)` border and `#f87171` text. On hover, transitions to solid `#dc2626`.
- **Icon Action Buttons:** `40×40px` minimum bounding box with `text-zinc-400 hover:text-white` transition and explicit `aria-label`.

### Inputs / Search Bars
- **Style:** Deep charcoal `#1c1c21` surface, `1px solid #27272a` border, `12px`–`16px` radius, crisp `#f4f4f5` text with `#71717a` placeholder.
- **Focus:** `1px solid #FF5C00` border with subtle `0 0 0 1px #FF5C00` ring.

### Message Bubbles
- **Own Messages:** Vibrant `#FF5C00` surface, white text, `16px` radius with squared top-right corner (`rounded-tr-none`).
- **Peer Messages:** Dark charcoal `#1c1c21` surface, `1px solid rgba(255, 255, 255, 0.08)` border, zinc-100 text, `16px` radius with squared top-left corner (`rounded-tl-none`).
- **Mention Highlight:** `#1e1c18` tinted surface with `1px solid rgba(255, 92, 0, 0.4)` border.

### Badges & Chips
- **Role Tags:** Rounded `6px` badge with uppercase `10px` bold text (Owner: Amber, Admin: Emerald, Mod: Purple).
- **Mention Pills (`@username`):** Inline `#FF5C00`/25% background with `#FF5C00` text, `1px solid #FF5C00/50` border, and `4px` radius. Fully keyboard-accessible.

## Do's and Don'ts

### Do:
- **Do** maintain a strict 4.5:1 minimum contrast ratio for all body and informational copy.
- **Do** ensure all icon-only interactive controls include descriptive `aria-label` attributes and keyboard event handlers (`onKeyDown` for Enter/Space).
- **Do** apply `loading="lazy"` and `decoding="async"` to all media elements and user avatars.
- **Do** constrain accent orange (`#FF5C00`) to interactive actions, active states, and real-time alerts.
- **Do** provide immediate, high-signal feedback states for network latency, file upload errors, and room connection drops.

### Don't:
- **Don't** use generic saturated rainbow colors (plain blue, red, green) outside designated status tokens.
- **Don't** use dated bounce easing (`animate-bounce`); use smooth exponential deceleration (`cubic-bezier(0.4, 0, 0.2, 1)`).
- **Don't** use asymmetric side-tab accent borders (`border-l-4`). Use cohesive 1px borders or subtle background tints.
- **Don't** allow interactive touch targets to drop below 40×40px on mobile screens.
- **Don't** render unstyled browser defaults for scrollbars, caret colors, or text selection; always theme from the palette.
