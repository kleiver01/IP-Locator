const $ = s => document.querySelector(s);
const $form = $('#form');
const $input = $('#input');
const $submit = $('#submit');
const $results = $('#results');

// Tokens y endpoints
const IPINFO_TOKEN = '5716f0e4543691'; // Lite token
const fetchIpinfoLite = async (ip) => {
  const url = `https://api.ipinfo.io/lite/${encodeURIComponent(ip)}?token=${IPINFO_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error en IPinfo');
  return res.json();
};

const fetchIpapi = async (ip) => {
  const url = `https://ipapi.co/${encodeURIComponent(ip)}/json/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error en ipapi');
  return res.json();
};

$form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const ip = $input.value.trim();
  if (!ip) return;

  $submit.setAttribute('disabled', '');
  $submit.setAttribute('aria-busy', 'true');
  $results.innerHTML = '<article><p>Buscando...</p></article>';

  try {
    const [infoLite, infoGeo] = await Promise.all([
      fetchIpinfoLite(ip),
      fetchIpapi(ip)
    ]);

    const [lat, lon] = infoGeo.loc?.split(',') || ['N/A', 'N/A'];

    $results.innerHTML = `
      <article>
        <header><strong>Información combinada de la IP: ${ip}</strong></header>
        <table>
          <tr><th>IP</th><td>${infoLite.ip || 'N/A'}</td></tr>
          <tr><th>País</th><td>${infoLite.country || infoGeo.country_name || 'N/A'}</td></tr>
          <tr><th>Ciudad</th><td>${infoGeo.city || 'N/A'}</td></tr>
          <tr><th>Región</th><td>${infoGeo.region || 'N/A'}</td></tr>
          <tr><th>Código Postal</th><td>${infoGeo.postal || 'N/A'}</td></tr>
          <tr><th>Latitud</th><td>${lat}</td></tr>
          <tr><th>Longitud</th><td>${lon}</td></tr>
          <tr><th>Zona Horaria</th><td>${infoGeo.timezone || 'N/A'}</td></tr>
          <tr><th>Proveedor</th><td>${infoLite.as_name || infoGeo.org || 'N/A'}</td></tr>
          <tr><th>Dominio</th><td>${infoLite.as_domain || 'N/A'}</td></tr>
          <tr><th>ASN</th><td>${infoLite.asn || infoGeo.asn || 'N/A'}</td></tr>
          <tr><th>Continente</th><td>${infoLite.continent || 'N/A'}</td></tr>
        </table>
      </article>
    `;
  } catch (err) {
    $results.innerHTML = `<article><p>Error: ${err.message}</p></article>`;
  } finally {
    $submit.removeAttribute('disabled');
    $submit.setAttribute('aria-busy', 'false');
  }
});
