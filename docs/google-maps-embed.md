# Mapa del planificador de rutas

El componente `components/route-map.tsx` utiliza exclusivamente Maps Embed API, modo directions. No usa Places, Routes ni Geocoding. Google recibe las direcciones solo al pulsar Mostrar recorrido o abrir el enlace externo. No se extraen datos del iframe: los kilómetros se introducen por tramo y la velocidad media sigue siendo una hipótesis del cálculo local.

## Activación

1. En un proyecto propio de Google Cloud, configurar los requisitos de cuenta y facturación que indica Google y habilitar únicamente Maps Embed API.
2. Crear una clave de navegador, restringida a Maps Embed API y a los sitios autorizados: `https://utilityinstant.com/*`, `https://nexo-herramientas-sgl.sandra0708.chatgpt.site/*` y, durante desarrollo, `http://localhost:3000/*`.
3. Añadir `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` al entorno de compilación. Para desarrollo, usar `.env.local` (ignorado por Git). Reiniciar el servidor. Para producción, reconstruir con la variable y publicar. Es una clave pública de navegador: su protección depende de las restricciones, no de ocultarla.
4. Confirmar un recorrido real con la clave habilitada. Sin clave, la herramienta ofrece enlaces externos y comunica que el mapa integrado no está activado.

No hay una clave configurada por este cambio. No se ha habilitado facturación ni contratado servicios.

Google documenta Maps Embed sin coste ni límites diarios/de frecuencia a fecha 2026-09-11; no es una garantía de condiciones futuras. https://developers.google.com/maps/documentation/embed/usage-and-billing

El modo directions admite 20 puntos intermedios; para más paradas se selecciona un tramo. Los enlaces Maps URLs pueden admitir menos puntos dependiendo del dispositivo. Evitar peajes es una preferencia, no una garantía. No equivale a navegación de camiones ni a autocompletado. https://developers.google.com/maps/documentation/embed/embedding-map
