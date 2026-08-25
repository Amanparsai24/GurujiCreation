FROM php:8.2-cli-alpine

# Install required packages
RUN apk add --no-cache \
    curl \
    git \
    unzip \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    linux-headers \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql gd zip

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Fix script line endings
RUN sed -i 's/\r$//' start.sh && chmod +x start.sh

# Expose port
EXPOSE 8000

# Run
CMD ["/app/start.sh"]
