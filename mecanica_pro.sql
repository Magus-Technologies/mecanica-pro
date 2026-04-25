/*
 Navicat Premium Dump SQL

 Source Server         : ecommerce
 Source Server Type    : MySQL
 Source Server Version : 100527 (10.5.27-MariaDB)
 Source Host           : 173.249.36.119:3306
 Source Schema         : mecanica_pro

 Target Server Type    : MySQL
 Target Server Version : 100527 (10.5.27-MariaDB)
 File Encoding         : 65001

 Date: 25/04/2026 09:06:33
*/

CREATE DATABASE IF NOT EXISTS mecanica_pro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mecanica_pro;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for caja_movimientos
-- ----------------------------
DROP TABLE IF EXISTS `caja_movimientos`;
CREATE TABLE `caja_movimientos`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sesion_id` int UNSIGNED NOT NULL,
  `tipo` enum('ingreso','egreso') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto` decimal(10, 2) NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `metodo_pago` enum('efectivo','yape','plin','tarjeta','transferencia') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'efectivo',
  `referencia` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `usuario_id` int UNSIGNED NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `usuario_id`(`usuario_id` ASC) USING BTREE,
  INDEX `idx_sesion`(`sesion_id` ASC) USING BTREE,
  INDEX `idx_fecha`(`created_at` ASC) USING BTREE,
  CONSTRAINT `caja_movimientos_ibfk_1` FOREIGN KEY (`sesion_id`) REFERENCES `caja_sesiones` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `caja_movimientos_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of caja_movimientos
-- ----------------------------

-- ----------------------------
-- Table structure for caja_sesiones
-- ----------------------------
DROP TABLE IF EXISTS `caja_sesiones`;
CREATE TABLE `caja_sesiones`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id` int UNSIGNED NOT NULL,
  `monto_apertura` decimal(10, 2) NULL DEFAULT 0.00,
  `monto_cierre` decimal(10, 2) NULL DEFAULT NULL,
  `estado` enum('abierta','cerrada') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'abierta',
  `fecha_apertura` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_cierre` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `usuario_id`(`usuario_id` ASC) USING BTREE,
  CONSTRAINT `caja_sesiones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of caja_sesiones
-- ----------------------------

-- ----------------------------
-- Table structure for categorias_repuesto
-- ----------------------------
DROP TABLE IF EXISTS `categorias_repuesto`;
CREATE TABLE `categorias_repuesto`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of categorias_repuesto
-- ----------------------------
INSERT INTO `categorias_repuesto` VALUES (1, 'Aceites y lubricantes', 1);
INSERT INTO `categorias_repuesto` VALUES (2, 'Filtros', 1);
INSERT INTO `categorias_repuesto` VALUES (3, 'Frenos', 1);
INSERT INTO `categorias_repuesto` VALUES (4, 'Suspensión', 1);
INSERT INTO `categorias_repuesto` VALUES (5, 'Motor', 1);
INSERT INTO `categorias_repuesto` VALUES (6, 'Electricidad', 1);
INSERT INTO `categorias_repuesto` VALUES (7, 'Varios', 1);

-- ----------------------------
-- Table structure for categorias_servicio
-- ----------------------------
DROP TABLE IF EXISTS `categorias_servicio`;
CREATE TABLE `categorias_servicio`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `activo` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of categorias_servicio
-- ----------------------------
INSERT INTO `categorias_servicio` VALUES (1, 'Mantenimiento preventivo', NULL, 1);
INSERT INTO `categorias_servicio` VALUES (2, 'Motor', NULL, 1);
INSERT INTO `categorias_servicio` VALUES (3, 'Frenos', NULL, 1);
INSERT INTO `categorias_servicio` VALUES (4, 'Suspensión', NULL, 1);
INSERT INTO `categorias_servicio` VALUES (5, 'Electricidad', NULL, 1);
INSERT INTO `categorias_servicio` VALUES (6, 'Transmisión', NULL, 1);
INSERT INTO `categorias_servicio` VALUES (7, 'Aire acondicionado', NULL, 1);
INSERT INTO `categorias_servicio` VALUES (8, 'Carrocería', NULL, 1);
INSERT INTO `categorias_servicio` VALUES (9, 'Diagnosis', NULL, 1);
INSERT INTO `categorias_servicio` VALUES (10, 'Motos', NULL, 1);

-- ----------------------------
-- Table structure for clientes
-- ----------------------------
DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_documento` enum('DNI','RUC','CE','Pasaporte') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'DNI',
  `documento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `direccion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `tipo_cliente` enum('natural','empresa') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'natural',
  `credito_limite` decimal(10, 2) NULL DEFAULT 0.00,
  `saldo_deuda` decimal(10, 2) NULL DEFAULT 0.00,
  `notas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `activo` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `documento`(`documento` ASC) USING BTREE,
  INDEX `idx_nombre`(`nombre` ASC) USING BTREE,
  INDEX `idx_telefono`(`telefono` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of clientes
-- ----------------------------

-- ----------------------------
-- Table structure for comprobantes
-- ----------------------------
DROP TABLE IF EXISTS `comprobantes`;
CREATE TABLE `comprobantes`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `cliente_id` int UNSIGNED NOT NULL,
  `ot_id` int UNSIGNED NULL DEFAULT NULL,
  `tipo` enum('boleta','factura','nota_venta') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'boleta',
  `serie_numero` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `serie` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `correlativo` int UNSIGNED NOT NULL,
  `metodo_pago` enum('efectivo','yape','plin','tarjeta','transferencia','credito') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'efectivo',
  `subtotal` decimal(10, 2) NOT NULL,
  `igv` decimal(10, 2) NULL DEFAULT 0.00,
  `descuento` decimal(10, 2) NULL DEFAULT 0.00,
  `total` decimal(10, 2) NOT NULL,
  `anulado` tinyint(1) NULL DEFAULT 0,
  `fecha_emision` timestamp NOT NULL DEFAULT current_timestamp(),
  `usuario_id` int UNSIGNED NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `serie_numero`(`serie_numero` ASC) USING BTREE,
  INDEX `cliente_id`(`cliente_id` ASC) USING BTREE,
  INDEX `ot_id`(`ot_id` ASC) USING BTREE,
  INDEX `usuario_id`(`usuario_id` ASC) USING BTREE,
  INDEX `idx_fecha`(`fecha_emision` ASC) USING BTREE,
  INDEX `idx_tipo`(`tipo` ASC) USING BTREE,
  CONSTRAINT `comprobantes_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `comprobantes_ibfk_2` FOREIGN KEY (`ot_id`) REFERENCES `ordenes_trabajo` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `comprobantes_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of comprobantes
-- ----------------------------

-- ----------------------------
-- Table structure for comprobantes_detalle
-- ----------------------------
DROP TABLE IF EXISTS `comprobantes_detalle`;
CREATE TABLE `comprobantes_detalle`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `comprobante_id` int UNSIGNED NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` int NOT NULL DEFAULT 1,
  `precio_unitario` decimal(10, 2) NOT NULL,
  `subtotal` decimal(10, 2) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `comprobante_id`(`comprobante_id` ASC) USING BTREE,
  CONSTRAINT `comprobantes_detalle_ibfk_1` FOREIGN KEY (`comprobante_id`) REFERENCES `comprobantes` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of comprobantes_detalle
-- ----------------------------

-- ----------------------------
-- Table structure for kardex
-- ----------------------------
DROP TABLE IF EXISTS `kardex`;
CREATE TABLE `kardex`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `repuesto_id` int UNSIGNED NOT NULL,
  `tipo` enum('entrada','salida','ajuste') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` int NOT NULL,
  `stock_anterior` int NOT NULL,
  `stock_nuevo` int NOT NULL,
  `referencia` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `usuario_id` int UNSIGNED NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `usuario_id`(`usuario_id` ASC) USING BTREE,
  INDEX `idx_repuesto`(`repuesto_id` ASC) USING BTREE,
  INDEX `idx_fecha`(`created_at` ASC) USING BTREE,
  CONSTRAINT `kardex_ibfk_1` FOREIGN KEY (`repuesto_id`) REFERENCES `repuestos` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `kardex_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of kardex
-- ----------------------------

-- ----------------------------
-- Table structure for ordenes_compra
-- ----------------------------
DROP TABLE IF EXISTS `ordenes_compra`;
CREATE TABLE `ordenes_compra`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `proveedor_id` int UNSIGNED NULL DEFAULT NULL,
  `estado` enum('borrador','enviada','recibida','cancelada') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'recibida',
  `total` decimal(10, 2) NULL DEFAULT 0.00,
  `notas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `usuario_id` int UNSIGNED NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `proveedor_id`(`proveedor_id` ASC) USING BTREE,
  INDEX `usuario_id`(`usuario_id` ASC) USING BTREE,
  CONSTRAINT `ordenes_compra_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `ordenes_compra_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ordenes_compra
-- ----------------------------

-- ----------------------------
-- Table structure for ordenes_compra_detalle
-- ----------------------------
DROP TABLE IF EXISTS `ordenes_compra_detalle`;
CREATE TABLE `ordenes_compra_detalle`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `oc_id` int UNSIGNED NOT NULL,
  `repuesto_id` int UNSIGNED NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10, 2) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `oc_id`(`oc_id` ASC) USING BTREE,
  INDEX `repuesto_id`(`repuesto_id` ASC) USING BTREE,
  CONSTRAINT `ordenes_compra_detalle_ibfk_1` FOREIGN KEY (`oc_id`) REFERENCES `ordenes_compra` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `ordenes_compra_detalle_ibfk_2` FOREIGN KEY (`repuesto_id`) REFERENCES `repuestos` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ordenes_compra_detalle
-- ----------------------------

-- ----------------------------
-- Table structure for ordenes_trabajo
-- ----------------------------
DROP TABLE IF EXISTS `ordenes_trabajo`;
CREATE TABLE `ordenes_trabajo`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_id` int UNSIGNED NOT NULL,
  `vehiculo_id` int UNSIGNED NOT NULL,
  `tecnico_id` int UNSIGNED NULL DEFAULT NULL,
  `usuario_creacion` int UNSIGNED NULL DEFAULT NULL,
  `estado` enum('pendiente','diagnostico','aprobado','rechazado','en_proceso','terminado','facturado','entregado','cancelado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pendiente',
  `prioridad` enum('baja','normal','alta','urgente') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'normal',
  `km_entrada` int UNSIGNED NULL DEFAULT 0,
  `km_salida` int UNSIGNED NULL DEFAULT NULL,
  `diagnostico` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `observaciones_internas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `total_estimado` decimal(10, 2) NULL DEFAULT 0.00,
  `total_real` decimal(10, 2) NULL DEFAULT 0.00,
  `firma_cliente` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'base64 imagen firma',
  `fecha_prometida` date NULL DEFAULT NULL,
  `fecha_entrega` timestamp NULL DEFAULT NULL,
  `activo` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `codigo`(`codigo` ASC) USING BTREE,
  INDEX `tecnico_id`(`tecnico_id` ASC) USING BTREE,
  INDEX `usuario_creacion`(`usuario_creacion` ASC) USING BTREE,
  INDEX `idx_estado`(`estado` ASC) USING BTREE,
  INDEX `idx_cliente`(`cliente_id` ASC) USING BTREE,
  INDEX `idx_vehiculo`(`vehiculo_id` ASC) USING BTREE,
  INDEX `idx_fecha`(`created_at` ASC) USING BTREE,
  CONSTRAINT `ordenes_trabajo_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `ordenes_trabajo_ibfk_2` FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `ordenes_trabajo_ibfk_3` FOREIGN KEY (`tecnico_id`) REFERENCES `tecnicos` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `ordenes_trabajo_ibfk_4` FOREIGN KEY (`usuario_creacion`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ordenes_trabajo
-- ----------------------------

-- ----------------------------
-- Table structure for ot_evidencias
-- ----------------------------
DROP TABLE IF EXISTS `ot_evidencias`;
CREATE TABLE `ot_evidencias`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `ot_id` int UNSIGNED NOT NULL,
  `tipo` enum('foto','video','documento') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'foto',
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `usuario_id` int UNSIGNED NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ot_id`(`ot_id` ASC) USING BTREE,
  INDEX `usuario_id`(`usuario_id` ASC) USING BTREE,
  CONSTRAINT `ot_evidencias_ibfk_1` FOREIGN KEY (`ot_id`) REFERENCES `ordenes_trabajo` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `ot_evidencias_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ot_evidencias
-- ----------------------------

-- ----------------------------
-- Table structure for ot_historial
-- ----------------------------
DROP TABLE IF EXISTS `ot_historial`;
CREATE TABLE `ot_historial`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `ot_id` int UNSIGNED NOT NULL,
  `estado_anterior` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `estado_nuevo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `usuario_id` int UNSIGNED NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ot_id`(`ot_id` ASC) USING BTREE,
  INDEX `usuario_id`(`usuario_id` ASC) USING BTREE,
  CONSTRAINT `ot_historial_ibfk_1` FOREIGN KEY (`ot_id`) REFERENCES `ordenes_trabajo` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `ot_historial_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ot_historial
-- ----------------------------

-- ----------------------------
-- Table structure for ot_repuestos
-- ----------------------------
DROP TABLE IF EXISTS `ot_repuestos`;
CREATE TABLE `ot_repuestos`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `ot_id` int UNSIGNED NOT NULL,
  `repuesto_id` int UNSIGNED NOT NULL,
  `cantidad` int NOT NULL DEFAULT 1,
  `precio_unitario` decimal(10, 2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ot_id`(`ot_id` ASC) USING BTREE,
  INDEX `repuesto_id`(`repuesto_id` ASC) USING BTREE,
  CONSTRAINT `ot_repuestos_ibfk_1` FOREIGN KEY (`ot_id`) REFERENCES `ordenes_trabajo` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `ot_repuestos_ibfk_2` FOREIGN KEY (`repuesto_id`) REFERENCES `repuestos` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ot_repuestos
-- ----------------------------

-- ----------------------------
-- Table structure for ot_servicios
-- ----------------------------
DROP TABLE IF EXISTS `ot_servicios`;
CREATE TABLE `ot_servicios`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `ot_id` int UNSIGNED NOT NULL,
  `servicio_id` int UNSIGNED NOT NULL,
  `tecnico_id` int UNSIGNED NULL DEFAULT NULL,
  `precio_cobrado` decimal(10, 2) NOT NULL,
  `tiempo_real` int UNSIGNED NULL DEFAULT NULL COMMENT 'minutos reales',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ot_id`(`ot_id` ASC) USING BTREE,
  INDEX `servicio_id`(`servicio_id` ASC) USING BTREE,
  INDEX `tecnico_id`(`tecnico_id` ASC) USING BTREE,
  CONSTRAINT `ot_servicios_ibfk_1` FOREIGN KEY (`ot_id`) REFERENCES `ordenes_trabajo` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `ot_servicios_ibfk_2` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `ot_servicios_ibfk_3` FOREIGN KEY (`tecnico_id`) REFERENCES `tecnicos` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ot_servicios
-- ----------------------------

-- ----------------------------
-- Table structure for proveedores
-- ----------------------------
DROP TABLE IF EXISTS `proveedores`;
CREATE TABLE `proveedores`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ruc` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `direccion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `activo` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `ruc`(`ruc` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of proveedores
-- ----------------------------

-- ----------------------------
-- Table structure for recordatorios
-- ----------------------------
DROP TABLE IF EXISTS `recordatorios`;
CREATE TABLE `recordatorios`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `cliente_id` int UNSIGNED NOT NULL,
  `vehiculo_id` int UNSIGNED NULL DEFAULT NULL,
  `tipo` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `fecha_programada` date NOT NULL,
  `canal` enum('whatsapp','email','sms') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'whatsapp',
  `enviado` tinyint(1) NULL DEFAULT 0,
  `fecha_envio` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `cliente_id`(`cliente_id` ASC) USING BTREE,
  INDEX `vehiculo_id`(`vehiculo_id` ASC) USING BTREE,
  INDEX `idx_fecha`(`fecha_programada` ASC) USING BTREE,
  INDEX `idx_enviado`(`enviado` ASC) USING BTREE,
  CONSTRAINT `recordatorios_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `recordatorios_ibfk_2` FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of recordatorios
-- ----------------------------

-- ----------------------------
-- Table structure for repuestos
-- ----------------------------
DROP TABLE IF EXISTS `repuestos`;
CREATE TABLE `repuestos`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `categoria_id` int UNSIGNED NULL DEFAULT NULL,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `marca` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `unidad` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'und',
  `precio_compra` decimal(10, 2) NULL DEFAULT 0.00,
  `precio_venta` decimal(10, 2) NULL DEFAULT 0.00,
  `stock_actual` int NULL DEFAULT 0,
  `stock_minimo` int NULL DEFAULT 5,
  `stock_maximo` int NULL DEFAULT 100,
  `ubicacion` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `activo` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `sku`(`sku` ASC) USING BTREE,
  INDEX `categoria_id`(`categoria_id` ASC) USING BTREE,
  INDEX `idx_nombre`(`nombre` ASC) USING BTREE,
  INDEX `idx_stock`(`stock_actual` ASC, `stock_minimo` ASC) USING BTREE,
  CONSTRAINT `repuestos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_repuesto` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of repuestos
-- ----------------------------
INSERT INTO `repuestos` VALUES (1, 1, 'Aceite 10W-40 1L', 'ACE-10W40-1L', NULL, 'L', 8.00, 15.00, 40, 10, 100, NULL, NULL, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `repuestos` VALUES (2, 1, 'Aceite 15W-40 1L', 'ACE-15W40-1L', NULL, 'L', 7.00, 13.00, 30, 10, 100, NULL, NULL, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `repuestos` VALUES (3, 1, 'Aceite 5W-30 sintético', 'ACE-5W30-SIN', NULL, 'L', 12.00, 22.00, 20, 8, 100, NULL, NULL, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `repuestos` VALUES (4, 2, 'Filtro de aceite Toyota', 'FILT-ACE-TOY', NULL, 'und', 12.00, 22.00, 15, 5, 100, NULL, NULL, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `repuestos` VALUES (5, 2, 'Filtro de aceite Nissan', 'FILT-ACE-NIS', NULL, 'und', 10.00, 18.00, 12, 5, 100, NULL, NULL, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `repuestos` VALUES (6, 2, 'Filtro de aire universal', 'FILT-AIRE-UNI', NULL, 'und', 15.00, 28.00, 10, 4, 100, NULL, NULL, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `repuestos` VALUES (7, 2, 'Filtro de combustible', 'FILT-COMB-01', NULL, 'und', 18.00, 32.00, 8, 3, 100, NULL, NULL, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `repuestos` VALUES (8, 3, 'Pastillas delantera Toyota', 'PAST-DEL-TOY', NULL, 'jgo', 45.00, 75.00, 10, 3, 100, NULL, NULL, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `repuestos` VALUES (9, 3, 'Pastillas delantera Hyundai', 'PAST-DEL-HYU', NULL, 'jgo', 42.00, 70.00, 8, 3, 100, NULL, NULL, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `repuestos` VALUES (10, 3, 'Líquido de frenos DOT4', 'LIQ-FREN-DOT4', NULL, '250ml', 5.00, 10.00, 20, 6, 100, NULL, NULL, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `repuestos` VALUES (11, 4, 'Amortiguador delantero', 'AMORT-DEL-01', NULL, 'und', 80.00, 140.00, 4, 2, 100, NULL, NULL, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `repuestos` VALUES (12, 5, 'Bujías NGK (4und)', 'BUJ-NGK-4', NULL, 'jgo', 28.00, 48.00, 12, 4, 100, NULL, NULL, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `repuestos` VALUES (13, 5, 'Bujías Bosch (4und)', 'BUJ-BOSCH-4', NULL, 'jgo', 30.00, 52.00, 10, 4, 100, NULL, NULL, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `repuestos` VALUES (14, 6, 'Batería 60Ah', 'BAT-60AH', NULL, 'und', 180.00, 280.00, 3, 1, 100, NULL, NULL, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `repuestos` VALUES (15, 6, 'Foco H4 55W', 'FOC-H4-55W', NULL, 'und', 8.00, 18.00, 20, 6, 100, NULL, NULL, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `repuestos` VALUES (16, 7, 'Refrigerante 1L', 'REFRIG-1L', NULL, 'L', 6.00, 12.00, 15, 5, 100, NULL, NULL, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `repuestos` VALUES (17, 7, 'Limpia bujías', 'LIMPIA-BUJ', NULL, 'und', 10.00, 18.00, 8, 3, 100, NULL, NULL, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `nombre`(`nombre` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, 'admin', 'Acceso total al sistema', '2026-04-17 18:00:45');
INSERT INTO `roles` VALUES (2, 'gerente', 'Gestión y reportes', '2026-04-17 18:00:45');
INSERT INTO `roles` VALUES (3, 'recepcion', 'Recepción y OTs', '2026-04-17 18:00:45');
INSERT INTO `roles` VALUES (4, 'tecnico', 'Ver OTs asignadas', '2026-04-17 18:00:45');
INSERT INTO `roles` VALUES (5, 'caja', 'Ventas y caja', '2026-04-17 18:00:45');

-- ----------------------------
-- Table structure for servicios
-- ----------------------------
DROP TABLE IF EXISTS `servicios`;
CREATE TABLE `servicios`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `categoria_id` int UNSIGNED NULL DEFAULT NULL,
  `nombre` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `precio` decimal(10, 2) NOT NULL,
  `costo_mo` decimal(10, 2) NULL DEFAULT 0.00,
  `tiempo_estimado` int UNSIGNED NULL DEFAULT 60 COMMENT 'minutos',
  `activo` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `categoria_id`(`categoria_id` ASC) USING BTREE,
  CONSTRAINT `servicios_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_servicio` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of servicios
-- ----------------------------
INSERT INTO `servicios` VALUES (1, 1, 'Cambio de aceite + filtro', NULL, 45.00, 15.00, 30, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `servicios` VALUES (2, 1, 'Cambio de filtro de aire', NULL, 20.00, 8.00, 20, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `servicios` VALUES (3, 1, 'Afinamiento básico', NULL, 120.00, 40.00, 120, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `servicios` VALUES (4, 1, 'Afinamiento completo', NULL, 200.00, 70.00, 180, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `servicios` VALUES (5, 2, 'Limpieza de inyectores', NULL, 150.00, 50.00, 90, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `servicios` VALUES (6, 2, 'Cambio de bujías', NULL, 60.00, 20.00, 45, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `servicios` VALUES (7, 3, 'Cambio de pastillas delanteras', NULL, 80.00, 30.00, 60, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `servicios` VALUES (8, 3, 'Rectificado de discos', NULL, 120.00, 45.00, 90, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `servicios` VALUES (9, 3, 'Cambio de líquido de frenos', NULL, 35.00, 12.00, 30, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `servicios` VALUES (10, 4, 'Alineación y balanceo', NULL, 70.00, 25.00, 60, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `servicios` VALUES (11, 4, 'Cambio de amortiguadores (par)', NULL, 200.00, 60.00, 120, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `servicios` VALUES (12, 5, 'Revisión del sistema eléctrico', NULL, 80.00, 30.00, 60, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `servicios` VALUES (13, 5, 'Cambio de batería', NULL, 50.00, 15.00, 20, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `servicios` VALUES (14, 8, 'Lavado completo', NULL, 30.00, 10.00, 45, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `servicios` VALUES (15, 9, 'Diagnosis con scanner', NULL, 60.00, 20.00, 30, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `servicios` VALUES (16, 10, 'Cambio de aceite moto', NULL, 30.00, 10.00, 20, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `servicios` VALUES (17, 10, 'Afinamiento moto', NULL, 80.00, 30.00, 60, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');

-- ----------------------------
-- Table structure for taller_config
-- ----------------------------
DROP TABLE IF EXISTS `taller_config`;
CREATE TABLE `taller_config`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre_taller` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'Mi Taller Mecánico',
  `ruc` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `direccion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `logo_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `serie_boleta` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'B001',
  `serie_factura` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'F001',
  `igv_pct` decimal(5, 2) NULL DEFAULT 18.00,
  `correlativo_ot` int UNSIGNED NULL DEFAULT 0,
  `correlativo_boleta` int UNSIGNED NULL DEFAULT 0,
  `correlativo_factura` int UNSIGNED NULL DEFAULT 0,
  `correlativo_nota` int UNSIGNED NULL DEFAULT 0,
  `moneda` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'PEN',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of taller_config
-- ----------------------------
INSERT INTO `taller_config` VALUES (1, 'Mi Taller Mecánico', '10000000001', '999000001', NULL, 'Lima, Perú', NULL, 'B001', 'F001', 18.00, 0, 0, 0, 0, 'PEN', '2026-04-17 18:00:45', '2026-04-17 18:00:45');

-- ----------------------------
-- Table structure for tecnicos
-- ----------------------------
DROP TABLE IF EXISTS `tecnicos`;
CREATE TABLE `tecnicos`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `especialidad` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `comision_pct` decimal(5, 2) NULL DEFAULT 0.00,
  `salario_base` decimal(10, 2) NULL DEFAULT 0.00,
  `activo` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tecnicos
-- ----------------------------
INSERT INTO `tecnicos` VALUES (1, 'Carlos Ramírez', 'Motor y mecánica general', '987654321', NULL, 15.00, 1800.00, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `tecnicos` VALUES (2, 'Luis Torres', 'Electricidad y diagnosis', '976543210', NULL, 12.00, 1600.00, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `tecnicos` VALUES (3, 'Pedro Quispe', 'Frenos y suspensión', '965432109', NULL, 12.00, 1600.00, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `tecnicos` VALUES (4, 'María Flores', 'Motos y general', '954321098', NULL, 10.00, 1400.00, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');

-- ----------------------------
-- Table structure for usuarios
-- ----------------------------
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `rol_id` int UNSIGNED NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) NULL DEFAULT 1,
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  INDEX `rol_id`(`rol_id` ASC) USING BTREE,
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of usuarios
-- ----------------------------
INSERT INTO `usuarios` VALUES (1, 1, 'Administrador', 'admin', 'admin@taller.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/oZ3VxjGrC', 1, NULL, '2026-04-17 18:00:45', '2026-04-17 18:00:45');

-- ----------------------------
-- Table structure for vehiculos
-- ----------------------------
DROP TABLE IF EXISTS `vehiculos`;
CREATE TABLE `vehiculos`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `cliente_id` int UNSIGNED NOT NULL,
  `placa` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `marca` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `modelo` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `anio` smallint UNSIGNED NULL DEFAULT NULL,
  `tipo` enum('auto','moto','camioneta','camion','otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'auto',
  `color` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `vin` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `motor` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `combustible` enum('gasolina','diesel','gas','electrico','hibrido') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'gasolina',
  `km_actual` int UNSIGNED NULL DEFAULT 0,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `activo` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `placa`(`placa` ASC) USING BTREE,
  UNIQUE INDEX `vin`(`vin` ASC) USING BTREE,
  INDEX `cliente_id`(`cliente_id` ASC) USING BTREE,
  INDEX `idx_placa`(`placa` ASC) USING BTREE,
  CONSTRAINT `vehiculos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of vehiculos
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
