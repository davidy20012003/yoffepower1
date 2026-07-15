# Yoffe Power

Official website of David Yoffe Consulting & Testing.

Electrical Engineering Consulting Electrical Testing (Bodek 3) Hospital Electrical Systems UPS & Critical Power.

## Technical Foundation

Technical foundation for a multilingual professional website built with Next.js App Router, TypeScript, Tailwind CSS, and ESLint.

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test:cable
```

## Routes

- `/he` Hebrew, RTL, default locale
- `/en` English, LTR
- `/he/cable-calculator` local Hebrew RTL cable ampacity calculator review page

## Local Cable Calculator

The local calculator is intentionally not linked to yoffepower.com. Run:

```bash
pnpm dev
```

Then open `http://localhost:3000/he/cable-calculator`.

The calculator uses structured TypeScript data files under `src/cable-calculator/`.
Installation-method images are loaded from `public/images/` using the Hebrew
method marking in the filename.
