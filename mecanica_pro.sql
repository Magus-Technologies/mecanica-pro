/*
 Navicat Premium Dump SQL

 Source Server         : proyectos
 Source Server Type    : MySQL
 Source Server Version : 100529 (10.5.29-MariaDB)
 Source Host           : 84.247.162.204:3306
 Source Schema         : mecanica_pro

 Target Server Type    : MySQL
 Target Server Version : 100529 (10.5.29-MariaDB)
 File Encoding         : 65001

 Date: 25/04/2026 11:49:55
*/

DROP DATABASE IF EXISTS `mecanica_pro`;
CREATE DATABASE `mecanica_pro` CHARACTER SET = utf8mb4 
COLLATE = utf8mb4_unicode_ci;
USE `mecanica_pro`;

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of clientes
-- ----------------------------
INSERT INTO `clientes` VALUES (1, 'Manuel Aguado Sierra', 'DNI', '42799312', '972781904', 'systemcraft.pe@gmail.com', 'Santa Anita', 'natural', 0.00, 0.00, NULL, 1, '2026-04-25 17:03:25', '2026-04-25 17:03:25');

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
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of comprobantes
-- ----------------------------
INSERT INTO `comprobantes` VALUES (1, 1, NULL, 'nota_venta', 'NV01-00000001', 'NV01', 1, 'yape', 200.00, 0.00, 0.00, 200.00, 0, '2026-04-25 17:37:41', 1, '2026-04-25 17:37:41');

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
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of comprobantes_detalle
-- ----------------------------
INSERT INTO `comprobantes_detalle` VALUES (1, 1, 'Lavado', 1, 50.00, 50.00);
INSERT INTO `comprobantes_detalle` VALUES (2, 1, 'Cambio de Motor', 1, 150.00, 150.00);

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of ordenes_trabajo
-- ----------------------------
INSERT INTO `ordenes_trabajo` VALUES (1, 'OT-000001', 1, 1, 1, 1, 'terminado', 'normal', 25000, NULL, 'Reparacion de Motor', 'Rayaduras leves ', NULL, 0.00, 0.00, NULL, NULL, NULL, 1, '2026-04-25 17:08:49', '2026-04-25 18:24:24');

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of ot_historial
-- ----------------------------
INSERT INTO `ot_historial` VALUES (1, 1, NULL, 'pendiente', 'OT creada', 1, '2026-04-25 17:08:49');
INSERT INTO `ot_historial` VALUES (2, 1, 'pendiente', 'diagnostico', 'Cambio a diagnostico', 2, '2026-04-25 17:30:48');
INSERT INTO `ot_historial` VALUES (3, 1, 'diagnostico', 'aprobado', 'Cambio a aprobado', 2, '2026-04-25 17:31:14');
INSERT INTO `ot_historial` VALUES (4, 1, 'aprobado', 'en_proceso', 'Cambio a en_proceso', 2, '2026-04-25 17:31:22');
INSERT INTO `ot_historial` VALUES (5, 1, 'en_proceso', 'terminado', 'Cambio a terminado', 1, '2026-04-25 18:24:24');

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of ot_servicios
-- ----------------------------

-- ----------------------------
-- Table structure for portal_tokens
-- ----------------------------
DROP TABLE IF EXISTS `portal_tokens`;
CREATE TABLE `portal_tokens`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `ot_id` int UNSIGNED NOT NULL,
  `token` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `ot_id`(`ot_id` ASC) USING BTREE,
  UNIQUE INDEX `token`(`token` ASC) USING BTREE,
  INDEX `idx_token`(`token` ASC) USING BTREE,
  CONSTRAINT `portal_tokens_ibfk_1` FOREIGN KEY (`ot_id`) REFERENCES `ordenes_trabajo` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of portal_tokens
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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
-- Table structure for rol_permisos
-- ----------------------------
DROP TABLE IF EXISTS `rol_permisos`;
CREATE TABLE `rol_permisos`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `rol_id` int UNSIGNED NOT NULL,
  `modulo` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ver` tinyint(1) NULL DEFAULT 0,
  `crear` tinyint(1) NULL DEFAULT 0,
  `editar` tinyint(1) NULL DEFAULT 0,
  `eliminar` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_rol_modulo`(`rol_id` ASC, `modulo` ASC) USING BTREE,
  CONSTRAINT `rol_permisos_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 71 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of rol_permisos
-- ----------------------------
INSERT INTO `rol_permisos` VALUES (1, 1, 'dashboard', 1, 1, 1, 1);
INSERT INTO `rol_permisos` VALUES (2, 1, 'ots', 1, 1, 1, 1);
INSERT INTO `rol_permisos` VALUES (3, 1, 'clientes', 1, 1, 1, 1);
INSERT INTO `rol_permisos` VALUES (4, 1, 'vehiculos', 1, 1, 1, 1);
INSERT INTO `rol_permisos` VALUES (5, 1, 'inventario', 1, 1, 1, 1);
INSERT INTO `rol_permisos` VALUES (6, 1, 'servicios', 1, 1, 1, 1);
INSERT INTO `rol_permisos` VALUES (7, 1, 'tecnicos', 1, 1, 1, 1);
INSERT INTO `rol_permisos` VALUES (8, 1, 'ventas', 1, 1, 1, 1);
INSERT INTO `rol_permisos` VALUES (9, 1, 'caja', 1, 1, 1, 1);
INSERT INTO `rol_permisos` VALUES (10, 1, 'compras', 1, 1, 1, 1);
INSERT INTO `rol_permisos` VALUES (11, 1, 'reportes', 1, 1, 1, 1);
INSERT INTO `rol_permisos` VALUES (12, 1, 'whatsapp', 1, 1, 1, 1);
INSERT INTO `rol_permisos` VALUES (13, 1, 'roles', 1, 1, 1, 1);
INSERT INTO `rol_permisos` VALUES (14, 1, 'config', 1, 1, 1, 1);
INSERT INTO `rol_permisos` VALUES (15, 2, 'dashboard', 1, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (16, 2, 'ots', 1, 1, 1, 0);
INSERT INTO `rol_permisos` VALUES (17, 2, 'clientes', 1, 1, 1, 0);
INSERT INTO `rol_permisos` VALUES (18, 2, 'vehiculos', 1, 1, 1, 0);
INSERT INTO `rol_permisos` VALUES (19, 2, 'inventario', 1, 1, 1, 0);
INSERT INTO `rol_permisos` VALUES (20, 2, 'servicios', 1, 1, 1, 0);
INSERT INTO `rol_permisos` VALUES (21, 2, 'tecnicos', 1, 1, 1, 0);
INSERT INTO `rol_permisos` VALUES (22, 2, 'ventas', 1, 1, 0, 0);
INSERT INTO `rol_permisos` VALUES (23, 2, 'caja', 1, 1, 0, 0);
INSERT INTO `rol_permisos` VALUES (24, 2, 'compras', 1, 1, 0, 0);
INSERT INTO `rol_permisos` VALUES (25, 2, 'reportes', 1, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (26, 2, 'whatsapp', 1, 1, 0, 0);
INSERT INTO `rol_permisos` VALUES (27, 2, 'roles', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (28, 2, 'config', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (29, 3, 'dashboard', 1, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (30, 3, 'ots', 1, 1, 1, 0);
INSERT INTO `rol_permisos` VALUES (31, 3, 'clientes', 1, 1, 1, 0);
INSERT INTO `rol_permisos` VALUES (32, 3, 'vehiculos', 1, 1, 1, 0);
INSERT INTO `rol_permisos` VALUES (33, 3, 'inventario', 1, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (34, 3, 'servicios', 1, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (35, 3, 'tecnicos', 1, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (36, 3, 'ventas', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (37, 3, 'caja', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (38, 3, 'compras', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (39, 3, 'reportes', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (40, 3, 'whatsapp', 1, 1, 0, 0);
INSERT INTO `rol_permisos` VALUES (41, 3, 'roles', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (42, 3, 'config', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (43, 4, 'dashboard', 1, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (44, 4, 'ots', 1, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (45, 4, 'clientes', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (46, 4, 'vehiculos', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (47, 4, 'inventario', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (48, 4, 'servicios', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (49, 4, 'tecnicos', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (50, 4, 'ventas', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (51, 4, 'caja', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (52, 4, 'compras', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (53, 4, 'reportes', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (54, 4, 'whatsapp', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (55, 4, 'roles', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (56, 4, 'config', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (57, 5, 'dashboard', 1, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (58, 5, 'ots', 1, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (59, 5, 'clientes', 1, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (60, 5, 'vehiculos', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (61, 5, 'inventario', 1, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (62, 5, 'servicios', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (63, 5, 'tecnicos', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (64, 5, 'ventas', 1, 1, 0, 0);
INSERT INTO `rol_permisos` VALUES (65, 5, 'caja', 1, 1, 1, 0);
INSERT INTO `rol_permisos` VALUES (66, 5, 'compras', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (67, 5, 'reportes', 1, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (68, 5, 'whatsapp', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (69, 5, 'roles', 0, 0, 0, 0);
INSERT INTO `rol_permisos` VALUES (70, 5, 'config', 0, 0, 0, 0);

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
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of taller_config
-- ----------------------------
INSERT INTO `taller_config` VALUES (1, 'Mi Taller Mecánico', '10000000001', '999000001', NULL, 'Lima, Perú', NULL, 'B001', 'F001', 18.00, 1, 0, 0, 1, 'PEN', '2026-04-17 18:00:45', '2026-04-25 17:37:41');

-- ----------------------------
-- Table structure for tecnicos
-- ----------------------------
DROP TABLE IF EXISTS `tecnicos`;
CREATE TABLE `tecnicos`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id` int UNSIGNED NULL DEFAULT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `especialidad` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `comision_pct` decimal(5, 2) NULL DEFAULT 0.00,
  `salario_base` decimal(10, 2) NULL DEFAULT 0.00,
  `activo` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `usuario_id`(`usuario_id` ASC) USING BTREE,
  CONSTRAINT `fk_tec_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of tecnicos
-- ----------------------------
INSERT INTO `tecnicos` VALUES (1, NULL, 'Carlos Ramírez', 'Motor y mecánica general', '987654321', NULL, 15.00, 1800.00, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `tecnicos` VALUES (2, NULL, 'Luis Torres', 'Electricidad y diagnosis', '976543210', NULL, 12.00, 1600.00, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `tecnicos` VALUES (3, NULL, 'Pedro Quispe', 'Frenos y suspensión', '965432109', NULL, 12.00, 1600.00, 1, '2026-04-17 18:00:45', '2026-04-17 18:00:45');
INSERT INTO `tecnicos` VALUES (4, 5, 'María Flores', 'Motos y general', '954321098', NULL, 10.00, 1400.00, 1, '2026-04-17 18:00:45', '2026-04-25 17:23:21');

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
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of usuarios
-- ----------------------------
INSERT INTO `usuarios` VALUES (1, 1, 'Administrador', 'admin', 'admin@taller.com', '$2a$12$ejvjeWzzU6oCogrHsPqzlu9KIf/hiDjPNDkKWfxxgsijp2rlIbFFm', 1, '2026-04-25 18:23:23', '2026-04-17 18:00:45', '2026-04-25 18:23:23');
INSERT INTO `usuarios` VALUES (2, 4, 'Carlos Ramírez', 'carlos', 'carlos@taller.com', '$2a$12$D.J1InB8RO55CMOyTNfiC.rBRgpgTM3RMFvPg8B2FKYxdty.xKj9C', 1, '2026-04-25 17:29:42', '2026-04-25 17:23:16', '2026-04-25 17:29:42');
INSERT INTO `usuarios` VALUES (3, 4, 'Luis Torres', 'luis', 'luis@taller.com', '$2a$12$D.J1InB8RO55CMOyTNfiC.rBRgpgTM3RMFvPg8B2FKYxdty.xKj9C', 1, NULL, '2026-04-25 17:23:16', '2026-04-25 17:29:28');
INSERT INTO `usuarios` VALUES (4, 4, 'Pedro Quispe', 'pedro', 'pedro@taller.com', '$2a$12$D.J1InB8RO55CMOyTNfiC.rBRgpgTM3RMFvPg8B2FKYxdty.xKj9C', 1, NULL, '2026-04-25 17:23:16', '2026-04-25 17:29:28');
INSERT INTO `usuarios` VALUES (5, 4, 'María Flores', 'maria', 'maria@taller.com', '$2a$12$D.J1InB8RO55CMOyTNfiC.rBRgpgTM3RMFvPg8B2FKYxdty.xKj9C', 1, NULL, '2026-04-25 17:23:16', '2026-04-25 17:29:28');

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
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of vehiculos
-- ----------------------------
INSERT INTO `vehiculos` VALUES (1, 1, 'URYFD67', 'kia', 'Sorento', 2024, 'auto', 'Plomo', NULL, NULL, 'gasolina', 25000, NULL, 1, '2026-04-25 17:06:57', '2026-04-25 17:06:57');

-- ----------------------------
-- Table structure for wa_log
-- ----------------------------
DROP TABLE IF EXISTS `wa_log`;
CREATE TABLE `wa_log`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `cliente_id` int UNSIGNED NOT NULL,
  `ot_id` int UNSIGNED NULL DEFAULT NULL,
  `mensaje` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `usuario_id` int UNSIGNED NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `cliente_id`(`cliente_id` ASC) USING BTREE,
  INDEX `ot_id`(`ot_id` ASC) USING BTREE,
  INDEX `usuario_id`(`usuario_id` ASC) USING BTREE,
  CONSTRAINT `wa_log_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `wa_log_ibfk_2` FOREIGN KEY (`ot_id`) REFERENCES `ordenes_trabajo` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `wa_log_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of wa_log
-- ----------------------------

-- ----------------------------
-- Table structure for wa_plantillas
-- ----------------------------
DROP TABLE IF EXISTS `wa_plantillas`;
CREATE TABLE `wa_plantillas`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('ot_creada','presupuesto','en_proceso','listo','entregado','personalizado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'personalizado',
  `mensaje` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of wa_plantillas
-- ----------------------------
INSERT INTO `wa_plantillas` VALUES (1, 'OT Creada', 'ot_creada', 'Hola {cliente} ������\n\nHemos recibido su vehículo *{placa} - {marca} {modelo}*.\n\n������ OT: *{codigo}*\n������ Estado: En revisión\n\nSiga el progreso:\n{portal_url}', 1, '2026-04-25 17:50:45', '2026-04-25 17:50:45');
INSERT INTO `wa_plantillas` VALUES (2, 'Presupuesto listo', 'presupuesto', 'Hola {cliente} ������\n\nTenemos el diagnóstico de su *{placa}*.\n\n������ OT: *{codigo}*\n������ Presupuesto: *{total_estimado}*\n\nVer detalle:\n{portal_url}', 1, '2026-04-25 17:50:45', '2026-04-25 17:50:45');
INSERT INTO `wa_plantillas` VALUES (3, 'En reparación', 'en_proceso', 'Hola {cliente} ������\n\nSu vehículo *{placa}* está siendo reparado por *{tecnico}*.\n\nSiga el avance:\n{portal_url}', 1, '2026-04-25 17:50:45', '2026-04-25 17:50:45');
INSERT INTO `wa_plantillas` VALUES (4, 'Vehículo listo', 'listo', 'Hola {cliente} ✅\n\n¡Su *{placa}* está listo!\n\n������ Total: *{total_real}*\n\nPuede pasar a recogerlo.\n{portal_url}', 1, '2026-04-25 17:50:45', '2026-04-25 17:50:45');
INSERT INTO `wa_plantillas` VALUES (5, 'Entregado', 'entregado', 'Hola {cliente} ������\n\nGracias por confiar en nosotros. Su *{placa}* fue entregado. ¡Hasta la próxima!', 1, '2026-04-25 17:50:45', '2026-04-25 17:50:45');

SET FOREIGN_KEY_CHECKS = 1;
