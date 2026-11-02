#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "============================================================"
echo " Starting NexPulse BPO Command Center & HRMS Platform"
echo " (100% Synthetic Privacy Compliant • Python + TypeScript)"
echo "============================================================"

# Ensure backend virtualenv exists
if [ ! -d "backend/venv" ]; then
    echo "Creating python virtualenv..."
    python3 -m venv backend/venv
    backend/venv/bin/pip install -r backend/requirements.txt
fi

# Ensure frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "Starting Backend (FastAPI on http://127.0.0.1:8000)..."
export PYTHONPATH=backend
backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

echo "Starting Frontend (Vite Dev Server on http://localhost:5173)..."
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!
cd ..

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

echo ""
echo "🚀 Platform is running!"
echo "   - Web App UI:       http://localhost:5173"
echo "   - FastAPI Swagger:  http://127.0.0.1:8000/docs"
echo "   - Privacy Mode:     Active (Zero PII, No Real Data, Fictional Contacts)"
echo ""
echo "Press [Ctrl+C] to stop."

wait

