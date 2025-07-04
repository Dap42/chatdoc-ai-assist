#!/bin/bash

# Navigate to the application directory (relative to this script)
cd "$(dirname "$0")"

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Activate the virtual environment (assuming venv is in the backend directory)
source venv/bin/activate

# Start Gunicorn
exec venv/bin/gunicorn --workers 3 --bind 0.0.0.0:8000 --timeout 300  main:app
