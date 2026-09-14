# Localización de UtilityInstant

## Idiomas solicitados

Inglés, alemán, japonés, francés, español, neerlandés, italiano y portugués. Portugués de Portugal como variante editorial inicial. Los nombres del selector deben aparecer en su propio idioma. La selección de idioma no debe cambiar la moneda, la normativa ni los datos del usuario.

## Estado real

- Español e inglés continúan siendo los dos idiomas públicos. No se han habilitado páginas incompletas en otros idiomas.
- `lib/localization/languages.ts` define los ocho idiomas y la selección por preferencias del navegador, incluyendo etiquetas regionales y prioridades.
- `lib/localization/common.ts`: navegación, portada, preferencias, categorías y anuncios redactados en los seis idiomas nuevos.
- `lib/localization/tools.ts`: nombres y descripciones de las herramientas redactados en los seis idiomas nuevos.
- `lib/localization/index.ts`: consulta de mensajes con respaldo explícito en inglés; no modifica ni traduce datos introducidos por usuarios.
- `lib/tools.ts` ya produce los textos a través de este catálogo. El tipo de idioma público sigue limitado a español e inglés hasta completar el contenido restante.
- `scripts/audit-translations.mjs` localiza pares de traducción en el código. Genera un inventario en `work/translation-inventory.json`. Es un inventario inicial, no una certificación de cobertura: faltan objetos con contenido largo, cadenas dinámicas y mensajes técnicos que deben revisarse manualmente.

## Pendiente antes de activar y publicar

1. Trasladar las elecciones binarias español/inglés de los componentes al sistema central, pasando el idioma explícitamente. No usar sustitución de texto del DOM ni traducir valores del usuario.
2. Redactar los controles, resultados, errores, ayudas, tablas, archivos y explicaciones de cada herramienta: cubicaje, rutas, finanzas, JSON, contraseñas y calculadoras generales.
3. Localizar la política de privacidad preservando su significado y la descripción real del tratamiento de datos. La traducción no sustituye una revisión jurídica.
4. Ampliar rutas, middleware, HTML lang, selector, canonical, hreflang y sitemap únicamente cuando estén completos los catálogos. Mantener intactas las URLs ES/EN y los identificadores de herramientas.
5. Buscar por títulos y palabras clave en el idioma activo. Adaptar el contador de palabras a la segmentación japonesa. No cambiar la entrada numérica de forma que altere cálculos.
6. Usar formatos de fecha y número locales. Mantener explícitos moneda, zona horaria y reglas normativas.
7. Revisar textos largos en alemán y japonés, fuentes en PDF y anchuras de columnas. Verificar descargas con Unicode y sin conversión de codificación.
8. Ejecutar pruebas de cobertura, rutas, cálculos y exportaciones; después publicar el conjunto completo.

## Criterio editorial

No se utiliza una API de traducción. Textos breves, naturales y coherentes con su función. Alemán con «du», francés con «vous», neerlandés con «je», italiano con «tu», portugués con «tu» y japonés con tono cortés y claro. En japonés se permite reordenar la frase completa: no concatenar fragmentos pensados solo para idiomas europeos. No prometer adecuación normativa local solo por traducir la interfaz.

Terminología: las expresiones de préstamos deben diferenciar intereses, amortización y comisiones; la traducción de un sistema financiero no implica que coincida con los productos legales de cada país. En logística, distinguir volumen, superficie, peso, carga útil y unidades de carga. En informática conservar JSON, BSON, CSV, ObjectId y los nombres propios del formato.

No afirmar revisión nativa independiente: la redacción es del asistente y todavía necesita revisión contextual completa en las herramientas.
