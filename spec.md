# Specification

## Summary
**Goal:** Add a shared date/time formatter used everywhere, introduce gold/yellow accent color presets with a gold default, and apply the accent color consistently across all primary UI elements via CSS custom properties.

**Planned changes:**
- Create a shared `formatDateTime(ts)` utility in `frontend/src/utils/formatDateTime.ts` returning `'DD MMM YYYY, h:mm A'` format, with a 12:00 AM fallback for date-only inputs and a safe fallback on errors
- Replace all bare date displays throughout the app (streak check-in, record created-at, note timestamps, todo dates, habit logs, export/import logs) with `formatDateTime`, and store new timestamps as `new Date().toISOString()`
- Add five gold/yellow preset swatches to the accent color picker in Settings: Gold (#D4AF37), Golden Yellow (#FFC300), Amber Gold (#FFB000), Deep Gold (#B8860B), Warm Yellow (#FFD54A); default to Gold (#D4AF37) when no preference is saved
- Ensure bright gold accents use dark text and subtle border/shadow for readability in light mode; add hover/active states via brightness adjustment
- Introduce three CSS custom properties (`--accent`, `--accent-2`, `--accent-soft`) computed and applied to `:root` whenever the accent changes
- Apply `var(--accent)` consistently to primary CTA buttons, active nav indicators (bottom tab bar and sidebar), selected filter chips, progress bars, streak ring, and routine timeline markers

**User-visible outcome:** All dates in the app show both date and time in a consistent format, the accent color picker offers gold presets (defaulting to Gold), and the chosen accent color is immediately and uniformly reflected across buttons, nav, chips, progress bars, and streak/routine visuals.
