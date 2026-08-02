#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +"%Y%m%d_%H%M%S")
FILENAME="dineflow_db_$DATE.sql"
RETENTION_DAYS=7

echo "Starting database backup at $DATE"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Run pg_dump inside the docker container
docker compose exec -T db pg_dump -U dineflow dineflow > "$BACKUP_DIR/$FILENAME"

# Compress the backup
gzip "$BACKUP_DIR/$FILENAME"

# Delete old backups
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup complete: $BACKUP_DIR/$FILENAME.gz"
