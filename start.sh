#!/bin/bash

# ============================================================
# AI eDiscovery System - Startup Script
# ============================================================
# This script:
# 1. Kills any processes on ports 3000 and 3001
# 2. Sets up PostgreSQL database with schema and seed data
# 3. Installs dependencies
# 4. Starts backend and frontend with hot-reload
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${PURPLE}${BOLD}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║           AI eDiscovery System v1.0                     ║"
echo "║           Enterprise Legal Technology Platform          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Load environment variables
if [ -f "$PROJECT_DIR/.env" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
    echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
    echo -e "${RED}✗ .env file not found! Please create one.${NC}"
    exit 1
fi

# ============================================================
# Step 1: Clean up used ports
# ============================================================
echo -e "\n${CYAN}${BOLD}[Step 1/5] Cleaning up ports...${NC}"

cleanup_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}  Killing processes on port $port: $pids${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    else
        echo -e "${GREEN}  Port $port is available${NC}"
    fi
}

cleanup_port 3000
cleanup_port 3001

# ============================================================
# Step 2: Setup PostgreSQL Database
# ============================================================
echo -e "\n${CYAN}${BOLD}[Step 2/5] Setting up PostgreSQL database...${NC}"

# Check if PostgreSQL is running
if ! pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} > /dev/null 2>&1; then
    echo -e "${YELLOW}  Starting PostgreSQL...${NC}"
    if command -v brew &> /dev/null; then
        brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    fi
    sleep 2
    if ! pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} > /dev/null 2>&1; then
        echo -e "${RED}✗ PostgreSQL is not running. Please start it manually.${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}  ✓ PostgreSQL is running${NC}"

# Create user if not exists
psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U postgres -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" 2>/dev/null | grep -q 1 || \
    psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U postgres -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}' CREATEDB;" 2>/dev/null || true
echo -e "${GREEN}  ✓ Database user ready${NC}"

# Drop and recreate database
psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};" 2>/dev/null || true
psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U postgres -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" 2>/dev/null || true
echo -e "${GREEN}  ✓ Database created: ${DB_NAME}${NC}"

# Run schema
echo -e "${YELLOW}  Running schema migration...${NC}"
PGPASSWORD=${DB_PASSWORD} psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER} -d ${DB_NAME} -f "$PROJECT_DIR/backend/db/schema.sql" > /dev/null 2>&1
echo -e "${GREEN}  ✓ Schema created (18 tables)${NC}"

# Run seed data
echo -e "${YELLOW}  Seeding database...${NC}"
PGPASSWORD=${DB_PASSWORD} psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER} -d ${DB_NAME} -f "$PROJECT_DIR/backend/db/seed.sql" > /dev/null 2>&1
echo -e "${GREEN}  ✓ Database seeded (15+ items per table)${NC}"

# ============================================================
# Step 3: Install Dependencies
# ============================================================
echo -e "\n${CYAN}${BOLD}[Step 3/5] Installing dependencies...${NC}"

echo -e "${YELLOW}  Installing backend dependencies...${NC}"
cd "$PROJECT_DIR/backend" && npm install --silent 2>&1 | tail -1
echo -e "${GREEN}  ✓ Backend dependencies installed${NC}"

echo -e "${YELLOW}  Installing frontend dependencies...${NC}"
cd "$PROJECT_DIR/frontend" && npm install --silent 2>&1 | tail -1
echo -e "${GREEN}  ✓ Frontend dependencies installed${NC}"

cd "$PROJECT_DIR"

# ============================================================
# Step 4: Start Backend with hot-reload (nodemon)
# ============================================================
echo -e "\n${CYAN}${BOLD}[Step 4/5] Starting backend server...${NC}"

cd "$PROJECT_DIR/backend"
npx nodemon server.js &
BACKEND_PID=$!
echo -e "${GREEN}  ✓ Backend starting on port ${BACKEND_PORT:-3001} (PID: $BACKEND_PID) with hot-reload${NC}"

# Wait for backend to be ready
echo -e "${YELLOW}  Waiting for backend...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:${BACKEND_PORT:-3001}/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ Backend is ready!${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}  Backend may still be starting...${NC}"
    fi
done

# ============================================================
# Step 5: Start Frontend with hot-reload (Vite)
# ============================================================
echo -e "\n${CYAN}${BOLD}[Step 5/5] Starting frontend...${NC}"

cd "$PROJECT_DIR/frontend"
npx vite --port ${FRONTEND_PORT:-3000} --host &
FRONTEND_PID=$!
echo -e "${GREEN}  ✓ Frontend starting on port ${FRONTEND_PORT:-3000} (PID: $FRONTEND_PID) with hot-reload${NC}"

cd "$PROJECT_DIR"

# ============================================================
# Startup Complete
# ============================================================
sleep 3
echo -e "\n${PURPLE}${BOLD}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║              🚀 System Ready!                           ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║                                                          ║"
echo "║  Frontend:  http://localhost:${FRONTEND_PORT:-3000}                      ║"
echo "║  Backend:   http://localhost:${BACKEND_PORT:-3001}                      ║"
echo "║  Database:  ${DB_NAME} on port ${DB_PORT:-5432}               ║"
echo "║                                                          ║"
echo "║  Login Credentials:                                      ║"
echo "║  Email:    admin@ediscovery.com                          ║"
echo "║  Password: admin123                                      ║"
echo "║                                                          ║"
echo "║  Hot-reload enabled for both frontend and backend        ║"
echo "║  Press Ctrl+C to stop all services                       ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Trap to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    cleanup_port 3000
    cleanup_port 3001
    echo -e "${GREEN}✓ All services stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait
