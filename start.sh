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

set -Eeuo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
PROJECT_NAME="$(basename "$PROJECT_DIR")"

echo -e "${PURPLE}${BOLD}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║           AI eDiscovery System v1.0                     ║"
echo "║           Enterprise Legal Technology Platform          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Load environment variables
if [ -f "$PROJECT_DIR/.env" ]; then
    set -a
    # shellcheck source=/dev/null
    source "$PROJECT_DIR/.env"
    set +a
    echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
    echo -e "${RED}✗ .env file not found! Please create one.${NC}"
    exit 1
fi

derive_db_env_from_database_url() {
    if [ -z "${DATABASE_URL:-}" ]; then
        return
    fi

    local url="${DATABASE_URL#*://}"
    local auth_host="${url%%/*}"
    local db_path="${url#*/}"
    local auth=""
    local host_port=""

    DB_NAME="${DB_NAME:-${db_path%%\?*}}"

    if [[ "$auth_host" == *"@"* ]]; then
        auth="${auth_host%@*}"
        host_port="${auth_host#*@}"
        DB_USER="${DB_USER:-${auth%%:*}}"
        if [[ "$auth" == *":"* ]]; then
            DB_PASSWORD="${DB_PASSWORD:-${auth#*:}}"
        fi
    else
        host_port="$auth_host"
    fi

    DB_HOST="${DB_HOST:-${host_port%%:*}}"
    if [[ "$host_port" == *":"* ]]; then
        DB_PORT="${DB_PORT:-${host_port##*:}}"
    fi
}

derive_db_env_from_database_url

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-$(whoami)}"
DB_PASSWORD="${DB_PASSWORD:-}"

if [ -z "${DB_NAME:-}" ]; then
    echo -e "${RED}✗ DB_NAME is empty and could not be derived from DATABASE_URL.${NC}"
    echo -e "${YELLOW}  Add DB_NAME=aiediscoverysystem_db or DATABASE_URL=postgresql://user@localhost:5432/aiediscoverysystem_db${NC}"
    exit 1
fi

export DB_HOST DB_PORT DB_USER DB_PASSWORD DB_NAME

psql_with_optional_password() {
    if [ -n "${DB_PASSWORD:-}" ]; then
        PGPASSWORD="$DB_PASSWORD" psql "$@"
    else
        psql "$@"
    fi
}

# ============================================================
# Step 1: Clean up used ports
# ============================================================
echo -e "\n${CYAN}${BOLD}[Step 1/5] Cleaning up ports...${NC}"

cleanup_port() {
    local port=$1
    local pids
    local related_pids=""
    pids=$(lsof -tiTCP:"$port" -sTCP:LISTEN -n -P 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}  Killing processes on port $port: $pids${NC}"
        for pid in $pids; do
            local ppid
            ppid=$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ' || true)
            if [ -n "$ppid" ] && [ "$ppid" != "1" ]; then
                local parent_cmd
                parent_cmd=$(ps -o command= -p "$ppid" 2>/dev/null || true)
                if [[ "$parent_cmd" =~ nodemon|npm|vite|node ]]; then
                    related_pids="$related_pids $ppid"
                fi
            fi
        done
        kill -TERM $pids $related_pids 2>/dev/null || true
        sleep 0.5
        pids=$(lsof -tiTCP:"$port" -sTCP:LISTEN -n -P 2>/dev/null || true)
        if [ -n "$pids" ]; then
            kill -9 $pids $related_pids 2>/dev/null || true
            sleep 0.5
        fi
    else
        echo -e "${GREEN}  Port $port is available${NC}"
    fi
}

cleanup_project_watchers() {
    local pids
    pids=$(ps -axo pid=,command= | awk -v dir="$PROJECT_DIR" -v name="$PROJECT_NAME" '
        (index($0, dir) || index($0, name)) && ($0 ~ /nodemon|server\.js|vite/) { print $1 }
    ' | tr '\n' ' ')
    if [ -n "${pids// /}" ]; then
        echo -e "${YELLOW}  Stopping existing AIeDiscoverySystem watchers: $pids${NC}"
        kill -TERM $pids 2>/dev/null || true
        sleep 0.5
        pids=$(ps -axo pid=,command= | awk -v dir="$PROJECT_DIR" -v name="$PROJECT_NAME" '
            (index($0, dir) || index($0, name)) && ($0 ~ /nodemon|server\.js|vite/) { print $1 }
        ' | tr '\n' ' ')
        if [ -n "${pids// /}" ]; then
            kill -9 $pids 2>/dev/null || true
            sleep 0.5
        fi
    fi
}

wait_for_port_free() {
    local port=$1
    for _ in {1..20}; do
        if ! lsof -tiTCP:"$port" -sTCP:LISTEN -n -P >/dev/null 2>&1; then
            return 0
        fi
        sleep 0.25
    done
    echo -e "${RED}✗ Port $port is still in use after cleanup:${NC}"
    lsof -iTCP:"$port" -sTCP:LISTEN -n -P || true
    exit 1
}

cleanup_project_watchers
cleanup_port 3000
cleanup_port 3001
cleanup_project_watchers
wait_for_port_free 3000
wait_for_port_free 3001

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

DB_ADMIN_USER="${POSTGRES_ADMIN_USER:-postgres}"
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d postgres -c "SELECT 1;" >/dev/null 2>&1; then
    DB_ADMIN_USER="$DB_USER"
fi

# Create user if an admin role is available. Local macOS Postgres often already uses the current user.
if [ "$DB_ADMIN_USER" != "$DB_USER" ]; then
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d postgres -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" 2>/dev/null | grep -q 1 || \
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d postgres -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}' CREATEDB;"
fi
echo -e "${GREEN}  ✓ Database user ready: ${DB_USER}${NC}"

# Drop and recreate database
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d postgres -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
echo -e "${GREEN}  ✓ Database created: ${DB_NAME}${NC}"

# Run schema
echo -e "${YELLOW}  Running schema migration...${NC}"
psql_with_optional_password -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$PROJECT_DIR/backend/db/schema.sql"
echo -e "${GREEN}  ✓ Schema created (18 tables)${NC}"

# Run seed data
echo -e "${YELLOW}  Seeding database...${NC}"
psql_with_optional_password -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$PROJECT_DIR/backend/db/seed.sql"
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
    if [ -n "${BACKEND_PID:-}" ]; then kill "$BACKEND_PID" 2>/dev/null || true; fi
    if [ -n "${FRONTEND_PID:-}" ]; then kill "$FRONTEND_PID" 2>/dev/null || true; fi
    cleanup_project_watchers
    cleanup_port 3000
    cleanup_port 3001
    echo -e "${GREEN}✓ All services stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait
