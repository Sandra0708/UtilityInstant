# Nexo

Plataforma nueva en español e inglés con 16 herramientas locales funcionales. El original de Desktop/Test Web no se ha modificado.

## Desarrollo

Requiere Node >=22.13. Instalar con `npm ci`, ejecutar `npm run dev`, comprobar con `npm run check` y `npm test`, compilar con `npm run build`. El archivo de bloqueo fija las dependencias. En Windows la observación utiliza polling para evitar bloqueos de archivos temporales.

## Estructura

- `lib/tools.ts`: catálogo tipado ES/EN, entradas, metodología y relacionados.
- `lib/engine.ts`: funciones de cálculo y validación independientes de React.
- `components/platform.tsx`: preferencias, navegación, catálogo y búsqueda.
- `components/tool-screen.tsx`: formulario, resultados, escenarios, explicaciones y exportación.
- `components/tool-chart.tsx` y `lib/export.ts`: cargados de forma diferida.
- `lib/ads.ts`: configuración y adaptadores de publicidad/consentimiento. Proveedor desactivado.
- `app/[locale]`: rutas renderizadas en servidor con metadatos localizados.

El historial contiene solo identificadores y fechas; no conserva entradas ni resultados. Los archivos XLSX conservan los números como números y los textos como texto, sin ejecutar fórmulas suministradas por el usuario. Las herramientas pueden funcionar sin llamadas de cálculo al servidor, pero la navegación y carga inicial necesitan conexión.

Esta entrega inicia Fase 1. No incluye las 50 herramientas, idiomas adicionales, tasas en vivo, PDF/imágenes, quizzes ni proveedores comerciales. El catálogo maestro documenta el backlog. La web tiene noindex en esta revisión privada: cambiarlo solo al preparar un lanzamiento público.

## Seguridad de dependencias

Se actualizó el conjunto React/RSC y el runtime a versiones compatibles que corrigen los avisos del scaffold. La sobrescritura de sharp 0.35.4 corrige el aviso libheif heredado de Miniflare. No hay carga ni transformación de imágenes de usuario. Verificar nuevamente `npm audit` al actualizar dependencias.

## Dominio y AdSense

Dominio principal acordado: utilityinstant.com. Ver DOMAIN_SETUP.md para registros, estado de validaci?n y tareas pendientes. Se han a?adido ads.txt y la etiqueta de verificaci?n con el ID real de la propietaria; esto no activa anuncios. El proveedor permanece desactivado. Las redirecciones de los alias est?n implementadas y requieren conectar sus DNS. Las URL can?nicas de la revisi?n privada se conservan hasta el lanzamiento del dominio.

Validaci?n adicional: `node --experimental-strip-types --test tests/domains.test.mjs`.
