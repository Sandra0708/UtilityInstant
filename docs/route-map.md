# Mapa del planificador de rutas

`components/route-map.tsx` carga Leaflet al solicitar mostrar los lugares. OpenStreetMap proporciona las imágenes con atribución visible. No calcula una ruta vial ni sustituye los kilómetros introducidos por tramo.

## Configuración

- Configurar `ORS_API_KEY` como secreto del servidor en Sites. Para desarrollo, usar `.dev.vars`, excluido de Git.
- `app/api/geocode/route.ts` consulta `https://api.heigit.org/pelias/v1/search`. La clave se envía en la cabecera de autorización únicamente desde el servidor.
- La cola del navegador espacia las consultas 1,6 segundos. El servidor limita cada instancia a 40 consultas por minuto, agrupa solicitudes coincidentes y guarda respuestas hasta 24 horas en memoria.
- Las cuotas de la cuenta del proveedor siguen vigentes. El límite por instancia no sustituye un contador global de consumo de la cuenta.

Un lugar no encontrado genera un aviso sin bloquear el resto del planificador. Los enlaces externos a Google Maps permiten consultar rutas reales; no precisan claves. Pueden omitir paradas según el dispositivo, por lo que también se ofrece la consulta por tramo.
