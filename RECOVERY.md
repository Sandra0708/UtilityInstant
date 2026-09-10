# UtilityInstant: recuperación y publicación

## Prioridad
Mantener una copia privada del código en GitHub y comprobar cada subida. El código local que no se suba no estará protegido frente a la pérdida del equipo.

## Recuperación
Clonar el repositorio privado en el nuevo equipo. Instalar Node.js compatible con package.json. Ejecutar npm ci, npm test y npm run build. Para desarrollar, ejecutar npm run dev.

## Publicación actual
El dominio es https://utilityinstant.com. El proyecto de Sites existente está identificado en .openai/hosting.json. No crear otro sitio ni reemplazar ese identificador.

Desde una sesión con acceso a Sites, seguir las guías sites-building/sites-hosting: validar, guardar el código exacto en el repositorio de origen de Sites con credencial temporal, empaquetar, guardar una versión y desplegarla al sitio público existente. Confirmar que el despliegue termina correctamente. GitHub conserva el código; no despliega automáticamente a Sites.

Una sesión sin el conector Sites puede editar y subir el código a GitHub, pero necesita otra sesión con ese acceso para desplegar. Nunca guardar credenciales temporales en archivos ni en URLs remotas.

## Copias
Subir a GitHub después de cada fase terminada. Guardar además un ZIP del código en almacenamiento externo. Las dependencias node_modules y los archivos generados se reconstruyen; no se incluyen en Git. Los secretos .env y credenciales requieren copia segura separada. Los identificadores públicos de AdSense sí forman parte del código.
