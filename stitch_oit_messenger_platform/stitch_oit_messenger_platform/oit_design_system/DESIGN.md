---
name: Oit Design System
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#e4beb1'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#ab897d'
  outline-variant: '#5b4137'
  surface-tint: '#ffb59a'
  primary: '#ffb59a'
  on-primary: '#5a1b00'
  primary-container: '#ff5c00'
  on-primary-container: '#521800'
  inverse-primary: '#a73a00'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#c8c6c5'
  on-tertiary: '#313030'
  tertiary-container: '#949292'
  on-tertiary-container: '#2c2b2b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbce'
  primary-fixed-dim: '#ffb59a'
  on-primary-fixed: '#370e00'
  on-primary-fixed-variant: '#802a00'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474646'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
The design system for this communication platform is built on a "High-Voltage Dark" aesthetic. It targets a modern, tech-savvy audience that values speed, precision, and a focused environment for chatting and calling. The brand personality is unapologetically energetic, utilizing a deep black canvas to make vibrant primary accents feel like they are emitting light.

The style is **Modern/High-Contrast**, leaning into the clarity of dark mode by default. It avoids unnecessary skeuomorphism, opting instead for crisp edges, purposeful vibrant hits of color, and a sense of architectural depth created through tonal layering rather than traditional heavy shadows.

## Colors
The palette is dominated by **Oit Black** to ensure maximum contrast and energy for the **Oit Orange** primary color.

- **Primary (#FF5C00):** Used for critical actions, active states, notification badges, and brand moments.
- **Background (#000000):** The base layer for all screens to provide a "pure" dark experience.
- **Surface (#121212):** Used for elevated containers, input fields, and navigation bars to create subtle separation from the background.
- **Text Primary (#FFFFFF):** High-readability white for headings and active message bubbles.
- **Text Secondary (#888888):** Muted gray for timestamps, metadata, and placeholder text to maintain hierarchy.

## Typography
This design system utilizes **Inter** for its systematic, utilitarian, and modern qualities. The type hierarchy is designed to handle dense information (chat lists) and expansive interactions (video calls) with equal clarity.

Tighten letter-spacing on larger headlines to enhance the "sleek" brand feel. Use uppercase for labels and small metadata to provide a technical, structured appearance. Secondary text should always utilize the muted gray color defined in the palette to ensure the user's eye gravitates toward the primary content.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a base 4px rhythm. 

- **Mobile:** 4-column layout with 16px margins and 16px gutters. Navigation is typically anchored to the bottom.
- **Desktop:** 12-column layout with 32px margins. Uses a multi-pane approach (Sidebar / Chat List / Conversation / Details) common in productivity tools.

Spacing is used to group related message bubbles tightly (4px) while separating distinct participants or time-blocks more generously (16px+).

## Elevation & Depth
Depth is communicated through **Tonal Layers** rather than shadows. In a true black interface, shadows are invisible, so we elevate components by lightening their surface color.

- **Level 0 (Base):** #000000 (Pure Black) for the main application background.
- **Level 1 (Surfaces):** #121212 (Dark Gray) for sidebar containers, top bars, and input areas.
- **Level 2 (Popovers):** #1E1E1E for modals, menus, and tooltips, accented with a 1px border of #2A2A2A to define the silhouette against the dark background.
- **Interactive:** Use Oit Orange strictly for interaction states, never for background surfaces unless it is a primary call-to-action button.

## Shapes
The shape language is consistently **Rounded**, striking a balance between a friendly social app and a high-performance tool. 

- **Standard Elements:** 12px (0.75rem) for input fields, chat bubbles (asymmetric), and small cards.
- **Large Elements:** 24px (1.5rem) for main action containers and modal sheets.
- **Avatars:** Strictly circular to contrast against the geometric grid of the UI.
- **Buttons:** Fully pill-shaped (rounded-xl) to make them feel tactile and distinct from content containers.

## Components
- **Buttons:** Primary buttons are Solid Oit Orange with White text, using a bold weight. Secondary buttons use a ghost style with an Oit Orange border or a subtle gray surface.
- **Chat Bubbles:** Sent messages are Oit Orange with White text (12px radius, with the bottom-right corner sharp). Received messages are Surface Gray with White text (12px radius, with the bottom-left corner sharp).
- **Chips:** Used for status indicators (e.g., "Online," "In Call"). Small, pill-shaped, with a 1px border and a small leading dot icon.
- **Inputs:** Dark Gray (#121212) background with a subtle border that glows Oit Orange on focus.
- **List Items:** High-density with 16px padding. Active/Selected states use a subtle #1A1A1A background and a 2px Oit Orange vertical "indicator" on the leading edge.
- **Cards:** Used for media previews and link embeds. 12px corner radius with a 1px #2A2A2A border for definition.