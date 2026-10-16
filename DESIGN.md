# SPaC Booking Management System — Design & UI System

## 1. Visual Language & Identity

The SPaC design language balances athletic energy with clean hospitality aesthetics. It combines a bold dark charcoal header with energetic electric lime accents and warm parchment backgrounds.

### 1.1 Color Palette
- **Primary Accent (Lime)**: `#ccff00` — Primary call-to-action buttons, active tab underlines, active stepper states, and focus rings.
- **Surface / Background (Parchment)**: `#f3f5e0` — Main page body background, soft and non-glaring.
- **Card Background**: `#ffffff` and `#FBFBF9` — White and warm off-white modal and container cards.
- **Primary Contrast (Ink)**: `#121212` — Headers, major navigation bars, and dark action buttons.
- **Borders & Dividers**: `#c4c9ac`, `#D4C9A8`, `#E7E5DC` — Subtle earthy olive borders providing structure without heavy black lines.
- **Status Indicator Badges**:
  - `Reserved`: `#ffed76` (background) / `#a5950c` (text)
  - `Completed`: `#baff95` (background) / `#4ea711` (text)
  - `Cancelled`: `#ff9d90` (background) / `#c42b2b` (text)
  - `Active (Staff)`: `#baff95` (background) / `#226307` (text)
  - `Inactive (Staff)`: `#ff9f92` (background) / `#be1a1a` (text)

### 1.2 Typography
- **Font Family**: `'Be Vietnam Pro', sans-serif`
- **Scale**:
  - Hero Header: `32px` to `42px` (ExtraBold 800, uppercase)
  - Section Headings: `22px` to `28px` (Bold 700)
  - Card Titles: `16px` to `18px` (SemiBold 600)
  - Body Text: `14px` (Regular 400 / Medium 500)
  - Captions & Table Labels: `10px` to `12px` (Medium 500 / Bold 700 uppercase tracking)

---

## 2. Component Patterns

### 2.1 3-Step Booking Stepper
- Sequential navigation: Step 1 (Date & Time), Step 2 (Players & Gear), Step 3 (Review & Policy).
- Visual timeline with completed (dark), active (lime), and upcoming (muted) circular indicators.
- Live summary footer updating total amounts dynamically.

### 2.2 Table & Row Action Menus
- Standardized 10 rows per page pagination with previous/next controls and total page indicators.
- Three-dots (kebab) row action triggers using fixed-position menus that recalculate viewport boundaries to avoid container clipping.
- Filter chips and search bars that automatically reset page index to 1 on query modification.

### 2.3 Modals & Dialogs
- Centered overlay with backdrop blur (`backdrop-blur-xs`) and dark scrim (`bg-black/60`).
- Keyboard `Escape` and outside-click dismiss listeners.
- Confirmation workflows for destructive actions (e.g. `LogoutConfirmation`, `PopupSettingsResetConfirmation`).
