#!/bin/bash

# GitPersona Installation Script

set -e

echo "🚀 Installing GitPersona..."

# Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm >/dev/null 2>&1; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Install globally
echo "🌍 Installing globally..."
npm link

echo ""
echo "🎉 GitPersona installed successfully!"
echo ""
echo "Available commands:"
echo "  gitpersona show      - Show active persona"
echo "  gitpersona list      - List all personas"
echo "  gitpersona setup     - Setup new persona"
echo "  gitpersona activate  - Activate a persona"
echo "  gitpersona edit      - Edit a persona"
echo "  gitpersona delete    - Delete a persona"
echo "  gitpersona status    - Show overall status"
echo "  gitpersona check-auto - Check auto-activation"
echo ""
echo "To enable auto-activation, add this to your shell profile (.bashrc, .zshrc):"
echo "  source $(pwd)/scripts/auto-activate.sh"
echo ""
echo "For more information, run: gitpersona --help"
