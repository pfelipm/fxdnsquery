![banner readme](https://user-images.githubusercontent.com/12829262/79766521-5ff45500-8328-11ea-8084-3849700180c7.png)
# DNSQuery
Dos funciones personalizadas para hojas de cálculo de Google desarrolladas en Apps Script que proporcionan un envoltorio para la función `NSLookup`, tal y como aparece en la [documentación](https://developers.cloudflare.com/1.1.1.1/fun-stuff/dns-in-google-sheets/) del servicio de resolución de nombres de CloudFlare.

En esta [hoja de cálculo](https://docs.google.com/spreadsheets/d/1yq3KJGtQB4OX5y0Qz8FgM7Z88d00rXtP_aKc79Ki1BE/template/preview) se pueden encontrar sendos ejemplos de uso.

# Función CONSULTADNS()
Consulta el registro indicado en el o los dominios que se pasan como parámetro utilizando el servicio de resolución de nombres de CloudFlare.

`=CONSULTADNS(registroDNS, lista_dominios)`

Donde:
- `registroDNS`: Alguna de estas cadenas de texto: **A | AAAA | CAA | CNAME | DS | DNSKEY | MX | NS | NSEC | NSEC3 | RRSIG | SOA | TXT**
- `dominios`: Una cadena de texto que representa un dominio válido, o una referencia a una celda o rango de celdas en las que se encuentran los dominios a consultar.

Ejemplo:

`=CONSULTADNS(B12;A3:A12)`

![dnsquery1](https://user-images.githubusercontent.com/12829262/79770552-dcd5fd80-832d-11ea-8859-04b461d2f9da.png)

# Función ESGOOGLEMAIL()
Determina si un email, dominio (o lista de emails o dominios) está gestionado por Google o no.

`=ESGOOGLEEMAIL(lista_emails_o_dominios)`

Donde `lista_emails_o_dominios` es una cadena de texto que representa una dirección de correo electrónico o un intervalo de celdas que los contienen.

Ejemplo:

`=ESGOOGLEEMAIL(A3:A13)`

![Selección_053](https://user-images.githubusercontent.com/12829262/79771812-98e3f800-832f-11ea-8839-0f9999de9e66.png)

# Licencia
El código original de la función `NSLookup()` pertenece a CloudFlare.

Funciones `CONSULTADNS()` y `ESGOOGLEMAIL()` ©  2020 Pablo Felip Monferrer ([@pfelipm](https://twitter.com/pfelipm)). Se distribuye bajo licencia MIT.
