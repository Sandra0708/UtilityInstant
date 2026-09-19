# Lote 3 — movilidad y consumo

Tres workspaces compactos con motor puro compartido en `lib/engines/mobility.ts`, definición completa de catálogo, ocho idiomas y slugs localizados. Entran por `MobilityWorkspace` para evitar ampliar el formulario genérico con campos condicionales incompatibles.

## Combustible
- Distancia en km o millas, consumo L/100 km, km/L, MPG US, MPG imperial y kWh/100 km.
- Precio por litro, galón US, galón imperial o kWh, según corresponda. Cambiar unidades compatibles convierte el valor; pasar de combustible a eléctrico carga un ejemplo editable.
- Coste total, por persona y por km. Comparativa plegable entre dos vehículos, incluidos eléctricos; importe B − A explícito.
- Conversiones exactas: milla = 1,609344 km, galón US = 3,785411784 L, imperial = 4,54609 L.
- Desde un resultado válido de Rutas se enlaza con `?km=...`; el kilometraje se valida antes de rellenarlo. No se transfiere una ruta ni se inventa una distancia de carretera.
- No incluye mantenimiento, peajes ni pérdidas adicionales de recarga. Moneda local editable, sin cambio de divisas.
- Fuente de unidades: https://www.nist.gov/document/appc-11-hb44-finalpdf

## Electricidad
- W activos × horas/día × días / 1000, más W de espera × (24 − horas/día) × días / 1000.
- Referencia anual de espera de 365 días separada: no se suma de nuevo al período.
- Potencias editables de portátil, televisor, calefactor, microondas, cafetera y ordenador de sobremesa. No son mediciones del aparato del usuario. Horas de ejemplo modificables y espera independiente.
- Referencia de potencias: documento presentado al Department of Public Service de Nueva York, octubre de 2025: https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7BE06C2C9A-0000-C644-BBEF-87AFFF9B1416%7D&DocTitle=Case+08-E-0836+-+Compliance+Filing+Re+Fourth+Ordering+Clause
- `data/electricity-prices.json`: 27 países UE, Eurostat 2025-S2, banda DC (2.500–4.999 kWh/año), impuestos incluidos, EUR/kWh; Estados Unidos, EIA 2025 residencial preliminar, USD/kWh.
- Cada registro incluye `country`, `price`, `currency`, `period`, `verified_on`, `source` y `scope`; verificados el 18-09-2026. Fuente original enlazada en el selector y exportación.
- Datos estáticos incorporados a la web: ninguna petición API de precios durante el uso. No prometer actualización automática; actualizar JSON y fecha al verificar una nueva publicación.
- Seleccionar país rellena precio y moneda explícitos. Editar el precio o moneda vuelve a modo manual. Las medias históricas pueden incluir costes fijos: la calculadora estima coste energético, no reproduce una factura.
- Para países sin referencia, incluido Japón, se puede introducir contrato y moneda manualmente. No inventar promedios.

## Ritmo de carrera
- min:seg/km, min:seg/milla, km/h. Distancia objetivo hasta 200 km con 5K, 10K, media y maratón predefinidos.
- Tabla de parciales por km o milla, incluido último tramo parcial; cálculo sin redondear internamente, presentación al segundo.
- Resultados a ritmo constante para cuatro carreras. Predicción opcional independiente desde una marca h:mm:ss y distancia de referencia, exponente Riegel 1,06.
- Riegel es orientativo, especialmente entre distancias muy diferentes; no garantiza una marca.
- Fuente: https://pubmed.ncbi.nlm.nih.gov/7235349/

## Verificación y exportaciones
- 129 pruebas del proyecto superadas en la primera pasada; casos propios: galones y precios equivalentes, eléctrico, reparto por ocupantes, espera sin doble cómputo, parciales y Riegel, entradas inválidas y ocho traducciones.
- Copiar con tabuladores, CSV y Excel. Nombres de descarga usan el helper común de fecha/hora e identificador de herramienta.
- Cambiar entradas marca el resultado anterior y bloquea la exportación hasta recalcular. Datos de entrada no se guardan ni envían; el historial general registra herramienta y fecha.
- No se cambian cálculos de salud, finanzas ni los demás lotes.
