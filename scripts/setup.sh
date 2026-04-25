#!/bin/bash
# ================================================================
#  MecánicaPro — Setup AlmaLinux
#  Ruta: https://magus-ecommerce.com/mecanica/
#  SSL ya configurado — no se toca Certbot
#  Uso: chmod +x setup.sh && sudo ./setup.sh
# ================================================================
set -e

APP_DIR="/var/www/html/mecanica"
DB_NAME="mecanica_pro"
DB_USER="mecanica_user"
DOMAIN="magus-ecommerce.com"
BASE_PATH="/mecanica"

echo "============================================"
echo "   MecánicaPro — Setup AlmaLinux           "
echo "   URL: https://$DOMAIN$BASE_PATH/         "
echo "============================================"
echo ""

# 1. Verificar dependencias
echo "[1/6] Verificando dependencias..."
command -v node  >/dev/null || { echo "ERROR: Node.js no encontrado"; exit 1; }
command -v mysql >/dev/null || { echo "ERROR: MariaDB no encontrado"; exit 1; }
command -v httpd >/dev/null || { echo "ERROR: httpd no encontrado"; exit 1; }
command -v pm2   >/dev/null || { echo "ERROR: PM2 no encontrado. Instala con: npm install -g pm2"; exit 1; }
echo "OK - Node $(node -v) | httpd | MariaDB | PM2"
echo ""

# 2. SELinux
echo "[2/6] Configurando SELinux para ProxyPass..."
if command -v setsebool >/dev/null 2>&1; then
  setsebool -P httpd_can_network_connect 1
  echo "OK - httpd_can_network_connect activado"
else
  echo "AVISO: setsebool no encontrado, omitiendo"
fi
echo ""

# 3. Directorios
echo "[3/6] Preparando directorios..."
mkdir -p "$APP_DIR/backend/uploads"
mkdir -p "$APP_DIR/backend/logs"
chmod 755 "$APP_DIR/backend/uploads"
chown -R apache:apache "$APP_DIR/frontend"
chown -R apache:apache "$APP_DIR/backend/uploads"
echo "OK"
echo ""

# 4. Base de datos
echo "[4/6] Configurando base de datos..."
read -p "Usuario root de MariaDB [root]: " DB_ROOT
DB_ROOT="${DB_ROOT:-root}"
read -sp "Password root de MariaDB: " DB_ROOT_PASS
echo ""
read -sp "Elige password para el usuario '$DB_USER': " DB_PASS
echo ""
echo ""

mysql -u "$DB_ROOT" -p"$DB_ROOT_PASS" <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL
echo "OK - Base de datos lista"

echo "Importando schema..."
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$APP_DIR/backend/database.sql"
echo "OK - Schema importado"
echo ""

# 5. .env + npm install + PM2
echo "[5/6] Configurando backend..."
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
cat > "$APP_DIR/backend/.env" <<ENV
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=8h
CORS_ORIGIN=https://${DOMAIN}
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
ENV

cd "$APP_DIR/backend"
npm install --production
echo "OK - Dependencias instaladas"

pm2 delete mecanica_pro 2>/dev/null || true
pm2 start "$APP_DIR/backend/src/app.js" \
  --name mecanica_pro \
  --env production \
  --log "$APP_DIR/backend/logs/app.log" \
  --error "$APP_DIR/backend/logs/error.log" \
  --time
pm2 save
env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root 2>/dev/null | tail -1 | bash 2>/dev/null || true
echo "OK - PM2 corriendo en puerto 3001"
echo ""

# 6. httpd — agregar bloque al VirtualHost existente
echo "[6/6] Configurando httpd..."
cp "$APP_DIR/apache/mecanica_proxy.conf" /etc/httpd/conf.d/mecanica_proxy.conf
httpd -t && systemctl restart httpd
echo "OK - httpd reiniciado"
echo ""

echo "============================================"
echo "  Instalacion completada"
echo "  URL:      https://${DOMAIN}${BASE_PATH}/"
echo "  Usuario:  admin"
echo "  Password: admin123"
echo "  Cambia la contrasena en: Configuracion > Usuarios"
echo "============================================"
echo "  pm2 logs mecanica_pro"
echo "  pm2 restart mecanica_pro"
echo "  systemctl restart httpd"
echo "  tail -f $APP_DIR/backend/logs/error.log"
echo "============================================"
