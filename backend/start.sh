#!/bin/sh
# Run migrations to setup database
php artisan migrate --force

# Start Apache in the foreground
apache2-foreground
