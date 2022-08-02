/**
 * Consulta registros DNS de los dominios indicados usando el servicio de CloudFlare
 * 
 * @param {"MX"} registroDNS Registro a consultar ( A | AAAA | CAA | CNAME | DS | DNSKEY | MX | NS | NSEC | NSEC3 | RRSIG | SOA | TXT ).
 * @param {A2:A10} lista_dominios Dominio o intervalo con los dominios a interrogar.
 *
 * @return Resultados de la consulta DNS
 *
 * Envoltorio para NSLookup() >> https://developers.cloudflare.com/1.1.1.1/fun-stuff/dns-in-google-sheets/
 *
 * @customfunction
 *
 * MIT License
 * Copyright (c) 2020 Pablo Felip Monferrer(@pfelipm)
 */

function CONSULTADNS(registroDNS, lista_dominios) {

  // Comprobación general de parámetros

  const tipoRegistros = ['A', 'AAAA', 'CAA', 'CNAME', 'DS', 'DNSKEY', 'MX', 'NS', 'NSEC', 'NSEC3', 'RRSIG', 'SOA', 'TXT'];

  if (typeof registroDNS != 'string') throw 'Falta parámetro 1 o es incorrecto (registroDNS).';
  if (typeof lista_dominios == 'undefined') throw 'Falta parámetro 2 (lista_dominios).';
  registroDNS = registroDNS.toUpperCase();
  if (!tipoRegistros.some(tipo => tipo == registroDNS)) throw "Registro DNS no admitido.";

  let resultado = [];

  // Realiza consulta(s) o establece resultado(s) como ''

  if (lista_dominios.map) {
    lista_dominios.forEach(dominios => {
      let fila = [];
      dominios.forEach(dominio => { fila.push(dominio != '' ? NSLookup(registroDNS, dominio) : ''); });
      resultado.push(fila);
    });
  }
  else {
    resultado = lista_dominios != '' ? NSLookup(registroDNS, lista_dominios) : '';
  }

  return resultado;
}

/**
 * Determina si una dirección de email o dominio de correo están gestionados
 * por Google o no (Gmail o G Suite), consultando para ello sus registros MX
 * por medio del servicio de CloudFlare. 
 *
 * @param {"juannadie@google.com"} lista_emails Emails o dominios a comprobar.
 * @param {"gsuite"} tipo Tipo de comprobación ("todos" | "gsuite" | "gmail"). Por defecto "todos".
 * 
 * @return TRUE | FALSE
 *
 * @customfunction
 *
 * Envoltorio para NSLookup() >> https://developers.cloudflare.com/1.1.1.1/fun-stuff/dns-in-google-sheets/
 *
 * MIT License
 * Copyright (c) 2020 Pablo Felip Monferrer(@pfelipm)
 */

function ESGOOGLEMAIL(lista_emails, tipo = 'todos') {

  // Comprobación general de parámetros

  if (typeof lista_emails == 'undefined') throw 'Falta parámetro (lista_email)';

  // Dominios válidos para servidores de correo de Google

  let domains = [];

  switch (String(tipo).toLowerCase()) { // String() para cazar un posible número como tipo
    case 'gsuite':
      domains = ['aspmx.l.google.com', 'googlemail.com']; // El 2º parece ser obsoleto
      break;
    case 'gmail':
      domains = ['gmail-smtp-in.l.google.com'];
      break;
    default: // gmail + gsuite
      domains = ['aspmx.l.google.com', 'googlemail.com', 'gmail-smtp-in.l.google.com']; // El 2º parece ser obsoleto
      break;
  }

  let domain, resultado = [];

  if (lista_emails.map) {

    lista_emails.forEach(emails => {

      let fila = [];
      emails.forEach(email => {
        if (email == '') fila.push('');
        else {
          if (email.includes('@')) domain = email.match(/.*@(.+)$/)[1];
          else domain = email;
        }
        // TRUE si el registro MX devuelto contiene algunos de los elementos de domains[]
        registroMx = NSLookup('MX', domain).toLowerCase();
        fila.push(domains.some(d => registroMx.includes(d)));
      });

      resultado.push(fila)

    });

  } else {

    if (lista_emails == '') resultado = '';
    else {

      if (lista_emails.includes('@')) domain = lista_emails.match(/.*@(.+)$/)[1];
      else { domain = lista_emails; }

      // TRUE si el registro MX devuelto contiene algunos de los elementos de domains[]
      registroMx = NSLookup('MX', domain).toLowerCase();
      resultado = domains.some(d => registroMx.includes(d));
      //resultado = domains.some(d => String(NSLookup('MX', domain)).toLowerCase().includes(d));

    }
  }

  return resultado;

}

/**
 * Realiza consultas DNS utilizando el servicio de CloudFlare
 * Tomado de >> https://developers.cloudflare.com/1.1.1.1/fun-stuff/dns-in-google-sheets/
 * Adaptada para actuar como función auxiliar (@pfelipm, mar20)
 */

function NSLookup(type, domain) {

  let url = 'https://cloudflare-dns.com/dns-query?name=' + encodeURIComponent(domain) + '&type=' + encodeURIComponent(type);

  let options = {
    "muteHttpExceptions": true,
    "headers": {
      "accept": "application/dns-json"
    }
  };

  try {

    var result = UrlFetchApp.fetch(url, options);
    var rc = result.getResponseCode();
    var resultText = result.getContentText();

    if (rc !== 200) {
      throw new Error(rc);
    }

    let errors = [
      { "name": "NoError", "description": "Sin errores" }, // 0
      { "name": "FormErr", "description": "Error de formato" }, // 1
      { "name": "ServFail", "description": "Fallo del servidor" }, // 2
      { "name": "NXDomain", "description": "Dominio no existe" }, // 3
      { "name": "NotImp", "description": "No implementado" }, // 4
      { "name": "Refused", "description": "Consulta rechazada" }, // 5
      { "name": "YXDomain", "description": "El nombre no debería existir" }, // 6
      { "name": "YXRRSet", "description": "El conjunto RR no debería existir" }, // 7
      { "name": "NXRRSet", "description": "El conjunto RR debería existir" }, // 8
      { "name": "NotAuth", "description": "No autorizado" } // 9
    ];

    let response = JSON.parse(resultText);

    if (response.Status !== 0) {
      return errors[response.Status].name;
    }

    var outputData = [];

    for (let i in response.Answer) {
      outputData.push(response.Answer[i].data);
    }

    return outputData.join(',');

  } catch (e) {

    return '¡Error al consultar!';

  }

}