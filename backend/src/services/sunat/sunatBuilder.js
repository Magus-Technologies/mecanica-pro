/**
 * SunatBuilder — Construye el payload JSON que la API Laravel espera.
 *
 * Convierte los datos del dominio MecánicaPro (comprobante + cliente + items + taller_config)
 * al formato que pide GenerarComprobanteRequest.
 */
class SunatBuilder {
  /**
   * @param {object} comp     Fila de `comprobantes` (tipo, serie, correlativo, fecha_emision, ...).
   * @param {object} cliente  Fila de `clientes` (tipo_documento, documento, nombre, direccion, tipo_cliente).
   * @param {object[]} items  Filas de `comprobantes_detalle` (descripcion, cantidad, precio_unitario).
   * @param {object} taller   Fila de `taller_config` (nombre_taller, ruc, direccion).
   */
  static buildComprobante(comp, cliente, items, taller = {}) {
    const tipo = comp.tipo; // 'boleta' | 'factura'

    return {
      endpoint:      process.env.SUNAT_ENDPOINT || 'beta',
      documento:     tipo,
      empresa:       SunatBuilder._empresa(taller),
      cliente:       SunatBuilder._cliente(cliente, tipo),
      serie:         comp.serie,
      numero:        String(comp.correlativo),
      fecha_emision: SunatBuilder._fecha(comp.fecha_emision),
      moneda:        'PEN',
      forma_pago:    'contado',
      detalles:      SunatBuilder._detalles(items),
    };
  }

  static _empresa(taller) {
    return {
      ruc:             process.env.SUNAT_RUC,
      usuario:         process.env.SUNAT_USUARIO_SOL,
      clave:           process.env.SUNAT_CLAVE_SOL,
      razon_social:    process.env.SUNAT_RAZON_SOCIAL,
      nombreComercial: taller.nombre_taller || process.env.SUNAT_NOMBRE_COMERCIAL || 'MecánicaPro',
      direccion:       process.env.SUNAT_DIRECCION,
      ubigueo:         process.env.SUNAT_UBIGEO,
      distrito:        process.env.SUNAT_DISTRITO,
      provincia:       process.env.SUNAT_PROVINCIA,
      departamento:    process.env.SUNAT_DEPARTAMENTO,
    };
  }

  /**
   * En MecánicaPro, `clientes.tipo_documento` (DNI|RUC|CE|Pasaporte) ya es
   * explícito, así que no discriminamos por longitud: confiamos en lo cargado.
   */
  static _cliente(c, tipo) {
    const doc = String(c?.documento || '').trim();
    const nom = String(c?.nombre || '').trim() || 'CLIENTE';
    const dir = (String(c?.direccion || '').trim()) || '-';

    if (tipo === 'factura') {
      const td = (c?.tipo_documento || '').toUpperCase();
      if (td !== 'RUC' || doc.length !== 11) {
        throw new Error(`La factura requiere cliente con RUC válido (11 dígitos). Cliente actual: tipo=${td}, doc='${doc}'.`);
      }
      return { tipo_doc: '6', num_doc: doc, rzn_social: nom, direccion: dir };
    }

    // Boleta
    if ((c?.tipo_documento || '').toUpperCase() === 'DNI' && doc.length === 8) {
      return { tipo_doc: '1', num_doc: doc, rzn_social: nom, direccion: dir };
    }
    return { tipo_doc: '0', num_doc: '00000000', rzn_social: nom || 'CLIENTE VARIOS', direccion: dir };
  }

  /**
   * `precio_unitario` se asume CON IGV incluido (el servicio Greenter divide
   * entre 1.18 internamente).
   */
  static _detalles(items) {
    return (items || []).map((it, i) => ({
      cod_producto: String(it.id ?? (i + 1)),
      unidad:       'NIU',
      descripcion:  String(it.descripcion || 'Servicio'),
      cantidad:     Number(it.cantidad || 1),
      precio:       Number(it.precio_unitario || 0),
    }));
  }

  static _fecha(d) {
    if (!d) return new Date().toISOString().slice(0, 19).replace('T', ' ');
    if (typeof d === 'string') return d;
    const dt = new Date(d);
    return dt.toISOString().slice(0, 19).replace('T', ' ');
  }
}

module.exports = SunatBuilder;
