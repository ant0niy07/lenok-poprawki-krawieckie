# LenOK Poprawki Krawieckie

Production-ready React/Vite/TypeScript website for LenOK, ul. Ludwika Narbutta 11/2a, Warsaw Mokotów. Routes: `/pl`, `/en`, `/ru` and localized privacy pages. Output: `dist`.

The visual layer uses a consolidated Motion architecture: a timed SVG atelier hero, scroll-linked continuous thread, transformable garment parts, reversible fabric fold, animated service stitches and a connected tailoring-process timeline. `prefers-reduced-motion` resolves all narrative paths and content to their completed static state.

## Commands

```bash
npm ci
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

## Launch blockers requiring owner approval

- Calculator prices reproduce the official LenOK price list supplied on 21 August 2026. Ranges use their midpoint for the calculable subtotal, “from” prices use the stated minimum, and individual-quote work adds no invented amount.
- Rating `4.9 ★ / 93 Google reviews` was supplied as project data; public search did not unambiguously identify this listing. Reconfirm it directly in Google Maps immediately before launch.
- The local photographs were supplied by LenOK and optimized without generative face or body editing. See `public/media/lenok/ATTRIBUTION.md`.
- Complete privacy-controller identity, legal basis, retention periods and contact details must be supplied and legally reviewed before launch.
- No opening hours, email, turnaround promise, payment methods, certification, awards or customer quotations are asserted.

## Vercel and lenok.pl

1. Import this GitHub repository into Vercel; framework preset: Vite, build command `npm run build`, output `dist`.
2. Set `VITE_SITE_URL=https://lenok.pl` and redeploy.
3. Add `lenok.pl` and `www.lenok.pl` in the Vercel project Domains panel.
4. Obtain the exact DNS records displayed by Vercel and configure them at the current domain provider. DNS is intentionally not changed by this project.
5. Redirect one hostname to the canonical hostname (`lenok.pl` recommended).
6. Verify SSL, canonical/hreflang metadata, `sitemap.xml`, and direct refresh of all localized and privacy routes.

`vercel.json` contains SPA rewrites and immutable asset caching. No secrets are required or committed.
