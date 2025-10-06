#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting Manufacturing Management System..."

# Change to backend directory
cd /app/backend

# Run database setup if needed
echo "📊 Setting up database..."
npm run prod-setup || echo "⚠️  Database setup failed, continuing anyway..."

# Start the server
echo "🌐 Starting server..."
exec node server.js
