-- Tablas que el commit f16525b necesita pero no incluyó en el dump.
-- Aplicar en local y en producción.

USE mecanica_pro;

CREATE TABLE IF NOT EXISTS rol_permisos (
  rol_id   INT UNSIGNED NOT NULL,
  modulo   VARCHAR(40)  NOT NULL,
  ver      TINYINT(1)   DEFAULT 0,
  crear    TINYINT(1)   DEFAULT 0,
  editar   TINYINT(1)   DEFAULT 0,
  eliminar TINYINT(1)   DEFAULT 0,
  PRIMARY KEY (rol_id, modulo),
  FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wa_plantillas (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(120) NOT NULL,
  tipo       VARCHAR(40),
  mensaje    TEXT NOT NULL,
  activo     TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wa_log (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id  INT UNSIGNED NOT NULL,
  ot_id       INT UNSIGNED NULL,
  mensaje     TEXT NOT NULL,
  telefono    VARCHAR(20),
  usuario_id  INT UNSIGNED NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cliente (cliente_id),
  INDEX idx_ot (ot_id),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (ot_id)      REFERENCES ordenes_trabajo(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portal_tokens (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ot_id      INT UNSIGNED NOT NULL UNIQUE,
  token      VARCHAR(32) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ot_id) REFERENCES ordenes_trabajo(id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
