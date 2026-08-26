#!/bin/sh

# Run migrations to setup database if real credentials are provided
if [ "$DB_HOST" != "placeholder_host" ]; then
    php artisan migrate --force
else
    echo "Skipping migrations because DB_HOST is placeholder_host"
fi

# Create storage symlink if it doesn't exist
php artisan storage:link || true

# Optimize Laravel to save memory
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start Laravel's built-in server (very low memory)
PORT=${PORT:-10000}
php artisan serve --host=0.0.0.0 --port=$PORT
