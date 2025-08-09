#!/bin/bash

# Dynamic JSON Prompt Generator Setup Script
# This script helps you set up both frontend and backend

echo "🚀 Setting up Dynamic JSON Prompt Generator..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Setup Frontend
echo
echo "📦 Setting up Frontend..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Setup Backend
echo
echo "📦 Setting up Backend..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Create .env file
if [ ! -f .env ]; then
    echo
    echo "🔧 Creating backend .env file..."
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo "ℹ️  Edit backend/.env to add your API keys"
fi

cd ..

echo
echo "🎉 Setup complete!"
echo
echo "Next steps:"
echo "1. (Optional) Edit backend/.env to add your API keys"
echo "2. Start the backend: cd backend && npm run dev"
echo "3. Start the frontend: npm run dev"
echo "4. Open http://localhost:5173"
echo
echo "📚 For more information, see README.md"
