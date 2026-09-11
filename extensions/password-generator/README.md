# UtilityInstant – Generador de contraseñas (extensión de navegador)

Extensión Manifest V3 para Chrome y navegadores compatibles (Edge, Brave,
Opera, etc.) que replica la herramienta web de contraseñas de UtilityInstant
([lib/passwords.ts](../../lib/passwords.ts),
[components/password-workspace.tsx](../../components/password-workspace.tsx))
como extensión independiente, con la misma identidad visual, y añade
detección de campos de contraseña en cualquier página web.

Vive en `extensions/password-generator/` dentro del repositorio principal de
UtilityInstant y es autocontenida: no importa código de `app/`,
`components/` ni `lib/` del sitio, y no requiere el sitio publicado para
funcionar. No se modificó ningún archivo de la web principal.

## Por qué es independiente (no un build de la web)

No hay paso de compilación: todo el código es JavaScript clásico (ES5,
sin TypeScript ni bundler), pensado para ejecutarse directamente como
script de extensión. Esta misma carpeta es la carpeta "compilada" lista
para "Load unpacked" — no existe una carpeta `dist/` separada porque no
habría nada que generar a partir del código fuente que no sea copiarlo.

## Estructura

```
extensions/password-generator/
├── manifest.json          Manifest V3
├── popup.html/.css/.js    Interfaz del popup (generador, historial, ajustes)
├── content.js             Detección de campos de contraseña + botón de inserción
├── lib/
│   ├── generator.js       Lógica pura de generación (crypto.getRandomValues)
│   ├── storage.js         Envoltorio de chrome.storage.local
│   └── i18n.js            Diccionario ES/EN
├── _locales/es|en/messages.json   Nombre/descripción para chrome://extensions
├── icons/                 icon16/32/48/128.png (marca UtilityInstant)
├── tests/                 Pruebas automatizadas (node --test)
├── tools/
│   ├── make_icons.py          Regenera los iconos desde la marca de marca
│   ├── preview-harness.html   Harness de desarrollo para probar popup.html fuera de Chrome
│   └── preview-content-test.html  Harness de desarrollo para probar content.js
└── package.json            type:"commonjs" (ver nota abajo) + script de test
```

### Nota técnica: `package.json` propio

El `package.json` de la raíz del repositorio (`nexo/package.json`) declara
`"type": "module"`, lo que convertiría todo `.js` bajo el árbol en ESM por
defecto (incluido este código de extensión, que usa `module.exports` estilo
CommonJS para poder cargarse también como script clásico en el navegador).
Por eso esta carpeta tiene su propio `package.json` con
`"type": "commonjs"`, que aísla la extensión del resto del proyecto sin
tocar la configuración de la web.

## Identidad visual

Reutiliza los tokens de color, radios y tipografía de
[app/globals.css](../../app/globals.css) (mismo `--primary: #315fdf`,
fondo/tarjeta/borde en modo oscuro, `Arial, Helvetica, sans-serif`, radios
de 9–12px, mismos estilos de `.primary-button`/`.secondary-button`). El
popup usa **tema oscuro por defecto** (igual que `.dark` en el sitio) y
cambia a los tokens claros del sitio solo si el sistema operativo del
usuario está en modo claro (`prefers-color-scheme: light`), sin añadir un
selector de tema propio que no exista en la web.

Los iconos (`icons/icon*.png`) reproducen la marca real usada en
`public/utilityinstant-favicon.png` (cuadrado azul `#315fdf` redondeado con
"Ui" en blanco), generados con `tools/make_icons.py` (Pillow) en vez de
inventar una marca nueva.

## Funcionalidad

### Generador (popup)

- Longitud configurable (8–128) y cantidad a generar (1–50, valor inicial 1).
- Casillas independientes de mayúsculas / minúsculas / números / símbolos;
  **siempre queda al menos un grupo activo** (si el usuario intenta
  desmarcar el último, se revierte y se muestra un aviso).
- Casilla independiente "permitir símbolos al principio y al final".
  Si está desactivada, ni el primer ni el último carácter serán símbolos.
- Modo aleatorio o "desde palabra o frase" (la frase es opcional; sin ella
  el resultado es totalmente aleatorio; con ella se conserva como máximo la
  mitad de la longitud).
- Personalización avanzada: símbolos permitidos y caracteres a excluir.
- Caracteres problemáticos para exportadores (comillas, coma, punto y
  coma, backslash, backtick, tabulador, salto de línea) se filtran siempre,
  incluso si el usuario los añade al conjunto de símbolos personalizado.
- Copiar una contraseña, copiar todas, regenerar.
- Valoración básica de seguridad por contraseña generada (heurística local,
  no comprueba filtraciones).
- Historial local de las **últimas 5** configuraciones/resultados en
  `chrome.storage.local` (nunca `sync`), oculto por defecto (botón
  Mostrar/Ocultar) y borrable en un clic.
- La configuración (longitud, cantidad, grupos activos, modo, símbolos,
  exclusiones) se recuerda entre aperturas del popup.
- Selector de idioma Auto/ES/EN; "Auto" usa el idioma del navegador
  (`navigator.language`).
- Botón "Más utilidades en UtilityInstant" que abre
  `https://utilityinstant.com/es/tools/password` en una pestaña nueva.
  Funciona sin que la web esté abierta (es solo un enlace).

### Detección de campos de contraseña (content script)

- Detecta `input[type="password"]` en cualquier página, incluidos
  formularios cargados dinámicamente (vía `MutationObserver`) y dentro de
  iframes del mismo dominio (`all_frames: true`).
- **Desactivada por defecto.** Solo se activa si el usuario marca la
  casilla correspondiente en el popup (`chrome.storage.local`); el content
  script escucha `chrome.storage.onChanged` para activarse/desactivarse al
  instante en todas las pestañas abiertas.
- Muestra un botón compacto (icono, sin texto) junto a cada campo de
  contraseña detectado, renderizado dentro de un **Shadow DOM cerrado** y
  posicionado con `position: fixed` sobre el campo (no modifica el árbol
  DOM de la página ni sus estilos: respeta el layout existente).
- Detecta automáticamente un campo de confirmación cercano (por
  `name`/`id`/`placeholder`/`aria-label`/`autocomplete` que contenga
  "confirm", "repeat", "repetir", "verify", etc., o el único otro campo de
  contraseña dentro del contenedor más próximo) e inserta la misma
  contraseña generada en ambos campos con un solo clic.
- Si el formulario no usa `<form>` (común en apps con React/SPA), la
  búsqueda del campo de confirmación se acota al ancestro más cercano que
  contenga más de un campo de contraseña, en vez de buscar en todo el
  documento (evita emparejar campos de formularios distintos).
- Botón "×" para ocultar el botón en un campo concreto sin desactivar la
  función globalmente.
- No se duplica: cada campo se rastrea por referencia (`Map`), así que
  activar/desactivar repetidamente o mutaciones repetidas del DOM no crean
  botones duplicados.
- **Nunca lee** el valor de un campo existente (no hay keylogging), solo
  escribe cuando el usuario pulsa el botón, usando el setter nativo de
  `value` + eventos `input`/`change` para ser compatible con formularios
  controlados por React/Vue.
- **No envía nada a ningún servidor**: toda la generación ocurre en la
  propia página con `crypto.getRandomValues` y la configuración guardada
  localmente.

## Seguridad de la generación

`lib/generator.js` usa exclusivamente `crypto.getRandomValues` con
descarte por rechazo (`rejection sampling`) para obtener enteros uniformes;
**no se usa `Math.random` en ningún punto** (verificado también por una
prueba automatizada que inspecciona el código fuente).

## Privacidad y permisos

Todo el procesamiento es local. La extensión no hace ninguna petición de
red (verificado manualmente: ver sección de pruebas) y no incluye
analítica.

`manifest.json` solicita únicamente:

- **`storage`** — para guardar en `chrome.storage.local` (nunca `sync`,
  para que la configuración y el historial no viajen a través de la
  sincronización de Chrome de la cuenta del usuario): configuración del
  generador, historial de 5 contraseñas, idioma elegido y si la detección
  de campos está activada.
- **Acceso de content script a `http://*/*` y `https://*/*`** (declarado en
  `content_scripts`, no como `host_permissions`, porque la inyección es
  declarativa y no se usa `chrome.scripting.executeScript`): necesario para
  poder detectar campos de contraseña en cualquier web cuando el usuario
  activa la función. No se solicita acceso a `file://` ni a otros
  esquemas.

No se necesita ningún permiso de red, pestañas, historial de navegación,
cookies ni geolocalización. No hay `background` service worker: toda la
lógica vive en el popup y en el content script; la activación/desactivación
en caliente se resuelve con `chrome.storage.onChanged`, sin necesidad de
mensajería en segundo plano.

## Pruebas realizadas

### Automatizadas (`npm test` dentro de esta carpeta, o
`node --test tests/*.test.mjs`)

25 pruebas, todas en verde:

- Todas las combinaciones válidas de los 4 grupos de caracteres (15
  combinaciones, incluida "solo símbolos" con `edgeSymbols` activado).
- Rechazo cuando los 4 grupos están desactivados.
- Longitud correcta en todo el rango 8–128 y rechazo fuera de rango.
- Cantidad correcta 1–50 y rechazo fuera de rango.
- Símbolos al principio/final respetando `edgeSymbols` (activado y
  desactivado), en 50+20 iteraciones aleatorias.
- "Solo símbolos" exige `edgeSymbols` activado.
- Exclusión de caracteres (`exclude`).
- Caracteres problemáticos para exportadores nunca aparecen, incluso
  añadidos al conjunto de símbolos personalizado; caracteres de control no
  pueden ni introducirse en ese campo.
- Modo frase (con y sin frase).
- Valoración de seguridad básica (patrones comunes vs. contraseñas largas).
- Ausencia de `Math.random` en el código fuente (inspección del archivo).
- Persistencia de la configuración (`chrome.storage.local`, con un stub de
  `chrome.storage` para Node).
- Historial: se conservan exactamente las últimas 5 entradas, más
  reciente primero; `clearHistory` lo vacía.
- Valores por defecto e idempotencia de idioma / activación de detección
  de campos.

### Manuales (navegador, con dos harnesses de desarrollo en `tools/`
que **no** forman parte del paquete de la extensión)

- **`preview-harness.html`** (popup con un stub de `chrome.storage.local`
  respaldado por `localStorage` para simular persistencia real):
  - Diseño y paleta oscura idénticos a la web (capturas verificadas).
  - El campo de frase se oculta/muestra correctamente al cambiar de modo
    (se detectó y corrigió un bug real de CSS: `[hidden]` no ganaba a
    `.field { display:flex }`; ver "Decisiones técnicas").
  - Generación de contraseñas con distintas combinaciones de grupos.
  - Desmarcar el último grupo activo se revierte y muestra aviso.
  - "Solo símbolos" sin `edgeSymbols` muestra el error esperado; con
    `edgeSymbols` genera correctamente.
  - Copiar y "Copiar todas" escriben en el portapapeles del sistema (con
    un clic real de usuario).
  - Cambio de idioma ES/EN/Auto actualiza toda la interfaz al instante.
  - Persistencia real tras recargar la página (grupos activos,
    `edgeSymbols`, idioma).
  - Historial: aparece enmascarado, "Mostrar" lo revela, "Borrar
    historial" lo vacía.
  - Sin errores en consola en ningún paso.
- **`preview-content-test.html`** (página con un login simple, un
  formulario de registro con campo de confirmación y un formulario
  añadido dinámicamente, ninguno dentro de un `<form>` real en el caso
  dinámico):
  - El botón aparece junto a los 5 campos de contraseña de la página,
    incluido el añadido dinámicamente después de cargar la página
    (`MutationObserver`).
  - Insertar en el campo principal de un par contraseña/confirmación
    rellena **ambos** campos con el mismo valor; el campo de login
    independiente no se toca.
  - Se detectó y corrigió un bug real: para campos fuera de `<form>`, la
    búsqueda de "confirmar contraseña" caía a todo el documento y podía
    emparejar el campo equivocado de otra sección de la página; ahora se
    acota al ancestro más cercano con más de un campo de contraseña (ver
    "Decisiones técnicas").
  - El botón "×" oculta el botón de un campo concreto sin afectar a los
    demás.
  - Desactivar la detección elimina todos los botones al instante;
    reactivarla (incluso pulsando varias veces seguidas) los restaura
    **todos**, sin duplicados — se detectó y corrigió un bug real de
    desincronización entre dos estructuras de seguimiento (`WeakSet` +
    `Map`) que dejaba campos sin botón tras un ciclo
    desactivar/reactivar; ver "Decisiones técnicas".
  - Sin peticiones de red salvo las del propio servidor estático de
    desarrollo (`localhost`), verificado con el listado de peticiones de
    red del navegador.
  - Sin errores en consola.
- Funcionamiento sin conexión: toda la lógica es local
  (`crypto.getRandomValues`, `chrome.storage.local`); no hay `fetch` ni
  `XMLHttpRequest` en ningún archivo de la extensión.

No se ha podido probar la carga real como extensión empaquetada
(`chrome://extensions`) dentro de este entorno porque el navegador de
previsualización disponible aquí no permite abrir páginas `chrome://` ni
diálogos nativos de selección de carpeta. Se recomienda que un humano haga
la verificación final de "Load unpacked" en un Chrome real siguiendo los
pasos de la siguiente sección antes de publicar en la Chrome Web Store.

## Cómo cargarla manualmente en Chrome / Edge / Brave

1. Abre `chrome://extensions` (o `edge://extensions`, `brave://extensions`).
2. Activa "Modo de desarrollador" (esquina superior derecha).
3. Pulsa "Cargar descomprimida" / "Load unpacked".
4. Selecciona la carpeta `extensions/password-generator/` de este
   repositorio (la que contiene `manifest.json`).
5. El icono "Ui" aparecerá en la barra de extensiones.

## Cómo generar el ZIP para Chrome Web Store

Desde `extensions/password-generator/` (PowerShell):

```powershell
Compress-Archive -Path manifest.json,popup.html,popup.css,popup.js,content.js,lib,icons,_locales -DestinationPath ..\password-generator.zip -Force
```

Esto excluye `tools/`, `tests/`, `package.json` y `README.md` (no forman
parte del paquete que instala el navegador). Revisa que `password-generator.zip`
resultante solo contenga los archivos de ejecución antes de subirlo.

## Qué falta para publicar en la Chrome Web Store

No solicitado ni realizado en esta entrega (requiere una cuenta de
desarrollador de Chrome Web Store, capturas de pantalla promocionales,
política de privacidad enlazada públicamente y el pago único de registro
de desarrollador):

1. Crear/usar una cuenta de desarrollador de Chrome Web Store.
2. Revisar y en su caso subir de versión `manifest.json` `version`.
3. Preparar assets de la ficha de la tienda (capturas 1280×800 o
   640×400, icono 128×128 ya incluido, descripción larga).
4. Publicar o enlazar una política de privacidad pública (puede
   reutilizarse/adaptarse la de `app/[locale]/privacy/page.tsx` del sitio).
5. Generar el ZIP (sección anterior) y subirlo en el panel de
   desarrollador.
6. Pasar la revisión de Google (puede tardar varios días, especialmente
   por el permiso de acceso a todas las webs).

## Decisiones técnicas relevantes

- **Sin build ni framework**: JS clásico (ES5, sin `import`/`export`)
  compartido entre popup y content script vía `self.UIPasswordGen` /
  `self.UIPasswordStorage` / `self.UIPasswordI18n`, con doble exportación
  (`module.exports`) para que los mismos archivos sean también
  importables desde las pruebas de Node. Se evita así cualquier paso de
  compilación o bundler para una extensión de este tamaño.
- **`chrome.storage.local`, nunca `sync`**: la configuración y, sobre
  todo, el historial de contraseñas generadas no deben viajar a través de
  la sincronización de la cuenta de Google del usuario a otros
  dispositivos/servidores de Google.
- **Shadow DOM cerrado + overlay `position: fixed`** para el botón de
  inserción, en vez de insertar un elemento hermano en el DOM de la
  página: evita colisiones de CSS con la página anfitriona y evita alterar
  su árbol DOM/layout existente.
- **Sin `background` service worker**: no hay necesidad de mensajería en
  segundo plano; la activación de la detección de campos se propaga con
  `chrome.storage.onChanged`, que tanto el popup como el content script
  pueden escuchar directamente.
- **Búsqueda de campo de confirmación acotada al contenedor más cercano**
  en vez de a todo el documento, para funcionar correctamente en páginas
  sin `<form>` con varios formularios de contraseña independientes en la
  misma página (bug real encontrado y corregido durante las pruebas
  manuales, ver más arriba).
- **Un único `Map` como fuente de verdad** de qué campos ya tienen botón
  (en vez de un `Map` + un `WeakSet` separados): un `WeakSet` adicional se
  desincronizaba del `Map` tras un ciclo desactivar/reactivar y dejaba
  campos sin botón (bug real encontrado y corregido).
- **`[hidden] { display: none !important; }`** explícito en `popup.css`:
  sin esto, reglas de mayor especificidad como `.field { display: flex }`
  ganaban al estilo por defecto del user-agent para `[hidden]` y el campo
  de frase quedaba visible en modo aleatorio (bug real encontrado y
  corregido).
- **`package.json` propio con `"type": "commonjs"`**: aísla la extensión
  del `"type": "module"` de la raíz del repositorio, que de otro modo
  rompería la carga de `lib/generator.js` como CommonJS en las pruebas de
  Node (y en teoría, en cualquier tooling Node que recorra el árbol).
- **URL de "Más utilidades" fija a `https://utilityinstant.com/es/tools/password`**
  en ambos idiomas de la interfaz, tal como se especificó, en vez de
  inventar una variante `/en/` no confirmada.
