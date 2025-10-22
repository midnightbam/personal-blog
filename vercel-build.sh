#!/bin/bash
set -x  # Enable debugging

echo "=== Starting build process ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo ""
echo "=== Listing root directory ==="
ls -la

echo ""
echo "=== Installing client dependencies ==="
cd client && pwd && npm install

echo ""
echo "=== Running client build ==="
npm run build

echo ""
echo "=== Build complete ==="
