# Conexión de UtilityInstant

Dominio principal: **https://utilityinstant.com**. Los dominios secundarios se redirigirán a `.com`, conservando la ruta y los parámetros.

Estado a 9 de septiembre de 2026: dominios dados de alta en Sites; validación DNS y HTTPS pendientes. El panel de Piensa Solutions devuelve errores. No se han modificado sus registros DNS. La web sigue privada hasta autorizar su apertura al público.

## Registros para Piensa Solutions

Mantener los servidores `ns97.piensasolutions.com` y `ns98.piensasolutions.com`. En cada zona, sustituir los registros A de parking del nombre indicado por los destinos siguientes. Retirar los registros AAAA de parking únicamente de los nombres que se conecten, porque Sites no ha proporcionado destinos IPv6. Para `www`, reemplazar sus A/AAAA por el CNAME. Conservar los registros de correo y otros servicios.

En la columna Nombre se usa el nombre relativo a la zona. `@` significa el dominio sin www. TTL recomendado: 3600. No añadir entradas con campos vacíos.

### utilityinstant.com

| Tipo | Nombre | Valor |
| --- | --- | --- |
| A | `@` | `162.159.143.30` |
| A | `@` | `172.66.3.26` |
| TXT | `_openai-site-verification` | `openai-site-verification=MBniUUYjl7-bree-LD9pgQRbIiF0a7E-tgOljjqjB90` |
| TXT | `_cf-custom-hostname` | `85dcd4bc-ef65-4af9-8872-4f2598315189` |

### utilityinstant.net

| Tipo | Nombre | Valor |
| --- | --- | --- |
| A | `@` | `162.159.143.30` |
| A | `@` | `172.66.3.26` |
| TXT | `_openai-site-verification` | `openai-site-verification=UjWrEURBu3Ikq329eimeMd9zPwHok3AtGppZk_raMg4` |
| TXT | `_cf-custom-hostname` | `ed0a88f4-17f3-4bf3-b8a1-f6ae4868762c` |

### utilityinstant.org

| Tipo | Nombre | Valor |
| --- | --- | --- |
| A | `@` | `162.159.143.30` |
| A | `@` | `172.66.3.26` |
| TXT | `_openai-site-verification` | `openai-site-verification=S0cKoUTsf9zIdzeyuwKHg_FxnCqSRLo_MRvsh_4vaaA` |
| TXT | `_cf-custom-hostname` | `4ea43168-fcc9-4bd5-872e-ea054c45aded` |

### www.utilityinstant.com

| Tipo | Nombre | Valor |
| --- | --- | --- |
| CNAME | `www` | `custom-domains.chatgpt.site.` |
| TXT | `_openai-site-verification.www` | `openai-site-verification=yy2iv4bvHCUgDe795TTAdNfjS2ktV4SR8vbTgZnIiGg` |
| TXT | `_cf-custom-hostname.www` | `766b0506-8d46-407f-9ac1-f6a7484577bc` |

### www.utilityinstant.net

| Tipo | Nombre | Valor |
| --- | --- | --- |
| CNAME | `www` | `custom-domains.chatgpt.site.` |
| TXT | `_openai-site-verification.www` | `openai-site-verification=h04ZgXpA_HrFMtDpaaq9yN6x1lZsSw31nSdYsNI1lv0` |
| TXT | `_cf-custom-hostname.www` | `9db40ad3-b1c9-44c3-9d5c-fb8735cafddb` |

## Después de guardar los DNS

1. Actualizar el estado de cada dominio en Sites. Aplicar cualquier registro de validación adicional que devuelva; esperar a que el dominio y HTTPS estén activos.
2. Comprobar `utilityinstant.com` y sus redirecciones. `www.utilityinstant.org` queda fuera de esta configuración: Sites admite un máximo de cinco nombres personalizados por sitio. No apuntarlo a Sites sin darlo de alta.
3. Abrir la web al público con autorización de la propietaria, cambiar las URL canónicas y el sitemap al dominio principal, y retirar noindex en el lanzamiento.
4. Verificar el archivo `/ads.txt` y la etiqueta `google-adsense-account` de la web. ID verificado en la cuenta: `ca-pub-1478176434603137`.
5. En AdSense, elegir «Etiqueta meta» o «Fragmento de ads.txt», verificar la propiedad y solicitar revisión. El sitio actualmente figura como «Debe revisarse»; no se ha enviado una solicitud fallida sobre el parking.
6. Configurar y publicar la CMP certificada, definir las unidades de anuncio y activar el proveedor después de la aprobación. Actualmente no se carga el SDK de anuncios ni se solicitan anuncios.

## Referencias

- [Conectar el sitio a AdSense](https://support.google.com/adsense/answer/7584263?hl=es).
- [Estado de los sitios en AdSense](https://support.google.com/adsense/answer/12170222?hl=es).

No se ha enviado ningún mensaje a soporte. Los archivos de configuración recogen los valores devueltos por Sites; deben revisarse otra vez si se vuelve a crear un dominio.

