# Health tools — batch 1

Four new tools: `bmi`, `tdee`, `body-fat`, `ideal-weight`. Shared compact workspace, eight authored language catalogs, localized URLs and metadata, FAQ structured data, metric/imperial inputs, tab-separated copy and XLSX summaries. No measurements in storage or URLs; body-fat → Katch transfer is in component memory.

Pure calculations live in `lib/engines/`. Existing tools retain their calculation paths. A shared workspace handles conditional inputs, regional BMI thresholds, minor warnings and charts without changing the generic forms used by existing tools.

## Method decisions

- BMI classifications use the unrounded number. Japan defaults to JASSO, with an explicit selector for international thresholds. Under 18: no adult classification, reference range or adult scale. Omitted age assumes an adult.
- TDEE: simplified Mifflin–St Jeor or Katch–McArdle; activity multiplies resting expenditure once. ±15% scenarios. Reduced scenario never below 1500/1200 kcal; omitted when its floor would exceed maintenance. These are estimates, not prescribed diets.
- Body fat: metric Hodgdon–Beckett density/Siri equation or Deurenberg. Measurement instructions and limitations visible. Reject impossible geometry/results instead of clipping them into plausible values.
- Indicative weight: Devine, Robinson, Miller, original Hamwi pounds converted exactly to kg. Five-foot baseline is **152.4 cm**, not rounded 152 cm. No formula extrapolation below that height. Reference range uses 18.5 ≤ BMI < 25.
- Age and anthropometry are explicit inputs; the formulas cannot diagnose, apply during pregnancy or determine a personal treatment target.

## Sources

- https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html
- https://www.jasso.or.jp/data/magazine/pdf/chart_A.pdf
- https://pubmed.ncbi.nlm.nih.gov/2305711/
- https://www.niddk.nih.gov/health-information/weight-management/body-weight-planner
- https://pubmed.ncbi.nlm.nih.gov/2043597/
- https://escholarship.org/content/qt9451r851/qt9451r851.pdf
- https://pubmed.ncbi.nlm.nih.gov/27030535/

Next requested batch: hours/duration and time zones. Existing-tool improvements remain separate, including one-off additional payments for loans and mortgages. No blanket migration of existing URLs or numerical engines in this batch.
