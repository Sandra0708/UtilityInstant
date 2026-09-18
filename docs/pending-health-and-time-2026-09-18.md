# Pendientes para retomar — 18 de septiembre de 2026

Actualización al retomar: las ayudas y nombres comprensibles de salud y las dos herramientas de horas/husos ya están implementadas. Estado técnico y limitaciones en `docs/time-tools.md`. Se mantiene pendiente el diseño de ejercicio por horas/intensidad y actividad clínica nula. El apartado de interrupción inferior conserva el estado histórico anterior, no el actual.

La usuaria pide conservar estas observaciones para revisarlas cuando vuelva a disponer de uso. Este documento registra propuestas; no significa que estén implementadas ni publicadas. Priorizar cambios concretos, interfaz compacta y ocho idiomas, sin rehacer funciones que ya funcionan.

## Salud: comentarios de la usuaria

### Índice de masa corporal
- Caso observado: 68 kg, 1,70 m, 37 años → IMC 23,5 tanto con clasificación internacional como japonesa.
- Añadir interrogante/ayuda junto a clasificación que explique qué cambia entre ambas.
- Explicar que seleccionar clasificación no cambia el cálculo numérico del IMC: cambia la interpretación de sus umbrales. No modificar la fórmula para forzar resultados distintos.
- Revisar y documentar con fuentes los umbrales implementados, mostrando claramente la clasificación obtenida. Comprobar un caso donde difieran las interpretaciones, además del ejemplo de la usuaria.

### Calorías diarias
- La usuaria está satisfecha con la herramienta, pero faltan ayudas en sexo usado por la fórmula, actividad habitual y método.
- Sustituir nombres técnicos como opción principal por opciones comprensibles: «No conozco mi porcentaje de grasa corporal» (Mifflin–St Jeor) y «Conozco mi porcentaje de grasa corporal» (Katch–McArdle).
- Mantener nombres, fundamentos y limitaciones de cada método en ayuda contextual.
- Explicar cada nivel de actividad; no dar a entender que representa horas si en realidad es un factor de actividad.
- Solicita contemplar actividad nula/personas inmovilizadas y poder introducir horas diarias de ejercicio, incluyendo actividad elevada.
- Antes de implementar esta última propuesta, contrastar el modelo: horas por sí solas no determinan gasto, requieren intensidad/tipo de actividad; evitar doble contabilización con el factor diario. No equiparar automáticamente inmovilidad con metabolismo basal. Definir una solución respaldada y explicar sus límites.

### Grasa corporal
- Añadir ayuda contextual a sexo y método.
- Mostrar métodos por datos disponibles: «Conozco mis medidas corporales» (US Navy) frente a «No conozco mis medidas corporales» (Deurenberg).
- Explicar las medidas requeridas por la fórmula seleccionada: cintura, cuello y, cuando corresponda, cadera; incluir cómo medirlas.
- Explicar qué utiliza cada estimación y sus limitaciones. La usuaria propone destacar la estimación con perímetros como más precisa; verificar antes de afirmar superioridad universal.

### Peso orientativo
- Añadir ayuda al selector masculino/femenino indicando para qué utiliza ese dato la fórmula.
- Por lo demás, la usuaria considera correcta esta herramienta.

## Desarrollo de horas y husos horarios interrumpido

Último lote publicado: cuatro herramientas de salud. Commit registrado en la sesión: `2d71930a1d8bb73da4253f9d2c705e78f5e556ad`. Sitio: https://utilityinstant.com. Repositorio: Sandra0708/UtilityInstant, remoto local `github`.

Trabajo local iniciado, todavía sin integrar, validar ni publicar:
- `lib/engines/hours.ts`: duración, turnos nocturnos, descansos, semana, redondeo, conversiones.
- `lib/engines/timezones.ts`: offsets, resolución de horas inexistentes/duplicadas y conversión.
- `lib/localization/time.ts`: textos en ocho idiomas.
- `lib/zone-cities.ts`: nombres japoneses de ciudades.
- `lib/time-tools.ts`: definiciones de catálogo aún sin registrar.
- `components/zone-picker.tsx`: selector con búsqueda y carga diferida; referencia a CSS todavía inexistente.
- Dependencia `@vvo/tzdb` instalada; package.json y package-lock.json modificados.

Falta crear la interfaz y CSS; integrar catálogo, motor, pantalla, iconos, rutas localizadas y metadatos; pruebas; compilación; vista local; publicación y respaldo GitHub. Corregir primero la propiedad de parámetro del constructor de TimeInputError, incompatible con las pruebas mediante strip-types de Node.

Horas: cuatro modos (duración, suma/resta, parte semanal de siete días y decimal↔h:mm). Usar fecha y zona para cambios de hora; admitir turnos nocturnos, seis días, descansos y redondeo diario a cuartos. Exportación y copiado coherentes con la web.

Husos: origen/destino independientes, fecha/hora equivalente, diferencia y estado de horario de verano. Selector con IANA/alias, búsqueda por ciudades y países, offsets fijos, recientes y reloj; sin API remota. Pedir elección cuando una hora se repita y explicar horas inexistentes. No adivinar un estado de verano cuando no pueda determinarse de forma fiable.

Documento original del pedido: `C:/Users/sgl78/.codex/attachments/af367edb-c4d9-45f5-81cc-2548e1f37419/pasted-text.txt`.

## Precauciones al retomar
- Preservar UTF-8: hubo incidencias históricas graves de tildes y símbolos.
- No tocar ni incluir por accidente `extensions/password-generator.zip`, artefacto ajeno sin seguimiento.
- No afirmar que lo pendiente está implementado ni publicar una versión incompleta.
- Verificar fuentes primarias antes de cambiar fórmulas o recomendaciones sanitarias.
- Mantener ayudas junto al campo, opciones sencillas y detalles avanzados plegables.
