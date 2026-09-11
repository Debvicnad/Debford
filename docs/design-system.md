# DEBFORD — Design System

---

## 1. Design Philosophy

Debford's visual language communicates:

- **Premium** — credible enough for a high-end dealership
- **Modern** — clean, contemporary, technologically confident
- **Trustworthy** — professional and honest
- **Automotive** — feels native to the vehicle world
- **Approachable** — not intimidating for everyday vehicle owners

The interface should feel like the product of a well-funded automotive technology company, not a generic marketplace template.

---

## 2. Color System

### Primary Palette

```css
/* Brand — Deep automotive midnight blue */
--color-brand-50:  #EFF6FF;
--color-brand-100: #DBEAFE;
--color-brand-200: #BFDBFE;
--color-brand-300: #93C5FD;
--color-brand-400: #60A5FA;
--color-brand-500: #3B82F6;
--color-brand-600: #2563EB;
--color-brand-700: #1D4ED8;
--color-brand-800: #1E40AF;
--color-brand-900: #1E3A8A;
--color-brand-950: #0F1F4B;  /* Primary brand dark */
```

### Accent Palette

```css
/* Accent — Automotive gold/amber for premiums and highlights */
--color-accent-50:  #FFFBEB;
--color-accent-100: #FEF3C7;
--color-accent-200: #FDE68A;
--color-accent-300: #FCD34D;
--color-accent-400: #FBBF24;
--color-accent-500: #F59E0B;
--color-accent-600: #D97706;
--color-accent-700: #B45309;
--color-accent-800: #92400E;
--color-accent-900: #78350F;
```

### Neutral Palette

```css
/* Neutral — Slate-based for text and surfaces */
--color-neutral-0:   #FFFFFF;
--color-neutral-50:  #F8FAFC;
--color-neutral-100: #F1F5F9;
--color-neutral-200: #E2E8F0;
--color-neutral-300: #CBD5E1;
--color-neutral-400: #94A3B8;
--color-neutral-500: #64748B;
--color-neutral-600: #475569;
--color-neutral-700: #334155;
--color-neutral-800: #1E293B;
--color-neutral-900: #0F172A;
--color-neutral-950: #020617;
```

### Semantic Colors

```css
/* Status */
--color-success-500: #22C55E;
--color-success-100: #DCFCE7;
--color-warning-500: #F59E0B;
--color-warning-100: #FEF3C7;
--color-error-500:   #EF4444;
--color-error-100:   #FEE2E2;
--color-info-500:    #3B82F6;
--color-info-100:    #DBEAFE;
```

---

## 3. Typography

### Font Families

```css
/* Primary — Inter: clean, modern, professional */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;

/* Display — For hero headings and large feature text */
--font-display: 'Inter', system-ui, sans-serif;

/* Mono — For prices, specs, codes */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Font Scale

```css
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
--text-5xl:  3rem;      /* 48px */
--text-6xl:  3.75rem;   /* 60px */
--text-7xl:  4.5rem;    /* 72px */
```

### Font Weights

```css
--font-regular:   400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;
--font-extrabold: 800;
```

---

## 4. Spacing System

Tailwind default spacing scale.
Key values used throughout:

```
4px  → 1   (tight padding, icons)
8px  → 2   (compact elements)
12px → 3   (small gaps)
16px → 4   (base unit)
20px → 5
24px → 6   (section padding)
32px → 8   (card padding)
40px → 10
48px → 12  (section gaps)
64px → 16  (major section spacing)
80px → 20  (hero padding)
96px → 24  (page sections)
128px → 32
```

---

## 5. Border Radius

```css
--radius-sm:   0.25rem;  /* 4px — tags, badges */
--radius-md:   0.5rem;   /* 8px — inputs, buttons */
--radius-lg:   0.75rem;  /* 12px — cards */
--radius-xl:   1rem;     /* 16px — panels */
--radius-2xl:  1.5rem;   /* 24px — modals, overlays */
--radius-full: 9999px;   /* Pills, avatars */
```

---

## 6. Shadows

```css
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
--shadow-sm: 0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
--shadow-md: 0 4px 8px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
--shadow-lg: 0 12px 24px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.04);
--shadow-xl: 0 24px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06);
```

---

## 7. Dark Mode

Debford supports dark mode as the primary/default mode with light mode available.

### Dark Mode Background Layers
```css
/* Surface hierarchy — dark mode */
--bg-base:      #0F172A;  /* Page background */
--bg-surface:   #1E293B;  /* Card background */
--bg-overlay:   #334155;  /* Elevated panels */
--bg-input:     #1E293B;  /* Input fields */
--bg-highlight: #1D4ED8;  /* Active/selected states */
```

### Dark Mode Text
```css
--text-primary:   #F8FAFC;  /* Main text */
--text-secondary: #94A3B8;  /* Supporting text */
--text-muted:     #64748B;  /* Placeholders, disabled */
--text-inverse:   #0F172A;  /* Text on light backgrounds */
```

---

## 8. Component Specification

### Button

Variants:
- `primary` — brand blue, high emphasis
- `secondary` — outlined, medium emphasis
- `ghost` — transparent, low emphasis
- `danger` — red, destructive actions
- `accent` — gold, premium actions

Sizes:
- `sm` — h-8, px-3, text-sm
- `md` — h-10, px-4, text-sm (default)
- `lg` — h-12, px-6, text-base
- `xl` — h-14, px-8, text-lg

States:
- default, hover, active, focus, disabled, loading

### Badge / StatusBadge

Used for: listing status, verification status, auction state, booking status.

Variants: `success`, `warning`, `error`, `info`, `neutral`, `brand`

### VehicleCard

Grid card displaying vehicle listings.

Sections:
1. Image (aspect-ratio: 4/3, lazy loaded)
2. Badge row (condition, featured, auction, rental)
3. Title (year + make + model)
4. Price (prominent, mono font)
5. Key specs (mileage, fuel, transmission)
6. Location + seller type
7. Favorite button (top-right overlay)

Variants:
- `grid` — standard card view
- `list` — horizontal compact view
- `featured` — larger hero card

### VehicleGallery

Full-width image gallery with:
- Primary image display
- Thumbnail strip
- Full-screen lightbox
- Keyboard navigation
- Touch swipe (mobile)

### VehicleFilters

Sidebar filter panel:
- Vehicle type pills
- Category accordion
- Make/model selectors
- Year range slider
- Price range slider
- Mileage range
- Fuel type checkboxes
- Transmission checkboxes
- Location input
- Clear all / Apply buttons

### PriceDisplay

```
$125,000
or
$125,000 — Negotiable
or
From $85/day
or
Starting bid: $50,000
```

Large, bold, mono-font price. Currency always visible.

### VerificationBadge

Displays verification level:
- 🔵 Unverified
- ✅ Basic Verified
- 🏢 Business Verified
- 🏆 Dealer Verified
- 🔧 Professional Verified

### AuctionTimer

Live countdown display:
```
AUCTION ENDS IN
02:14:37
Days  Hours  Minutes  Seconds
```

Turns red when under 1 hour remaining.

### BidPanel

For auction pages:
- Current highest bid
- Bid history (latest N bids)
- Enter bid amount
- Place Bid CTA
- Eligibility status
- Reserve met / not met indicator

### DashboardSidebar

Navigation for seller/dealer/provider/admin dashboards.
Collapsible on mobile.

### NotificationCenter

Dropdown from header icon.
Shows recent notifications with mark-as-read.

---

## 9. Breakpoints

```css
/* Mobile first */
sm:  640px   /* Large phones */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large desktops */
```

---

## 10. Grid System

```
Mobile:  1 column
Tablet:  2 columns
Desktop: 3 columns
Large:   4 columns
```

Max content width: `1440px` with `auto` horizontal margins.
Content padding: `px-4` (mobile) → `px-8` (tablet) → `px-16` (desktop)

---

## 11. Animation Principles

- Transitions: `150ms ease` for micro-interactions (hovers, focus)
- Entrances: `200ms ease-out` for modals, dropdowns
- Page transitions: minimal, `100ms` fade
- Auction timer: real-time, no animation delay
- Loading skeletons: subtle pulse animation

Do not use animations that delay content delivery.
Do not animate large layout shifts.

---

## 12. Icon System

Primary: `lucide-react` (consistent, clean, MIT licensed)

Supplemental: Custom SVG for automotive-specific icons where needed (car, bike, truck, wrench, auction hammer).

---

## 13. Imagery Guidelines

- Vehicle images: always 4:3 or 16:9 aspect ratio
- Minimum quality: 800px wide
- Use `next/image` for all images (optimization, lazy loading, WebP)
- Background: dark for hero images
- No stock photo clichés — favor real automotive photography

---

## 14. Tailwind Configuration

Key customizations to `tailwind.config.ts`:

```typescript
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: { /* brand palette */ },
        accent: { /* accent palette */ },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
      },
    },
  },
  plugins: [],
}
```

---

_Last updated: 2026-09-09_
_Status: Architecture Phase 0_
