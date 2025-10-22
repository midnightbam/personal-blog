#!/bin/sh
set -e

echo "=== Build Process Started ==="
echo "Working directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo ""

echo "=== Changing to client directory ==="
cd client
echo "Current directory: $(pwd)"
echo ""

echo "=== Running npm install ==="
npm install --legacy-peer-deps
echo "npm install completed with exit code: $?"
echo ""

echo "=== Running npm run build ==="
npm run build
echo "npm run build completed with exit code: $?"
echo ""

echo "=== Build Process Completed Successfully ==="
