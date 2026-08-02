#!/bin/bash
set -e

echo "Starting DineFlow Deployment..."

# Validate .env exists
if [ ! -f apps/web/.env ]; then
    echo "Error: apps/web/.env does not exist!"
    exit 1
fi

# Pull latest code
git pull origin main || echo "Not a git repo, skipping pull"

# Build containers
docker compose build

# Start services (recreates if needed)
docker compose up -d

# Run DB Migrations inside the running container
echo "Running Prisma Migrations..."
docker compose exec web npx prisma migrate deploy

echo "Deployment Complete! Checking health..."
sleep 5
docker compose ps
