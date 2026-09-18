# Horas y husos horarios

Implementación de septiembre de 2026. Herramientas `hours` y `timezones`, categoría Fecha y hora, traducciones y rutas propias en ocho idiomas. Rutas españolas `/es/tools/calculadora-de-horas` y `/es/tools/conversor-zona-horaria`.

## Horas
- Diferencia entre entrada y salida, descanso entero en minutos, fecha y zona.
- Salida anterior a entrada implica día siguiente. La casilla permite indicar explícitamente el siguiente día, incluso con horas iguales.
- Suma/resta de duraciones mayores de 24 horas y negativas.
- Parte semanal de siete días activables, umbral configurable y redondeo individual al cuarto de hora (ninguno, próximo, inferior o superior).
- Conversión decimal (punto o coma) ↔ horas:minutos. Se redondea al minuto más cercano al convertir desde decimal.
- Horas extra orientativas según el umbral introducido, sin liquidación laboral legal.

## Husos
- Selectores independientes de origen y destino; no alteran preferencias globales.
- Zonas IANA agrupadas por continente, países localizados, búsqueda de ciudades/alias/abreviaturas y traducción japonesa de ciudades principales.
- Catálogo `@vvo/tzdb` cargado al abrir el selector. Cinco zonas recientes en almacenamiento local; ningún dato de turnos se guarda.
- Desfases UTC fijos separados de zonas con reglas estacionales.
- Reglas y conversión mediante Intl del navegador, sin API externa. Dependen de la versión de sus datos horarios.
- Horas inexistentes generan error; horas repetidas requieren elegir aparición primera o segunda.
- Estado estacional reconocido por nombre específico en inglés. Si no es inequívoco, se indica no determinado y se muestra nombre localizado y desfase aplicable, sin inventar un estado.

## Salidas y límites
- Copiar, CSV y XLSX con nombre estándar de la web y datos de la última operación válida.
- Al modificar una entrada, el resultado queda marcado y las exportaciones desactivadas hasta recalcular.
- Rango de fechas 1970–2100. El parte semanal debe caber en ese intervalo.
- Motores puros en `lib/engines/hours.ts` y `lib/engines/timezones.ts`.
- Pruebas: turnos nocturnos, cambios de hora de Madrid y Lord Howe, horas ambiguas/inexistentes, redondeo de seis jornadas, decimales y cambios de fecha entre continentes.

## Salud, revisión paralela
- Añadidas ayudas a clasificación IMC, sexo, actividad y métodos, en ocho idiomas.
- Los métodos se seleccionan por los datos que el usuario conoce, conservando nombres técnicos en la ayuda.
- La clasificación japonesa no cambia el valor del IMC. Fuente: https://kennet.mhlw.go.jp/information/information/food/e-02-001. Mifflin: https://pubmed.ncbi.nlm.nih.gov/2305711/.
- Pendiente de diseño: actividad clínica nula y entrada manual de horas de ejercicio. No se añadieron factores arbitrarios ni un cálculo basado solo en horas: faltaría intensidad y evitar contar dos veces la actividad del día. La ayuda aclara la diferencia entre sedentarismo e inmovilidad clínica.
