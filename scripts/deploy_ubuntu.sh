#!/bin/bash
# CIVIFIX Production Deployment & Backup Setup Script
# Run this on the Ubuntu 20.04 server as root/sudo

set -e

echo "🚀 Starting CIVIFIX Deployment Configuration..."

# 1. Update system & install dependencies
apt-get update
apt-get install -y nginx postgresql-14 postgis curl git ufw cron
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 2. Install PM2 globally for managing the backend
npm install -g pm2

# 3. Setup UFW Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
# Enable silently or interactively depending on script usage
ufw --force enable

# 4. Create Postgres backup script
cat << 'EOF' > /usr/local/bin/civifix-backup.sh
#!/bin/bash
BACKUP_DIR="/var/backups/civifix"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
mkdir -p "$BACKUP_DIR"

# Dump database
pg_dump -U postgres civicfix_db > "$BACKUP_DIR/db_backup_$DATE.sql"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -type f -name "*.sql" -mtime +7 -delete

# (Optional) Sync to AWS S3
# aws s3 sync "$BACKUP_DIR" s3://civifix-backups/ --region eu-west-1
EOF

chmod +x /usr/local/bin/civifix-backup.sh

# 5. Add backup to crontab (runs every day at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/civifix-backup.sh") | crontab -

echo "✅ Server dependencies installed, Firewall configured, Backup Cron Job added."
echo "➡️ Next steps:"
echo "1. Configure postgres database and run backend/database/schema.sql"
echo "2. Copy your code to /var/www/civifix"
echo "3. Run 'npm run build' in frontend, and 'pm2 start ecosystem.config.js' in backend"
echo "4. Copy the Nginx config and restart Nginx."
