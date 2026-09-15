# Entrega de las nueve mejoras

- Mapa Leaflet con OpenStreetMap, marcadores por lugar, encuadre automático, consultas bajo petición, caché y enlace externo a Google Maps.
- Geocodificación en servidor mediante el endpoint oficial de HeiGIT `/pelias/v1/search`. La clave se configura como secreto `ORS_API_KEY`; nunca se envía al navegador ni se incorpora al repositorio.
- Cola de consultas de 1,6 segundos en el cliente y máximo de 40 peticiones por minuto por instancia del servidor. Esto reduce consumo, pero no es un límite global entre todas las instancias; siguen aplicándose las cuotas de la cuenta del proveedor. Los errores temporales se muestran sin bloquear el cálculo local.
- Avisos de ejemplo diferenciados en finanzas y herramientas genéricas; formulario financiero a una columna hasta 480 píxeles.
- Explicación de hipoteca mixta limitada a hipotecas.
- Palet de ejemplo con 250 kg y contador de 100.000 caracteres en JSON, con aviso de proximidad al límite.
- Historial de contraseñas desactivado por defecto y guardado solo al activarlo. Fortaleza visible en cada contraseña generada.
- Plazo en años o meses en préstamos e hipotecas, conservando su equivalencia al cambiar de unidad.
- Comparador de amortización extra en ambas herramientas tras calcular: sin cambios, reducción de cuota y reducción de plazo. Presupuesto por cuota ordinaria con gastos incluidos, acumulado según frecuencia del extra e incluyendo su comisión. Sustituye los extras previos; las aportaciones entre cuotas se aplican en la cuota siguiente.
- Ayuda contextual ES/EN para los campos, accesible con ratón, teclado y toque; campos opcionales identificados. La ayuda puede usar inglés en los seis idiomas adicionales.
- Textos de privacidad ajustados en los ocho idiomas para el mapa y el historial opcional.

## Validación

- 90 pruebas automáticas superadas, incluyendo compatibilidad de la frecuencia de extra por defecto y comparación de estrategias.
- Compilación de producción correcta.
- Las 18 herramientas cargadas en navegador. Se corrigieron el aviso de claves en la lista de conductores y la discrepancia de títulos SVG en el plano de carga; la comprobación posterior no mostró avisos nuevos.
- Marcadores de Madrid y París y atribución de OpenStreetMap visibles.
- Comprobado plazo de 18 meses, comparador en préstamo e hipoteca, contador JSON, historial sin guardado automático y ayuda en los seis componentes.
- Formulario financiero y ayudas comprobados a 400 píxeles, sin desbordamiento de página.

La opción de amortización «Puntual» solicitada para después queda en `pending-finance.md`.
