/**
 * SunatService — Orquesta el flujo de facturación electrónica en DOS pasos.
 *
 *   1) generarXml(compId)   → llama /generar/comprobante, guarda XML+hash+qr,
 *                             deja sunat_estado = 'pendiente'.
 *   2) enviarSunat(compId)  → toma el XML guardado, llama /enviar/documento/electronico,
 *                             guarda CDR, deja sunat_estado = 'aceptado' | 'rechazado'.
 */
const db            = require('../../config/database');
const SunatClient   = require('./sunatClient');
const SunatBuilder  = require('./sunatBuilder');

class SunatService {
  constructor(client = new SunatClient()) {
    this.client = client;
  }

  // ─── PASO 1: GENERAR XML ──────────────────────────────────────
  async generarXml(compId) {
    const comp = await this._fetchComprobante(compId);
    if (!comp) return { ok: false, mensaje: `Comprobante #${compId} no encontrado.` };
    if (!['boleta', 'factura'].includes(comp.tipo)) {
      return { ok: false, mensaje: `Tipo '${comp.tipo}' no se emite a SUNAT.` };
    }
    if (comp.anulado) return { ok: false, mensaje: 'Este comprobante está anulado.' };
    if (!comp.serie || comp.correlativo == null) {
      return { ok: false, mensaje: 'El comprobante no tiene serie/correlativo.' };
    }

    const cliente = await this._fetchCliente(comp.cliente_id);
    const items   = await this._fetchItems(compId);
    const taller  = await this._fetchTaller();

    let payload;
    try {
      payload = SunatBuilder.buildComprobante(comp, cliente, items, taller);
    } catch (e) {
      await this._marcarRechazada(compId, e.message);
      return { ok: false, mensaje: e.message };
    }

    const gen = await this.client.generarComprobante(payload);
    if (!gen.estado) {
      const msg = gen.mensaje || 'Error al generar XML.';
      await this._marcarRechazada(compId, msg);
      return { ok: false, mensaje: msg, detalle: gen };
    }

    const hash   = gen.data?.hash          || '';
    const qrInfo = gen.data?.qr_info       || '';
    const xml    = gen.data?.contenido_xml || '';

    await this._marcarPendiente(compId, hash, qrInfo, xml);
    return { ok: true, mensaje: 'XML generado correctamente. Listo para enviar a SUNAT.', hash, qr: qrInfo };
  }

  // ─── PASO 2: ENVIAR A SUNAT ───────────────────────────────────
  async enviarSunat(compId) {
    const comp = await this._fetchComprobante(compId);
    if (!comp) return { ok: false, mensaje: `Comprobante #${compId} no encontrado.` };
    if (!comp.sunat_xml) return { ok: false, mensaje: 'Este comprobante no tiene XML generado todavía.' };
    if (comp.sunat_estado === 'aceptado') return { ok: false, mensaje: 'Este comprobante ya fue aceptado por SUNAT.' };

    const env = await this.client.enviarDocumento({
      ruc:                 process.env.SUNAT_RUC,
      usuario:             process.env.SUNAT_USUARIO_SOL,
      clave:               process.env.SUNAT_CLAVE_SOL,
      endpoint:            process.env.SUNAT_ENDPOINT || 'beta',
      nombre_documento:    SunatService.nombreArchivo(comp),
      contenido_documento: comp.sunat_xml,
    });

    if (!env.estado) {
      const msg = env.mensaje || 'Error al enviar a SUNAT.';
      await this._marcarRechazada(compId, msg, comp.sunat_hash, comp.sunat_qr, comp.sunat_xml);
      return { ok: false, mensaje: msg, detalle: env };
    }

    await this._marcarAceptada(compId, comp.sunat_hash, comp.sunat_qr, comp.sunat_xml, env.cdr || '', env.mensaje || 'ACEPTADO');
    return { ok: true, mensaje: 'Comprobante aceptado por SUNAT.', cdr: env.cdr || '' };
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  static nombreArchivo(comp) {
    const tipo = comp.tipo === 'factura' ? '01' : '03';
    const num  = String(comp.correlativo).padStart(8, '0');
    return `${process.env.SUNAT_RUC}-${tipo}-${comp.serie}-${num}`;
  }

  // ─── Lecturas ────────────────────────────────────────────────────

  async _fetchComprobante(id) {
    const { rows } = await db.query('SELECT * FROM comprobantes WHERE id=?', [id]);
    return rows[0] || null;
  }

  async _fetchCliente(id) {
    if (!id) return {};
    const { rows } = await db.query('SELECT * FROM clientes WHERE id=?', [id]);
    return rows[0] || {};
  }

  async _fetchItems(compId) {
    const { rows } = await db.query(
      'SELECT id, descripcion, cantidad, precio_unitario, subtotal FROM comprobantes_detalle WHERE comprobante_id=? ORDER BY id',
      [compId]
    );
    return rows;
  }

  async _fetchTaller() {
    const { rows } = await db.query('SELECT * FROM taller_config WHERE id=1');
    return rows[0] || {};
  }

  // ─── Persistencia ────────────────────────────────────────────────

  async _marcarPendiente(id, hash, qr, xml) {
    await db.query(`
      UPDATE comprobantes SET
        sunat_estado='pendiente',
        sunat_hash=?,
        sunat_qr=?,
        sunat_xml=?,
        sunat_cdr=NULL,
        sunat_mensaje='XML generado, pendiente de envío.',
        sunat_fecha=NOW()
      WHERE id=?
    `, [hash, qr, xml, id]);
  }

  async _marcarAceptada(id, hash, qr, xml, cdr, msg) {
    await db.query(`
      UPDATE comprobantes SET
        sunat_estado='aceptado',
        sunat_hash=?,
        sunat_qr=?,
        sunat_xml=?,
        sunat_cdr=?,
        sunat_mensaje=?,
        sunat_fecha=NOW()
      WHERE id=?
    `, [hash, qr, xml, cdr, msg, id]);
  }

  async _marcarRechazada(id, msg, hash = '', qr = '', xml = '') {
    await db.query(`
      UPDATE comprobantes SET
        sunat_estado='rechazado',
        sunat_hash=?,
        sunat_qr=?,
        sunat_xml=?,
        sunat_mensaje=?,
        sunat_fecha=NOW()
      WHERE id=?
    `, [hash, qr, xml, String(msg).slice(0, 1000), id]);
  }
}

module.exports = SunatService;
