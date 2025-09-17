#!/bin/bash

# Start Frontend Application
echo "🚀 Starting Frontend Application..."

# Navigate to the correct directory
cd "/Users/eternitty/Projects/Headless 0.1/frontend"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in current directory"
    exit 1
fi

# Use absolute path to npm to avoid alias issues
NPM_PATH="/usr/local/bin/npm"

# Check if npm exists
if [ ! -f "$NPM_PATH" ]; then
    echo "❌ Error: npm not found at $NPM_PATH"
    echo "Trying alternative npm paths..."
    NPM_PATH=$(which npm 2>/dev/null | grep -v "aliased" | head -1)
    if [ -z "$NPM_PATH" ]; then
        echo "❌ Error: npm not found"
        exit 1
    fi
fi

echo "✅ Using npm at: $NPM_PATH"
echo "✅ Starting Next.js development server..."

# Start the development server
exec "$NPM_PATH" run dev:network
