const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const SunatService = require('../services/sunat/sunatService');

router.use(authMiddleware);

/**
 * GET /api/sunat — listar comprobantes facturables (boleta/factura) con filtros.
 *   Query params: desde, hasta, tipo (boleta|factura), estado (sin_emitir|pendiente|aceptado|rechazado)
 */
router.get('/', async (req, res) => {
  try {
    const { desde, hasta, tipo, estado } = req.query;
    const where = [`cp.tipo IN ('boleta','factura')`, `cp.anulado=0`];
    const params = [];
    if (desde) { where.push('DATE(cp.fecha_emision) >= ?'); params.push(desde); }
    if (hasta) { where.push('DATE(cp.fecha_emision) <= ?'); params.push(hasta); }
    if (tipo && ['boleta', 'factura'].includes(tipo)) { where.push('cp.tipo=?'); params.push(tipo); }
    if (estado) {
      if (estado === 'sin_emitir') where.push('cp.sunat_estado IS NULL');
      else { where.push('cp.sunat_estado=?'); params.push(estado); }
    }

    const { rows } = await db.query(`
      SELECT cp.id, cp.serie_numero, cp.tipo, cp.serie, cp.correlativo,
             cp.subtotal, cp.igv, cp.total, cp.fecha_emision,
             cp.sunat_estado, cp.sunat_mensaje,
             c.nombre AS cliente, c.documento AS cliente_doc, c.tipo_documento AS cliente_tipo_doc
      FROM comprobantes cp
      JOIN clientes c ON cp.cliente_id=c.id
      WHERE ${where.join(' AND ')}
      ORDER BY cp.fecha_emision DESC
      LIMIT 300
    `, params);

    // KPIs
    const { rows: kRows } = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN cp.sunat_estado IS NULL    THEN 1 ELSE 0 END) AS sin_emitir,
        SUM(CASE WHEN cp.sunat_estado='pendiente' THEN 1 ELSE 0 END) AS pendientes,
        SUM(CASE WHEN cp.sunat_estado='aceptado'  THEN 1 ELSE 0 END) AS aceptados,
        SUM(CASE WHEN cp.sunat_estado='rechazado' THEN 1 ELSE 0 END) AS rechazados
      FROM comprobantes cp
      WHERE cp.tipo IN ('boleta','factura') AND cp.anulado=0
        ${desde ? ' AND DATE(cp.fecha_emision) >= ?' : ''}
        ${hasta ? ' AND DATE(cp.fecha_emision) <= ?' : ''}
    `, [desde, hasta].filter(Boolean));

    res.json({ success: true, data: rows, kpis: kRows[0] || {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al listar comprobantes' });
  }
});

/**
 * GET /api/sunat/:id — detalle del comprobante con items.
 */
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT cp.*, c.nombre AS cliente, c.documento AS cliente_doc,
             c.tipo_documento AS cliente_tipo_doc, c.direccion AS cliente_direccion,
             u.nombre AS usuario_nombre
      FROM comprobantes cp
      JOIN clientes c ON cp.cliente_id=c.id
      LEFT JOIN usuarios u ON u.id=cp.usuario_id
      WHERE cp.id=?
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'No encontrado' });

    const { rows: items } = await db.query(
      'SELECT * FROM comprobantes_detalle WHERE comprobante_id=? ORDER BY id',
      [req.params.id]
    );
    res.json({ success: true, data: rows[0], items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener comprobante' });
  }
});

/**
 * POST /api/sunat/:id/generar — genera el XML.
 */
router.post('/:id/generar', async (req, res) => {
  try {
    const svc = new SunatService();
    const r   = await svc.generarXml(parseInt(req.params.id, 10));
    res.status(r.ok ? 200 : 400).json({ success: r.ok, ...r });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/sunat/:id/enviar — envía el XML a SUNAT.
 */
router.post('/:id/enviar', async (req, res) => {
  try {
    const svc = new SunatService();
    const r   = await svc.enviarSunat(parseInt(req.params.id, 10));
    res.status(r.ok ? 200 : 400).json({ success: r.ok, ...r });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/sunat/:id/xml?download=1 — devuelve el XML (visualizar o descargar).
 */
router.get('/:id/xml', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT serie, correlativo, tipo, sunat_xml FROM comprobantes WHERE id=?',
      [req.params.id]
    );
    const r = rows[0];
    if (!r || !r.sunat_xml) return res.status(404).type('text/plain').send('Sin XML');

    const tipo = r.tipo === 'factura' ? '01' : '03';
    const num  = String(r.correlativo).padStart(8, '0');
    const name = `${process.env.SUNAT_RUC}-${tipo}-${r.serie}-${num}.xml`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    if (req.query.download) {
      res.set('Content-Disposition', `attachment; filename="${name}"`);
    }
    res.send(r.sunat_xml);
  } catch (err) {
    console.error(err);
    res.status(500).type('text/plain').send('Error');
  }
});

/**
 * GET /api/sunat/:id/cdr — descarga el CDR (zip base64 → binario).
 */
router.get('/:id/cdr', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT serie, correlativo, tipo, sunat_cdr FROM comprobantes WHERE id=?',
      [req.params.id]
    );
    const r = rows[0];
    if (!r || !r.sunat_cdr) return res.status(404).type('text/plain').send('Sin CDR');

    const tipo = r.tipo === 'factura' ? '01' : '03';
    const num  = String(r.correlativo).padStart(8, '0');
    const name = `R-${process.env.SUNAT_RUC}-${tipo}-${r.serie}-${num}.zip`;

    const bin = Buffer.from(r.sunat_cdr, 'base64');
    if (bin.length === 0) {
      // Si no era base64, lo entregamos como texto.
      res.set('Content-Type', 'text/plain; charset=utf-8');
      return res.send(r.sunat_cdr);
    }
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename="${name}"`);
    res.send(bin);
  } catch (err) {
    console.error(err);
    res.status(500).type('text/plain').send('Error');
  }
});

module.exports = router;
