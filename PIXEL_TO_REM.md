# Pixel to Rem Conversion

## Summary
Converted all pixel (px) values to relative units (rem) for better scalability and accessibility.

## Changes Made

### CSS Files
- **index.css**
  - Media query: `640px` → `40rem` (mobile breakpoint)

### Component Files

#### Inline Styles (maxWidth)
- **App.tsx**: `800px` → `50rem`
- **Header.tsx**: `800px` → `50rem`
- **Calculator.tsx**: `800px` → `50rem`

#### Tailwind Classes (min-height, min-width)
- **Results.tsx**: `min-w-[120px]` → `min-w-[7.5rem]`
- **Calculator.tsx**: `min-h-[200px]` → `min-h-[12.5rem]` (2 occurrences)

## Conversion Reference

Base font size: 16px (browser default)

| Pixels | Rem   | Usage                    |
|--------|-------|--------------------------|
| 120px  | 7.5rem| Minimum width            |
| 200px  | 12.5rem| Minimum height          |
| 640px  | 40rem | Mobile breakpoint        |
| 800px  | 50rem | Max content width        |

## Benefits

1. **Better Accessibility**: Respects user's browser font size settings
2. **Responsive Scaling**: Content scales proportionally with root font size
3. **Consistency**: All sizing now uses relative units
4. **Future-proof**: Easier to adjust global sizing via root font-size

## Testing

The application should look identical to before, but now:
- Users can zoom more effectively
- Content scales better with browser font size changes
- Better support for accessibility tools
