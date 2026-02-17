#!/usr/bin/env bash
# Use this script to stop docker containers and processes running on the database port

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux) - https://learn.microsoft.com/en-us/windows/wsl/install
# 2. Install Docker Desktop or Podman Deskop
# - Docker Desktop for Windows - https://docs.docker.com/docker-for-windows/install/
# - Podman Desktop - https://podman.io/getting-started/installation
# 3. Open WSL - `wsl`
# 4. Run this script - `./stop-database.sh`

# On Linux and macOS you can run this script directly - `./stop-database.sh`

# import env variables from .env
set -a
source .env

DB_PORT=$(echo "$DATABASE_URL" | awk -F':' '{print $4}' | awk -F'\/' '{print $1}')

if [ -z "$DB_PORT" ]; then
  echo "Error: Could not extract database port from DATABASE_URL"
  exit 1
fi

# Check if port is actually in use (using same method as start-database.sh)
if command -v nc >/dev/null 2>&1; then
  if ! nc -z localhost "$DB_PORT" 2>/dev/null; then
    echo "Port $DB_PORT is not in use."
    exit 0
  fi
else
  echo "Warning: Unable to check if port $DB_PORT is in use (netcat not installed)"
  read -p "Do you want to continue anyway? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborting."
    exit 0
  fi
fi

echo "Port $DB_PORT is in use. Checking for Docker containers and processes..."

# Check for Docker/Podman containers first
if [ -x "$(command -v docker)" ] || [ -x "$(command -v podman)" ]; then
  if [ -x "$(command -v docker)" ]; then
    DOCKER_CMD="docker"
  else
    DOCKER_CMD="podman"
  fi

  # Check if Docker daemon is running
  if ! $DOCKER_CMD info > /dev/null 2>&1; then
    echo "Warning: $DOCKER_CMD daemon is not running. Skipping container checks."
  else
    # Get all running containers and check their port mappings
    # Use docker ps to get containers with their port info directly
    CONTAINERS_FOUND=false
    
    while IFS='|' read -r CONTAINER_ID CONTAINER_NAME PORT_INFO; do
      # Check if port info contains the target port on the host side
      # Format examples: "0.0.0.0:5432->5432/tcp" or "0.0.0.0:5432->5432/tcp, [::]:5432->5432/tcp"
      if echo "$PORT_INFO" | grep -qE ":$DB_PORT->"; then
        if [ "$CONTAINERS_FOUND" = false ]; then
          echo "Found Docker containers using port $DB_PORT:"
          CONTAINERS_FOUND=true
        fi
        echo "  - $CONTAINER_NAME ($CONTAINER_ID)"
      fi
    done < <($DOCKER_CMD ps --format "{{.ID}}|{{.Names}}|{{.Ports}}")
    
    if [ "$CONTAINERS_FOUND" = true ]; then
      read -p "Stop these containers? [y/N]: " -r REPLY
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        while IFS='|' read -r CONTAINER_ID CONTAINER_NAME PORT_INFO; do
          if echo "$PORT_INFO" | grep -qE ":$DB_PORT->"; then
            if $DOCKER_CMD stop "$CONTAINER_ID" 2>/dev/null; then
              echo "Stopped container $CONTAINER_NAME ($CONTAINER_ID)"
            fi
          fi
        done < <($DOCKER_CMD ps --format "{{.ID}}|{{.Names}}|{{.Ports}}")
        
        # Verify port is now free
        if command -v nc >/dev/null 2>&1; then
          sleep 1
          if ! nc -z localhost "$DB_PORT" 2>/dev/null; then
            echo ""
            echo "Port $DB_PORT is now free."
            exit 0
          fi
        fi
      fi
    fi
  fi
fi

# Now check for other processes using the port
FOUND_PROCESSES=false

# Using lsof if available (Linux/macOS)
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -ti ":$DB_PORT" 2>/dev/null)
  
  if [ -n "$PIDS" ]; then
    FOUND_PROCESSES=true
    echo ""
    echo "Found processes on port $DB_PORT:"
    lsof -i ":$DB_PORT" 2>/dev/null
    
    echo ""
    read -p "Kill these processes? [y/N]: " -r REPLY
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "$PIDS" | xargs kill -9 2>/dev/null
      echo "Killed all processes on port $DB_PORT"
    fi
  fi

# Fallback to ss if available
elif command -v ss >/dev/null 2>&1; then
  PIDS=$(ss -lptn "sport = :$DB_PORT" 2>/dev/null | grep -oP 'pid=\K\d+' | sort -u)
  
  if [ -n "$PIDS" ]; then
    FOUND_PROCESSES=true
    echo ""
    echo "Found processes on port $DB_PORT:"
    for PID in $PIDS; do
      ps -p "$PID" -o pid,cmd 2>/dev/null
    done
    
    echo ""
    read -p "Kill these processes? [y/N]: " -r REPLY
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      for PID in $PIDS; do
        kill -9 "$PID" 2>/dev/null
      done
      echo "Killed all processes on port $DB_PORT"
    fi
  fi

# Fallback to fuser if available
elif command -v fuser >/dev/null 2>&1; then
  PIDS=$(fuser "$DB_PORT/tcp" 2>/dev/null | awk '{print $1}')
  
  if [ -n "$PIDS" ]; then
    FOUND_PROCESSES=true
    echo ""
    echo "Found processes on port $DB_PORT:"
    for PID in $PIDS; do
      ps -p "$PID" -o pid,cmd 2>/dev/null
    done
    
    echo ""
    read -p "Kill these processes? [y/N]: " -r REPLY
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      fuser -k "$DB_PORT/tcp" 2>/dev/null
      echo "Killed all processes on port $DB_PORT"
    fi
  fi
fi

# Final verification
if command -v nc >/dev/null 2>&1; then
  if ! nc -z localhost "$DB_PORT" 2>/dev/null; then
    echo ""
    echo "Port $DB_PORT is now free."
  else
    echo ""
    echo "Warning: Port $DB_PORT is still in use. You may need to manually investigate."
  fi
fi

