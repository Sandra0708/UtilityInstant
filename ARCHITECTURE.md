# Arquitectura

Registro en lib/tools.ts: identidad, categorías, entradas, metadatos ES/EN, fórmulas, límites, ejemplos y funciones puras. Un mismo registro alimenta búsqueda, navegación, categorías, relaciones y rutas. lib/engine.ts valida y procesa sin DOM ni red. Componentes de plataforma comparten preferencias y renderizado. Rutas /es y /en, /[locale]/tools/[slug]. El idioma se establece en URL, no se simulan traducciones ausentes.

Gráficos SVG accesibles cargados al calcular; tabla equivalente. Excel bajo importación dinámica: libro con entradas, resultados, detalle y metodología, sin ejecutar fórmulas provenientes del usuario. Historial limitado a identificador y fecha, sin entradas ni resultados sensibles. Favoritos y preferencias en localStorage con captura de errores. Sin secretos en URLs. Compartir copia el enlace de herramienta sin parámetros de entrada.

Los futuros proveedores de divisas/DNS/IP deben vivir fuera de las funciones locales, con timeout, caché, cuotas y respuestas tipadas. Futuros archivos grandes usarán workers y límites de memoria. No se incorpora backend sin necesidad. Los anuncios se configuran por nombre lógico y el adaptador de consentimiento externo puede revocarlos. No hay CMP propia.
