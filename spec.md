# Specification

## Summary
**Goal:** Add a Font Family selector with 12 font options (Inter, Poppins, Montserrat, Roboto, Open Sans, Lato, Nunito, Playfair Display, Merriweather, Source Sans 3, JetBrains Mono, and Castellar) to the app settings.

**Planned changes:**
- Add Google Fonts `<link>` preconnect and stylesheet tags in `index.html` for all 11 web fonts (plus Cinzel Decorative as Castellar fallback), using `font-display=swap`
- Extend `tailwind.config.js` `fontFamily` config with all 12 new font families; Castellar uses the stack `'Castellar', 'Cinzel Decorative', 'Cinzel', serif`
- Update `storage.ts` fontFamily utility to support all 12 new font name values
- Extend `appStore.ts` font options list with all 12 new fonts; apply selected font to the DOM using the existing mechanism
- Add a "Font Family" dropdown in `SettingsPage.tsx` font settings section listing all new (and existing) font options, persisting selection via existing localStorage
- Extend the font selector on `QuotePage.tsx` (if present) with the same 12 new font options

**User-visible outcome:** Users can open Settings and choose from 12 new font families; the selected font is applied app-wide and persisted across sessions. The default font and all existing options remain unchanged.
