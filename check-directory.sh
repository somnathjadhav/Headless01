#!/bin/bash

# 🚨 DIRECTORY SAFETY CHECK SCRIPT 🚨
# Run this before any npm commands!

echo "🔍 Checking if you're in the correct directory..."
echo ""

# Check current directory
CURRENT_DIR=$(pwd)
echo "📍 Current directory: $CURRENT_DIR"
echo ""

# Check if we're in the frontend directory
if [[ "$CURRENT_DIR" == */headless-frontend ]]; then
    echo "✅ CORRECT DIRECTORY! You're in the frontend folder."
    echo "✅ You can safely run npm commands here."
    echo ""
    
    # Check if package.json exists
    if [ -f "package.json" ]; then
        echo "📦 package.json found - all good!"
        echo "🚀 You can now run: npm run dev"
        echo ""
        echo "💡 PRO TIP: Use these smart aliases:"
        echo "   npmdev    - Auto-navigate and start dev server"
        echo "   npmstart  - Auto-navigate and start production server"
        echo "   npmbuild  - Auto-navigate and build project"
        echo ""
        echo "🎯 Or use: frontend (to get here quickly)"
    else
        echo "❌ package.json not found - something is wrong!"
        exit 1
    fi
    
elif [[ "$CURRENT_DIR" == */headless-woo ]]; then
    echo "❌ WRONG DIRECTORY! You're in the parent directory."
    echo "❌ NO npm commands should be run here!"
    echo ""
    echo "🔄 To fix this, use one of these:"
    echo "   frontend    - Go to frontend directory"
    echo "   npmdev      - Auto-navigate and start dev server"
    echo "   cd headless-frontend"
    echo ""
    echo "🚨 NEVER run npm commands from this directory!"
    exit 1
    
else
    echo "❌ UNKNOWN DIRECTORY! You're not in the project folder."
    echo "❌ Navigate to the project first."
    echo ""
    echo "🔄 Use: frontend (to go to frontend directory)"
    exit 1
fi

echo ""
echo "🎯 Directory check complete!"
echo ""
echo "💡 REMEMBER: Always use smart aliases to avoid directory confusion!"
