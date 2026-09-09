# Validación de Nexo — primera fase

Fecha: 9 de septiembre de 2026.

- Compilación de producción y comprobación TypeScript completadas.
- 34 pruebas automatizadas aprobadas: 16 herramientas, entradas inválidas, redondeo financiero, fechas, Unicode, búsqueda y consentimiento publicitario.
- Archivos Excel verificados como ZIP/OOXML válido, con CRC, números nativos y texto protegido frente a fórmulas inyectadas.
- 46 páginas localizadas verificadas por HTTP: respuesta 200, idioma HTML, título, canonical y alternativas. Tres rutas inexistentes devuelven 404. Sitemap y robots comprobados.
- Revisión visual en anchos 320, 375, 768, 1024, 1440 y 1920: sin desbordamiento horizontal; espacios publicitarios adaptados.
- Pruebas de navegador: búsqueda con errata, favoritos, navegación, comparación de escenarios, copia, descarga Excel, cambio de idioma y tema.
- WebMCP: cálculo hipotecario sin interés correcto; entradas inválidas rechazadas conservando el resultado anterior.
- Auditoría de dependencias: cero vulnerabilidades conocidas en la consulta realizada.

## Límites de esta entrega

16 herramientas implementadas. El catálogo ampliado es una propuesta, no funcionalidad ya disponible. Publicación privada y noindex. Publicidad real desactivada; integración con proveedor y CMP pendiente. No hay medición de Core Web Vitals de campo ni garantía de ingresos o posicionamiento. Los cálculos financieros son estimaciones con supuestos visibles.
