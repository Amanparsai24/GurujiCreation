#!/bin/sh
# Run migrations to setup database if real credentials are provided
if [ "$DB_HOST" != "placeholder_host" ]; then
    php artisan migrate --force
else
    echo "Skipping migrations because DB_HOST is placeholder_host"
fi

# Start Apache in the foreground
apache2-foreground
