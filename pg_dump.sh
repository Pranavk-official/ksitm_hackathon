#!/bin/bash

# PostgreSQL Backup & Restore Script

# Configurations
BACKUP_DIR="$HOME/pg_dumps"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="postgres"
DB_PASSWORD="postgres"

# Ensure pg-dumps folder exists
mkdir -p "$BACKUP_DIR"

# Timestamp for backup
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
FILENAME="$BACKUP_DIR/${DB_NAME}_backup_$TIMESTAMP.sql"

# Function to perform backup
backup_db() {
    echo "Starting backup..."
    PGPASSWORD="$DB_PASSWORD" pg_dump -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -F p -f "$FILENAME"
    if [ $? -eq 0 ]; then
        echo "Backup successful: $FILENAME"
    else
        echo "Backup failed!"
        exit 1
    fi
}

# Function to perform restore
restore_db() {
    if [ -z "$1" ]; then
        echo "Please provide the backup file to restore."
        exit 1
    fi
    BACKUP_FILE="$1"
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "Backup file not found: $BACKUP_FILE"
        exit 1
    fi

    echo "Starting restore from $BACKUP_FILE..."
    PGPASSWORD="$DB_PASSWORD" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -f "$BACKUP_FILE"
    if [ $? -eq 0 ]; then
        echo "Restore successful."
    else
        echo "Restore failed!"
        exit 1
    fi
}

# Main logic
case "$1" in
    -b|backup)
        backup_db
        ;;
    -r|restore)
        restore_db "$2"
        ;;
    *)
        echo "Usage: $0 -b (backup) | -r <file.sql> (restore)"
        exit 1
        ;;
esac