#!/bin/sh
set -e

# Create and set permissions for the Nginx PID directory at runtime
mkdir -p /run/nginx
chown -R nginx:nginx /run/nginx

# Execute the original Nginx command
exec nginx -g 'daemon off;'
