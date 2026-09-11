# Phase 6 — Financial workspaces

The existing mortgage, loan, compound-interest, percentage, discount and VAT routes now use dedicated financial workspaces. Basic inputs remain visible; advanced controls, assumptions and full schedules are collapsible. JSON, passwords and cargo use their own unchanged workspaces.

## Features

- Mortgage: fixed, variable and mixed phases; manually entered Euribor, spread, revision interval and yearly index path; upfront/annual costs, insurance, grace, one-off and recurring prepayments, lower payment or shorter term; saved comparisons and lower/base/higher rate scenarios.
- Loan: French level payment, German level principal and American bullet principal; 1/2/4/12/52 payments per year; interest-only or total grace; prepayments, fees, full schedule and total financing cost.
- Investment: initial and periodic contributions, contribution timing/frequency/growth, effective annual return, inflation, percentage/fixed/entry fees, configurable exit or annual tax, scenarios, ROI, flow-adjusted CAGR and contribution/profit chart.
- Prices: percentage modes, increases, sequential discounts, included/excluded VAT, withholding, shipping, unit cost, profit, margin, markup, savings and comparison.
- Every financial workspace exports an Excel workbook and a multipage PDF containing results, the full schedule and assumptions. Comparisons include their inputs. Names use `yyyymmdd_hhmmss_utilityinstant_tools_<id>`.

## Calculation conventions

Debt uses nominal annual rate divided by payment frequency, end-of-period payments and cent rounding. Grace is included in the term; total grace capitalizes interest. Extra principal is paid after the scheduled payment. Upfront fees are paid separately. Annual expenses are prorated per payment until payoff. Variable rates floor at zero. Missing yearly indices repeat the final entered index. Index inputs are assumptions, never live data. Shortening a bullet loan means it ends only if extras repay all principal; otherwise extras reduce the maturity balance. This is not statutory APR/TAE.

Investment uses the equivalent monthly rate of an effective annual return. Fees cannot exceed available assets. Tax applies to positive gains, with no loss-offset model. Annual tax settles each year and resets basis; exit tax is hypothetical at each displayed year. CAGR chains period performance adjusted for external contributions, excluding contribution entry fees. ROI includes all paid contributions and fees. Neither is a market prediction.

Prices apply increases then successive discounts, remove included VAT, add net shipping, then calculate VAT and withholding on that base. Shipping is passed through at cost and shares the goods' VAT. Profit excludes VAT/withholding; margin uses net sales including shipping. No automatic country tax rules.

## Validation

Known mortgage and amortization examples; balance/cash-flow reconciliation for all loan systems and frequencies; zero interest; both grace modes; prepayment strategies; mixed-rate resets; annual tax and fees; no-return contributions; inflation; CAGR flow treatment; sequential discounts and included VAT; invalid inputs; multipage PDF cross-reference integrity. The browser export code uses generated images and native spreadsheet cells, with no uploaded financial inputs.

## Delivery state

Cargo was published separately before this phase. Phase 6 is implemented locally for review; production deployment of phase 6 is pending.
