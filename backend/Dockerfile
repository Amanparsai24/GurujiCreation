FROM php:8.2-apache

# Install dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_mysql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Optimize Apache memory limits for Render 512MB free tier
RUN echo "<IfModule mpm_prefork_module>\n\
    StartServers          1\n\
    MinSpareServers       1\n\
    MaxSpareServers       3\n\
    MaxRequestWorkers     10\n\
    MaxConnectionsPerChild 100\n\
</IfModule>" > /etc/apache2/mods-available/mpm_prefork.conf

# Set PHP memory limit
RUN echo "memory_limit = 128M" > /usr/local/etc/php/conf.d/memory-limit.ini

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Change Apache document root to public
RUN sed -i -e 's/html/html\/public/g' /etc/apache2/sites-available/000-default.conf

# Start script
COPY start.sh /usr/local/bin/start.sh
RUN sed -i 's/\r$//' /usr/local/bin/start.sh && \
    chmod +x /usr/local/bin/start.sh

CMD ["/usr/local/bin/start.sh"]
