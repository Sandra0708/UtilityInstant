# Localización de UtilityInstant

Disponibles: inglés, alemán, japonés, francés, español, neerlandés, italiano y portugués de Portugal. El selector usa nombres nativos y admite preferencias regionales del navegador. El idioma no modifica moneda, normativa ni datos del usuario.

## Estructura y mantenimiento

lib/localization/languages.ts define idiomas y formatos. index.ts reúne navegación, herramientas, opciones, resultados, errores y explicaciones. privacy.ts contiene privacidad. source.ts, options-source.ts y privacy-source.ts son índices estables: no regenerarlos ni reordenarlos. Para nuevas claves usar supplement.ts y completar los seis idiomas adicionales.

La interfaz, informes y etiquetas de exportación reciben el idioma explícitamente; los valores del usuario permanecen intactos. Rutas, canonical, hreflang, sitemap, búsqueda y HTML lang admiten los ocho idiomas. Fechas y números usan sus formatos regionales.

scripts/audit-translations.mjs genera work/translation-current.json. Las pruebas comprueban cobertura, codificación, privacidad, errores y equivalencia de cálculos. Comprobar también tipos, compilación y apertura de páginas tras cambios en componentes cliente. Guardar siempre UTF-8 y mantener use client como primera directiva.

## Criterio editorial

Redacción sin API de traducción. Alemán con du, francés con vous, neerlandés con je, italiano con tu, portugués con tu y japonés cortés. Conservar JSON, BSON, CSV y ObjectId. Distinguir intereses, amortización y comisiones; en logística, volumen, superficie, peso y carga útil. La traducción no implica adecuación normativa local ni revisión independiente por traductores nativos.
