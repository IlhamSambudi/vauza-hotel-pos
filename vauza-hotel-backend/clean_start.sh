#!/bin/bash
echo "Stopping all Node.js processes..."
pkill -f "node" || true
lsof -ti :3000 | xargs kill -9 2>/dev/null || true

echo "Waiting for ports to clear..."
sleep 2

echo "Starting Vauza Hotel Backend..."
npm start
