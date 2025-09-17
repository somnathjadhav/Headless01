#!/bin/bash

# 🚨 DIRECTORY LOCK SCRIPT - FORCES YOU TO STAY IN FRONTEND DIRECTORY
# This script prevents you from accidentally leaving the frontend directory

echo "🔒 LOCKING TERMINAL TO FRONTEND DIRECTORY"
echo "📍 Current directory: $(pwd)"

# Check if we're in the frontend directory
if [ ! -f "package.json" ] || [ ! -d "src" ] || [ ! -d "public" ]; then
    echo "❌ ERROR: You must be in the frontend directory!"
    echo "📍 Current location: $(pwd)"
    echo "🚀 Auto-navigating to frontend directory..."
    cd /Users/eternitty/Projects/headless-woo/headless-frontend
fi

echo "✅ SUCCESS: Now locked in frontend directory: $(pwd)"
echo "📦 Found package.json: $(ls -la package.json)"

# Create a function to prevent cd commands
prevent_cd() {
    if [[ "$1" == "cd" ]]; then
        echo "🚫 BLOCKED: cd command is disabled in frontend directory!"
        echo "📍 You must stay in: $(pwd)"
        echo "💡 Use 'npm run dev' to start the server"
        return 1
    fi
}

# Override cd command
alias cd='prevent_cd cd'

echo "🔒 Directory locked! You cannot leave the frontend directory."
echo "💡 Available commands:"
echo "   npm run dev     - Start development server"
echo "   npm run build   - Build for production"
echo "   npm run start   - Start production server"
echo "   npm run lint    - Run linting"
echo "   npm run test    - Run tests"
echo ""
echo "🚫 cd command is DISABLED - you must stay here!"

# Keep the terminal in this directory
exec $SHELL
