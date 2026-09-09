# Publicidad sostenible

ID de editor de AdSense verificado e incorporado a la etiqueta de propiedad y al archivo ads.txt. SDK y solicitudes de anuncios desactivados mientras faltan dominio activo, revisi?n de Google, CMP y unidades de anuncio. AdConfig, AdProvider, AdManager, ConsentManager y AdSlot separados. Slots: HOME_TOP, HOME_IN_CONTENT, CATEGORY_TOP, TOOL_LEFT_RAIL, TOOL_RIGHT_RAIL, TOOL_TOP, TOOL_AFTER_RESULT, TOOL_AFTER_CHART, TOOL_IN_CONTENT_1, TOOL_IN_CONTENT_2, MOBILE_AFTER_RESULT, MOBILE_IN_CONTENT.

Desktop >=1800: centro hasta 1000 px y dos rails de 300x600. >=1280: un rail derecho 300x600. Menor: sin rails, espacio 300x250 tras el resultado completo. Mobile >=320: 300x250, nunca entre campos, botón y resultado. Contenido adicional únicamente tras tablas o explicaciones largas, no todos los slots a la vez. Slots vacíos conservan dimensión para evitar saltos. Sticky apagado por defecto; activar solo tras revisar políticas del partner. Nada de refresh automático.

Estados: loading, filled, empty, error, blocked, no-consent. Lazy-load mediante IntersectionObserver. Requerir consentimiento publicitario antes de inicializar proveedores. Integración futura con CMP externa certificada y su señal de revocación; no presentar un cuadro casero como CMP. Eventos previstos: requested, filled, empty, error, viewable. Viewability e ingresos no se afirman sin proveedor ni mediciones. Analítica desactivada inicialmente y separada del consentimiento publicitario.

Validar breakpoints, ausencia de solapamiento y estabilidad del espacio. Medir CLS/LCP/INP con tráfico real; presupuesto orientativo CLS <0,1, LCP <=2,5 s e INP <=200 ms no son resultados medidos.
