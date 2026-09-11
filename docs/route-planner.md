# Routes and mileage

Routes: `/es/tools/routes` and `/en/tools/routes`. Listed in Logistics, search, and the registry-driven sitemap. All calculations and exports run locally. No map API, geocoding, live traffic or routing engine is used. Per-leg Google Maps links open only after a user click.

## Inputs and distance provenance

Origin, departure, vehicle, average speed and one or more stops. Each stop holds km from the previous point, its provenance (user-entered / manual estimate / externally consulted), a reference for external consultations, delivery flag, loading/unloading minutes, refuelling minutes and cost, tolls and planned nights. Changing the order requires checking distances again. An external reference is user supplied, not independently verified.

Advanced inputs cover initial loading, overnight duration, fixed UTC offset, currency, mileage rate, hourly rate and paid-hour basis, allowances per started 24 hours and accommodation per budgeted night. Rates cover the trip; they are not automatically multiplied by driver count. Fuel is separately optional to avoid charging it twice when already included in mileage rates.

## Scheduling model

Free mode adds explicit driving, service, refuelling and overnight time. EU mode is an indicative general goods-transport model under Regulation (EC) 561/2006. It assumes all selected drivers start after a completed daily rest. It accepts each driver's current Monday–Sunday week history, previous week history and already used 10-hour extensions, plus hours since the last weekly rest ended.

- 9 driving hours per daily period; optional 10 hours with at most two extensions per week/driver.
- 45-minute full break after 4.5 driving hours; working stops do not reset the counter.
- 11-hour daily rest with a single driver; 9-hour rest with a crew of two present throughout, stationary during rest.
- Work and driving are contained in 13-hour / 21-hour duty windows to leave the daily rest inside 24 / 30 hours.
- Team driving alternates individual drivers. At least 45 minutes without assisting while the other drives resets the passenger's break counter.
- 56 hours per calendar week and 90 hours across consecutive weeks, using driver histories and splitting drive events at Monday boundaries.
- Regular 45-hour weekly rests before exceeding six 24-hour periods from the end of the last weekly rest. Exhausted weekly budgets can require a longer wait for the next calendar week.

The country selector identifies the reference EU country. National/intra-EU international modes share the general limits; no national or temporary derogations are applied. Other countries require free mode. Not a legal compliance certificate: no AETR, reduced-rest compensation, ferry exceptions, return obligations, working-time directive, night-work limits, mass-based applicability, traffic or road restrictions are checked. The vehicle selector changes an editable speed assumption, not legal applicability.

Time display uses the explicitly shown fixed UTC offset; no automatic destination-zone or daylight-saving transition adjustment. Calendar exports use actual UTC timestamps. ETA is arrival at the final stop; completion also includes final service and planned nights.

Budgeted nights count each daily rest/planned overnight and each started 24 hours of a weekly rest/wait. This is an accommodation budgeting convention, not actual hotel bookings or geographical midnight detection.

## Outputs

Itinerary with start/end, activity, leg/place, driver, km and hours; totals, costs, ETA, completion, per-delivery cost, distance provenance and weekly reports. PDF itinerary, PDF rest report, Excel (itinerary/rest/summary/legs), configurable CSV, RFC 5545 ICS and text mileage/payment summary. Existing `saveFile` naming is reused.

## References, checked 2026-09-11

- https://transport.ec.europa.eu/transport-modes/road/social-provisions/driving-time-and-rest-periods_en
- https://transport.ec.europa.eu/transport-modes/road/mobility-package-i/driving-rest-times_en
- https://europa.eu/youreurope/citizens/work/work-abroad/rules-working-road-transport/index_en.htm
- https://eur-lex.europa.eu/eli/reg/2006/561/2024-12-31

## Verification

`tests/routes.test.mjs` checks exact costs and activity duration, break boundary behavior, working stops, single/team driving, 10-hour extensions, duty windows, long trips, weekly and fortnightly budgets, Monday rollover, invalid inputs, and ICS UTC timestamps/escaping/UTF-8 folding.

Implementation: `lib/routes.ts`, `components/route-workspace.tsx`, `components/route-workspace.module.css`. No extension files are modified.
