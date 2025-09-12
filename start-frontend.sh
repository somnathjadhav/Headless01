#!/bin/bash

# 🚨 MASTER CONTROL SCRIPT - START FRONTEND SERVER
# This script will ALWAYS work regardless of where you run it from

echo "🚀 STARTING FRONTEND SERVER..."
echo "📍 Current directory: $(pwd)"

# FORCE navigation to frontend directory
cd /Users/eternitty/Projects/headless-woo/headless-frontend

# Verify we're in the right place
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: Still not in frontend directory!"
    echo "📍 Current location: $(pwd)"
    echo "🔍 Looking for package.json..."
    ls -la
    exit 1
fi

echo "✅ SUCCESS: Now in frontend directory: $(pwd)"
echo "📦 Found package.json: $(ls -la package.json)"

# Check if server is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "🔄 Server already running on port 3000"
    echo "🌐 Frontend available at: http://localhost:3000"
    echo "🛑 To stop server: pkill -f 'npm run dev'"
    exit 0
fi

echo "🚀 Starting Next.js development server..."
echo "⏳ Please wait for server to start..."
echo "🌐 Frontend will be available at: http://localhost:3000"

# Start the server in foreground (so you can see any errors)
npm run dev
