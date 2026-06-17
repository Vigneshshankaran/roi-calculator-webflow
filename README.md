# EquityList ROI Calculator — Webflow Code Component

A proper Vite + React project that publishes the ROI Calculator as a [Webflow Code Component](https://developers.webflow.com/code-components/introduction).

## Structure

```
├── webflow.json                                  ← Webflow library config
├── vite.config.ts
└── src/
    ├── main.tsx                                  ← local dev entry only
    └── components/ROICalculator/
        ├── ROICalculator.tsx                     ← the React component (all data + logic inlined)
        ├── ROICalculator.webflow.tsx             ← declareComponent() — what Webflow bundles
        └── ROICalculator.css                     ← Shadow DOM styles (fonts, keyframes)
```

## Develop locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Publish to Webflow

```bash
npx webflow auth login        # one-time, opens browser OAuth
npm run share                 # bundles + uploads to your Webflow workspace
```

After sharing, open the Webflow Designer → Add panel (A) → **Code Components** → "EquityList ROI Calculator" → drag **ROI Calculator** onto any page.

## Component props (editable in the Designer)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| Show Hero Section | Boolean | true | Toggles the headline/hero block above the calculator |
| Badge Text | Text | ROI Calculator · v2.4 | Small purple label above the headline |
| Title (before highlight) | Text | How much is managing equity on | First part of the headline |
| Title Highlighted Word | Text | spreadsheets | Italic purple highlighted word in the headline |
| Title (after highlight) | Text | costing you? | Last part of the headline |
| Subtitle | Text | Based on industry benchmarks… | Paragraph under the headline |
| CTA Button Text | Text | Book a demo | Label of the call-to-action button |
| CTA Button URL | Text | https://www.equitylist.co/contact | Link opened (new tab) by the CTA button |

## Notes

- The component renders inside a **Shadow DOM**, fully isolated from page CSS. Google Fonts (Inter, JetBrains Mono, Fraunces) are loaded via `@import` in `ROICalculator.css` since `<head>` links don't cross the Shadow DOM boundary.
- `ssr: true` is enabled. To avoid hydration mismatch, the component defaults to a desktop layout during SSR/hydration and transitions dynamically on mount via a `useEffect` layout checker.

