# 🎨 Custom Color Palette

## Primary Colors

### Background (`--color-bg`)

- **Hex**: `#FFFFFF`
- **Usage**: Main background color
- **Tailwind**: `bg-bg`

### Base (`--color-base`)

- **Hex**: `#F9FAFB`
- **Usage**: Secondary background, cards, hover states
- **Tailwind**: `bg-base`

### Primary (`--color-primary`)

- **Hex**: `#4CAF91`
- **Usage**: Primary brand color, buttons, links
- **Tailwind**: `bg-primary`, `text-primary`, `border-primary`

### Accent (`--color-accent`)

- **Hex**: `#FFD265`
- **Usage**: Highlights, warnings, special elements
- **Tailwind**: `bg-accent`, `text-accent`

### Dark (`--color-dark`)

- **Hex**: `#1F2937`
- **Usage**: Text, borders, dark elements
- **Tailwind**: `bg-dark`, `text-dark`

## Text Colors

### Text (`--color-text`)

- **Hex**: `#111827`
- **Usage**: Primary text color
- **Tailwind**: `text-text`

### Text Secondary (`--color-text/70`)

- **Hex**: `#111827` with 70% opacity
- **Usage**: Secondary text, descriptions
- **Tailwind**: `text-text/70`

### Text Tertiary (`--color-text/40`)

- **Hex**: `#111827` with 40% opacity
- **Usage**: Disabled text, placeholders
- **Tailwind**: `text-text/40`

## Visual Examples

### Background Colors

<div style="display: flex; gap: 1rem; margin: 1rem 0;">
  <div style="width: 100px; height: 60px; background: #FFFFFF; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px;">bg-bg<br/>#FFFFFF</div>
  <div style="width: 100px; height: 60px; background: #F9FAFB; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px;">bg-base<br/>#F9FAFB</div>
  <div style="width: 100px; height: 60px; background: #4CAF91; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white;">bg-primary<br/>#4CAF91</div>
  <div style="width: 100px; height: 60px; background: #FFD265; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px;">bg-accent<br/>#FFD265</div>
  <div style="width: 100px; height: 60px; background: #1F2937; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white;">bg-dark<br/>#1F2937</div>
</div>

### Text Colors

<div style="display: flex; gap: 1rem; margin: 1rem 0;">
  <div style="width: 100px; height: 60px; background: #F9FAFB; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #111827;">text-text<br/>#111827</div>
  <div style="width: 100px; height: 60px; background: #F9FAFB; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: rgba(17, 24, 39, 0.7);">text-text/70<br/>70% opacity</div>
  <div style="width: 100px; height: 60px; background: #F9FAFB; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; color: rgba(17, 24, 39, 0.4);">text-text/40<br/>40% opacity</div>
</div>

## Usage in Components

### Buttons

```tsx
// Primary button
<Button className="bg-primary hover:bg-primary/90 text-white">

// Secondary button
<Button className="bg-base hover:bg-base/80 text-text border border-base">

// Accent button
<Button className="bg-accent hover:bg-accent/90 text-dark">
```

### Cards

```tsx
// Card container
<div className="bg-bg rounded-xl shadow-lg border border-base p-8">

// Card header
<div className="border-b border-base pb-6 mb-6">
```

### Text

```tsx
// Primary text
<h1 className="text-text text-4xl font-bold">

// Secondary text
<p className="text-text/70 text-lg">

// Disabled text
<span className="text-text/40">
```

## VS Code Extensions for Color Visualization

1. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)

   - Provides autocomplete for Tailwind classes
   - Shows color previews in suggestions

2. **Color Highlight** (`naumovs.color-highlight`)

   - Highlights color values in code
   - Shows color previews inline

3. **Colorize** (`kamikillerto.vscode-colorize`)
   - Already installed
   - Highlights CSS color values

## Tips for Using Colors

- Use `bg-bg` for main backgrounds
- Use `bg-base` for cards and hover states
- Use `text-text` for primary text
- Use `text-text/70` for secondary text
- Use `text-text/40` for disabled/placeholder text
- Use `border-base` for subtle borders
- Use `border-primary` for focused/active borders
