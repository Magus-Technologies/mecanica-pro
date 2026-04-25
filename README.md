# MecánicaPro — Apache + MariaDB + PM2

## Pasos para instalar

### 1. Subir al VPS
```bash
scp mecanica_pro.zip root@TU_IP:/var/www/
ssh root@TU_IP
cd /var/www && unzip mecanica_pro.zip
```

### 2. Ejecutar setup
```bash
chmod +x /var/www/mecanica_pro/scripts/setup.sh
sudo /var/www/mecanica_pro/scripts/setup.sh
```

El script hace:
- Activa los módulos Apache: proxy, proxy_http, rewrite, headers, ssl
- Crea la BD y usuario en MariaDB
- Importa el schema completo con datos iniciales
- Genera .env con JWT secret aleatorio
- Instala dependencias Node.js (npm install)
- Lanza el backend con PM2 en puerto 3001
- Configura el VirtualHost de Apache
- Opcionalmente obtiene SSL con Certbot

## Arquitectura

```
Internet
   │
   ▼
Apache :443  (magus-ecommerce.com)
   │
   ├── /           → /var/www/mecanica_pro/frontend/  (HTML estático)
   ├── /uploads/   → /var/www/mecanica_pro/backend/uploads/
   └── /api/       → ProxyPass → Node.js :3001
```

## Acceso inicial
- URL:      https://magus-ecommerce.com
- Usuario:  admin
- Password: admin123
- Cambia la contraseña en Configuración > Usuarios

## Comandos útiles
```bash
pm2 status
pm2 logs mecanica_pro
pm2 restart mecanica_pro
tail -f /var/www/mecanica_pro/backend/logs/error.log
systemctl reload apache2
mysqldump -u mecanica_user -p mecanica_pro > backup_$(date +%Y%m%d).sql
```
