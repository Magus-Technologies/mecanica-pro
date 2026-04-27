/**
 * SunatClient — Cliente HTTP para la API api-sunat-laravel.
 *
 * Solo se encarga de hablar con la API: hace POST con JSON y devuelve
 * un objeto con la respuesta decodificada. No conoce nada del dominio.
 *
 * Usa fetch nativo de Node 18+.
 */
class SunatClient {
  constructor({ baseUrl, timeout } = {}) {
    this.baseUrl = (baseUrl || process.env.SUNAT_API_URL || '').replace(/\/+$/, '');
    this.timeout = parseInt(timeout || process.env.SUNAT_API_TIMEOUT || 60000, 10);
  }

  generarComprobante(payload) {
    return this._post('/generar/comprobante', payload);
  }

  enviarDocumento(payload) {
    return this._post('/enviar/documento/electronico', payload);
  }

  async _post(path, payload) {
    const url = this.baseUrl + path;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), this.timeout);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); }
      catch {
        return { estado: false, mensaje: `Respuesta no-JSON (HTTP ${res.status}): ${text.slice(0, 300)}`, http: res.status, raw: text };
      }
      data.http = res.status;
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        return { estado: false, mensaje: `Timeout luego de ${this.timeout}ms`, http: 0 };
      }
      return { estado: false, mensaje: `Error de red: ${err.message}`, http: 0 };
    } finally {
      clearTimeout(t);
    }
  }
}

module.exports = SunatClient;
