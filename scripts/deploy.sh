#!/bin/bash
set -e # Exit immediately if a command fails.

# --- Configuration ---
# IMPORTANT: Update this path to your project's location on the OCI server.
PROJECT_DIR="/var/www/DesafioTecnico"

# --- Deployment ---
echo "Navigating to project directory: $PROJECT_DIR"
cd $PROJECT_DIR

echo "Pulling latest code from GitHub..."
git pull origin main

echo "Building and restarting services with Docker Compose..."
docker-compose up --build -d

echo "Cleaning up unused Docker images..."
docker image prune -f

echo "Deployment finished successfully!"
